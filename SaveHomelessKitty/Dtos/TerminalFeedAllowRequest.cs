namespace SaveHomelessKitty.Dtos;

/// <summary>
/// Request payload sent by a terminal to ask whether it can feed now.
/// </summary>
public class TerminalFeedAllowRequest
{
    /// <summary>
    /// Unique device code bound to the feeder (e.g., RPI-001).
    /// </summary>
    public string DeviceCode { get; set; } = string.Empty;

    /// <summary>
    /// Pairing code for device authentication.
    /// </summary>
    public string? PairingCode { get; set; }

    /// <summary>
    /// Optional detected cat identifier, if recognized by the device.
    /// </summary>
    public Guid? CatId { get; set; }

    /// <summary>
    /// Whether the terminal recognized a cat for this event.
    /// </summary>
    public bool Recognized { get; set; }

    /// <summary>
    /// Recognition confidence provided by the terminal (0.0 - 1.0).
    /// </summary>
    public float? Confidence { get; set; }

    /// <summary>
    /// UTC time when the device detected the cat / triggered the event.
    /// </summary>
    public DateTime? TriggeredAtUtc { get; set; }

    /// <summary>
    /// Optional snapshot image reference captured by the device.
    /// </summary>
    public Guid? SnapshotImageId { get; set; }
}
