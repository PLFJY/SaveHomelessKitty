using SaveHomelessKitty.Models.Enums;

namespace SaveHomelessKitty.Dtos;

/// <summary>
/// Request payload to create or update a feed rule.
/// </summary>
public class FeedRuleUpsertRequest
{
    /// <summary>
    /// Scope type of the rule (Global/Device/Cat).
    /// </summary>
    public RuleScope ScopeType { get; set; } = RuleScope.Global;

    /// <summary>
    /// Scope target ID (device or cat). Null for global rule.
    /// </summary>
    public Guid? ScopeId { get; set; }

    /// <summary>
    /// Display name for the rule.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Maximum allowed feeds per business day.
    /// </summary>
    public int DailyLimitCount { get; set; }

    /// <summary>
    /// Cooldown time in seconds between successful feeds.
    /// </summary>
    public int CooldownSeconds { get; set; }

    /// <summary>
    /// Whether the rule is active.
    /// </summary>
    public bool IsActive { get; set; } = true;
}
