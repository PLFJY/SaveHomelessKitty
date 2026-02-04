namespace SaveHomelessKitty.Dtos;

/// <summary>
/// Decision response returned to a terminal for a feed request.
/// </summary>
public class TerminalFeedAllowResponse
{
    /// <summary>
    /// Whether the device is allowed to feed right now.
    /// </summary>
    public bool Allowed { get; set; }

    /// <summary>
    /// Reason code when denied (e.g., Cooldown, DailyLimitReached, DeviceInactive).
    /// </summary>
    public string Reason { get; set; } = string.Empty;

    /// <summary>
    /// Feed log ID created for this decision, used for reporting result later.
    /// </summary>
    public Guid? LogId { get; set; }

    /// <summary>
    /// Remaining cooldown seconds when denied due to cooldown.
    /// </summary>
    public int CooldownRemainingSeconds { get; set; }

    /// <summary>
    /// Remaining daily feed count for today (after current decision).
    /// </summary>
    public int DailyRemainingCount { get; set; }

    /// <summary>
    /// Daily limit count snapshot used for this decision.
    /// </summary>
    public int DailyLimitCount { get; set; }

    /// <summary>
    /// Cooldown seconds snapshot used for this decision.
    /// </summary>
    public int CooldownSeconds { get; set; }
}
