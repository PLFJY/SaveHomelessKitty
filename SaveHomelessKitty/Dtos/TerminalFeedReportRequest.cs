using SaveHomelessKitty.Models.Enums;

namespace SaveHomelessKitty.Dtos;

/// <summary>
/// Request payload sent by a terminal to report the feed execution result.
/// </summary>
public class TerminalFeedReportRequest
{
    /// <summary>
    /// Feed log identifier returned by the allow endpoint.
    /// </summary>
    public Guid LogId { get; set; }

    /// <summary>
    /// Unique device code bound to the feeder.
    /// </summary>
    public string DeviceCode { get; set; } = string.Empty;

    /// <summary>
    /// Final result of the feeding attempt.
    /// </summary>
    public FeedResult Result { get; set; } = FeedResult.None;

    /// <summary>
    /// UTC time when the device finished the feeding attempt.
    /// </summary>
    public DateTime? ReportedAtUtc { get; set; }

    /// <summary>
    /// Portion size in grams, if measured by the device.
    /// </summary>
    public int? PortionGrams { get; set; }

    /// <summary>
    /// Optional free text note from the device.
    /// </summary>
    public string Note { get; set; } = string.Empty;
}
