using Microsoft.EntityFrameworkCore;
using SaveHomelessKitty.Models;
using SaveHomelessKitty.Models.Enums;

namespace SaveHomelessKitty.Data;

/// <summary>
/// EF Core database context for the feeding system.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    /// <summary>
    /// Admin users.
    /// </summary>
    public DbSet<User> Users => Set<User>();

    /// <summary>
    /// RBAC roles.
    /// </summary>
    public DbSet<Role> Roles => Set<Role>();

    /// <summary>
    /// User-to-role mappings.
    /// </summary>
    public DbSet<UserRole> UserRoles => Set<UserRole>();

    /// <summary>
    /// Feeder devices.
    /// </summary>
    public DbSet<Device> Devices => Set<Device>();

    /// <summary>
    /// Cat profiles.
    /// </summary>
    public DbSet<Cat> Cats => Set<Cat>();

    /// <summary>
    /// Feeding rules.
    /// </summary>
    public DbSet<FeedRule> FeedRules => Set<FeedRule>();

    /// <summary>
    /// Feed logs.
    /// </summary>
    public DbSet<FeedLog> FeedLogs => Set<FeedLog>();

    /// <summary>
    /// Media file metadata.
    /// </summary>
    public DbSet<MediaFile> MediaFiles => Set<MediaFile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(x => x.Username).IsUnique();
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(x => new { x.UserId, x.RoleId });
            entity.HasOne(x => x.User).WithMany(x => x.UserRoles).HasForeignKey(x => x.UserId);
            entity.HasOne(x => x.Role).WithMany(x => x.UserRoles).HasForeignKey(x => x.RoleId);
        });

        modelBuilder.Entity<Device>(entity =>
        {
            entity.HasIndex(x => x.DeviceCode).IsUnique();
            entity.HasIndex(x => x.LastSeenAtUtc);
        });

        modelBuilder.Entity<Cat>(entity =>
        {
            entity.HasIndex(x => x.Code).IsUnique();
            entity.HasIndex(x => x.Alias);
        });

        modelBuilder.Entity<FeedRule>(entity =>
        {
            entity.HasIndex(x => new { x.ScopeType, x.ScopeId });
            entity.HasIndex(x => x.IsActive);
        });

        modelBuilder.Entity<FeedLog>(entity =>
        {
            entity.HasIndex(x => new { x.DeviceId, x.RequestedAtUtc });
            entity.HasIndex(x => x.Decision);
            entity.HasIndex(x => x.Result);
            entity.HasIndex(x => x.CatId);
        });

        modelBuilder.Entity<MediaFile>(entity =>
        {
            entity.HasIndex(x => new { x.Type, x.RelatedId });
        });

        base.OnModelCreating(modelBuilder);
    }
}
