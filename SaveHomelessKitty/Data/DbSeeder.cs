using SaveHomelessKitty.Models;
using SaveHomelessKitty.Models.Enums;

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
    public static async Task SeedAsync(AppDbContext db, CancellationToken cancellationToken)
    {
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
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            });
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}
