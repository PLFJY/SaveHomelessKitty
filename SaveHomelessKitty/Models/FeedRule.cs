using System.ComponentModel.DataAnnotations;
using SaveHomelessKitty.Models.Enums;

namespace SaveHomelessKitty.Models;

/// <summary>
/// Feeding rule definition used to enforce cooldown and daily limits.
/// </summary>
public class FeedRule
{
    /// <summary>
    /// Primary key.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Scope type for this rule (Global/Device/Cat).
    /// </summary>
    public RuleScope ScopeType { get; set; } = RuleScope.Global;

    /// <summary>
    /// Scope ID (device or cat), null for global rule.
    /// </summary>
    public Guid? ScopeId { get; set; }

    /// <summary>
    /// Whether this rule is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Maximum feed count allowed per business day.
    /// </summary>
    public int DailyLimitCount { get; set; } = 10;

    /// <summary>
    /// Cooldown seconds between successful feeds.
    /// </summary>
    public int CooldownSeconds { get; set; } = 900;

    /// <summary>
    /// Rule display name.
    /// </summary>
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// UTC creation time.
    /// </summary>
    public DateTime CreatedAtUtc { get; set; }

    /// <summary>
    /// UTC last update time.
    /// </summary>
    public DateTime UpdatedAtUtc { get; set; }
}
