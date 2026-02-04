namespace SaveHomelessKitty.Services;

/// <summary>
/// Decision output returned by feed policy evaluation.
/// </summary>
public class FeedDecisionResult
{
    /// <summary>
    /// Whether feeding is allowed.
    /// </summary>
    public bool Allowed { get; set; }

    /// <summary>
    /// Reason code when denied.
    /// </summary>
    public string Reason { get; set; } = string.Empty;

    /// <summary>
    /// Remaining cooldown seconds when denied due to cooldown.
    /// </summary>
    public int CooldownRemainingSeconds { get; set; }

    /// <summary>
    /// Remaining daily feed count.
    /// </summary>
    public int DailyRemainingCount { get; set; }

    /// <summary>
    /// Daily limit count used for this decision.
    /// </summary>
    public int DailyLimitCount { get; set; }

    /// <summary>
    /// Cooldown seconds used for this decision.
    /// </summary>
    public int CooldownSeconds { get; set; }
}
