using System.ComponentModel.DataAnnotations;
using SaveHomelessKitty.Models.Enums;

namespace SaveHomelessKitty.Models;

/// <summary>
/// Immutable event record for each feed request and its result.
/// </summary>
public class FeedLog
{
    /// <summary>
    /// Primary key.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Device foreign key.
    /// </summary>
    public Guid DeviceId { get; set; }

    /// <summary>
    /// Navigation to device.
    /// </summary>
    public Device? Device { get; set; }

    /// <summary>
    /// Optional cat foreign key if recognized.
    /// </summary>
    public Guid? CatId { get; set; }

    /// <summary>
    /// Navigation to cat.
    /// </summary>
    public Cat? Cat { get; set; }

    /// <summary>
    /// Whether the terminal recognized a cat for this event.
    /// </summary>
    public bool Recognized { get; set; }

    /// <summary>
    /// Recognition confidence provided by the terminal (0.0 - 1.0).
    /// </summary>
    public float? Confidence { get; set; }

    /// <summary>
    /// Optional snapshot image captured at trigger time.
    /// </summary>
    public Guid? SnapshotImageId { get; set; }

    /// <summary>
    /// Navigation to snapshot image.
    /// </summary>
    public MediaFile? SnapshotImage { get; set; }

    /// <summary>
    /// Allow/deny decision made by the backend.
    /// </summary>
    public DecisionStatus Decision { get; set; } = DecisionStatus.Denied;

    /// <summary>
    /// Reason code when denied.
    /// </summary>
    [MaxLength(128)]
    public string DenyReason { get; set; } = string.Empty;

    /// <summary>
    /// Final result reported by the terminal.
    /// </summary>
    public FeedResult Result { get; set; } = FeedResult.None;

    /// <summary>
    /// UTC time when the device requested permission.
    /// </summary>
    public DateTime RequestedAtUtc { get; set; }

    /// <summary>
    /// UTC time when the device detected/triggered the event.
    /// </summary>
    public DateTime? TriggeredAtUtc { get; set; }

    /// <summary>
    /// UTC time when the backend decided.
    /// </summary>
    public DateTime DecisionAtUtc { get; set; }

    /// <summary>
    /// UTC time when the terminal reported the result.
    /// </summary>
    public DateTime? ReportedAtUtc { get; set; }

    /// <summary>
    /// Daily limit snapshot used for this decision.
    /// </summary>
    public int DailyLimitCountSnapshot { get; set; }

    /// <summary>
    /// Cooldown seconds snapshot used for this decision.
    /// </summary>
    public int CooldownSecondsSnapshot { get; set; }

    /// <summary>
    /// Portion grams, if reported by the terminal.
    /// </summary>
    public int? PortionGrams { get; set; }

    /// <summary>
    /// Optional free-text note.
    /// </summary>
    [MaxLength(256)]
    public string Note { get; set; } = string.Empty;

    /// <summary>
    /// UTC creation time.
    /// </summary>
    public DateTime CreatedAtUtc { get; set; }

    /// <summary>
    /// UTC last update time.
    /// </summary>
    public DateTime UpdatedAtUtc { get; set; }
}
