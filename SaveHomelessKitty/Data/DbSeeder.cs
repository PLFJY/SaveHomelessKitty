using System.Data;
using Microsoft.EntityFrameworkCore;
using SaveHomelessKitty.Models;
using SaveHomelessKitty.Models.Enums;
using SaveHomelessKitty.Services;

namespace SaveHomelessKitty.Data;

/// <summary>
/// Lightweight database seed helper for MVP defaults.
/// </summary>
public static class DbSeeder
{
    /// <summary>
    /// Ensure baseline data exists (global default rule).
    /// </summary>
    /// <param name="db">Database context.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    public static async Task SeedAsync(
        AppDbContext db,
        PasswordHasher passwordHasher,
        IConfiguration configuration,
        CancellationToken cancellationToken)
    {
        await EnsureSchemaAsync(db, cancellationToken);
        var nowUtc = DateTime.UtcNow;
        var superAdminRole = await EnsureRoleAsync(db, "SuperAdmin", "System super administrator", nowUtc, cancellationToken);
        var adminRole = await EnsureRoleAsync(db, "Admin", "System administrator", nowUtc, cancellationToken);
        var visitorRole = await EnsureRoleAsync(db, "Visitor", "Read-only visitor", nowUtc, cancellationToken);

        await EnsureAdminUserAsync(db, passwordHasher, configuration, superAdminRole, adminRole, nowUtc, cancellationToken);
        await EnsureDefaultRolePermissionsAsync(db, superAdminRole, adminRole, visitorRole, cancellationToken);

        if (!db.FeedRules.Any(x => x.ScopeType == RuleScope.Global))
        {
            db.FeedRules.Add(new FeedRule
            {
                Id = Guid.NewGuid(),
                ScopeType = RuleScope.Global,
                ScopeId = null,
                Name = "Default rule",
                DailyLimitCount = 10,
                CooldownSeconds = 900,
                IsActive = true,
                CreatedAtUtc = nowUtc,
                UpdatedAtUtc = nowUtc
            });
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task EnsureSchemaAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        const string createRolePermissions = """
            CREATE TABLE IF NOT EXISTS "RolePermissions" (
                "RoleId" TEXT NOT NULL,
                "Permission" TEXT NOT NULL,
                CONSTRAINT "PK_RolePermissions" PRIMARY KEY ("RoleId", "Permission"),
                CONSTRAINT "FK_RolePermissions_Roles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "Roles" ("Id") ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS "IX_RolePermissions_Permission" ON "RolePermissions" ("Permission");
            """;

        await db.Database.ExecuteSqlRawAsync(createRolePermissions, cancellationToken);

        await TryAddColumnAsync(db, "Devices", "FoodRemainingGrams", "FoodRemainingGrams INTEGER NULL", cancellationToken);
        await TryAddColumnAsync(db, "Devices", "FoodDispensedTodayGrams", "FoodDispensedTodayGrams INTEGER NULL", cancellationToken);
        await TryAddColumnAsync(db, "Devices", "FoodDispensedTotalGrams", "FoodDispensedTotalGrams INTEGER NULL", cancellationToken);
        await TryAddColumnAsync(db, "Devices", "PairingCodeHash", "PairingCodeHash TEXT NULL", cancellationToken);
        await TryAddColumnAsync(db, "Devices", "PairingCodeIssuedAtUtc", "PairingCodeIssuedAtUtc TEXT NULL", cancellationToken);
        await TryAddColumnAsync(db, "Devices", "PairingCodeExpiresAtUtc", "PairingCodeExpiresAtUtc TEXT NULL", cancellationToken);

        const string repairDevices = """
            UPDATE "Devices" SET "IsActive" = 1 WHERE "IsActive" IS NULL;
            UPDATE "Devices" SET "Status" = 0 WHERE "Status" IS NULL;
            UPDATE "Devices" SET "CreatedAtUtc" = COALESCE("CreatedAtUtc", datetime('now')) WHERE "CreatedAtUtc" IS NULL;
            UPDATE "Devices" SET "UpdatedAtUtc" = COALESCE("UpdatedAtUtc", datetime('now')) WHERE "UpdatedAtUtc" IS NULL;
            """;
        await db.Database.ExecuteSqlRawAsync(repairDevices, cancellationToken);
    }

    private static async Task TryAddColumnAsync(
        AppDbContext db,
        string table,
        string columnName,
        string columnSql,
        CancellationToken cancellationToken)
    {
        if (await ColumnExistsAsync(db, table, columnName, cancellationToken))
        {
            return;
        }

        await db.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{table}\" ADD COLUMN {columnSql};", cancellationToken);
    }

    private static async Task<bool> ColumnExistsAsync(
        AppDbContext db,
        string table,
        string columnName,
        CancellationToken cancellationToken)
    {
        var connection = db.Database.GetDbConnection();
        var shouldClose = connection.State != ConnectionState.Open;
        if (shouldClose)
        {
            await db.Database.OpenConnectionAsync(cancellationToken);
        }

        try
        {
            await using var command = connection.CreateCommand();
            command.CommandText = $"PRAGMA table_info('{table}');";
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                var name = reader.GetString(1);
                if (string.Equals(name, columnName, StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
            return false;
        }
        finally
        {
            if (shouldClose)
            {
                await db.Database.CloseConnectionAsync();
            }
        }
    }

    private static async Task<Role> EnsureRoleAsync(
        AppDbContext db,
        string name,
        string description,
        DateTime nowUtc,
        CancellationToken cancellationToken)
    {
        var role = await db.Roles.FirstOrDefaultAsync(x => x.Name == name, cancellationToken);
        if (role != null)
        {
            return role;
        }

        role = new Role
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = description,
            CreatedAtUtc = nowUtc,
            UpdatedAtUtc = nowUtc
        };

        db.Roles.Add(role);
        await db.SaveChangesAsync(cancellationToken);
        return role;
    }

    private static async Task EnsureAdminUserAsync(
        AppDbContext db,
        PasswordHasher passwordHasher,
        IConfiguration configuration,
        Role superAdminRole,
        Role adminRole,
        DateTime nowUtc,
        CancellationToken cancellationToken)
    {
        var adminUsername = configuration["Admin:Username"] ?? "admin";
        var adminPassword = configuration["Admin:Password"] ?? "Admin@12345";
        var adminDisplayName = configuration["Admin:DisplayName"] ?? "System Admin";

        var admin = await db.Users.FirstOrDefaultAsync(x => x.Username == adminUsername, cancellationToken);
        if (admin == null)
        {
            admin = new User
            {
                Id = Guid.NewGuid(),
                Username = adminUsername,
                DisplayName = adminDisplayName,
                PasswordHash = passwordHasher.Hash(adminPassword),
                IsActive = true,
                CreatedAtUtc = nowUtc,
                UpdatedAtUtc = nowUtc
            };
            db.Users.Add(admin);
            await db.SaveChangesAsync(cancellationToken);
        }

        await EnsureUserRoleAsync(db, admin.Id, superAdminRole.Id, cancellationToken);
        await EnsureUserRoleAsync(db, admin.Id, adminRole.Id, cancellationToken);
    }

    private static async Task EnsureUserRoleAsync(AppDbContext db, Guid userId, Guid roleId, CancellationToken cancellationToken)
    {
        var exists = await db.UserRoles.AnyAsync(
            x => x.UserId == userId && x.RoleId == roleId,
            cancellationToken);
        if (!exists)
        {
            db.UserRoles.Add(new UserRole
            {
                UserId = userId,
                RoleId = roleId
            });
            await db.SaveChangesAsync(cancellationToken);
        }
    }

    private static async Task EnsureDefaultRolePermissionsAsync(
        AppDbContext db,
        Role superAdminRole,
        Role adminRole,
        Role visitorRole,
        CancellationToken cancellationToken)
    {
        await EnsureRolePermissionsAsync(db, superAdminRole, Permissions.GetDefaultPermissions(superAdminRole.Name), cancellationToken);
        await EnsureRolePermissionsAsync(db, adminRole, Permissions.GetDefaultPermissions(adminRole.Name), cancellationToken);
        await EnsureRolePermissionsAsync(db, visitorRole, Permissions.GetDefaultPermissions(visitorRole.Name), cancellationToken);

        var legacyViewer = await db.Roles.FirstOrDefaultAsync(x => x.Name == "Viewer", cancellationToken);
        if (legacyViewer != null)
        {
            await EnsureRolePermissionsAsync(db, legacyViewer, Permissions.GetDefaultPermissions(legacyViewer.Name), cancellationToken);
        }
    }

    private static async Task EnsureRolePermissionsAsync(
        AppDbContext db,
        Role role,
        IReadOnlyCollection<string> permissions,
        CancellationToken cancellationToken)
    {
        var existing = await db.RolePermissions
            .Where(x => x.RoleId == role.Id)
            .Select(x => x.Permission)
            .ToListAsync(cancellationToken);

        var toAdd = permissions
            .Where(permission => existing.All(x => !string.Equals(x, permission, StringComparison.OrdinalIgnoreCase)))
            .ToList();

        if (toAdd.Count == 0)
        {
            return;
        }

        db.RolePermissions.AddRange(toAdd.Select(permission => new RolePermission
        {
            RoleId = role.Id,
            Permission = permission
        }));
        await db.SaveChangesAsync(cancellationToken);
    }
}
