using System.ComponentModel.DataAnnotations;
using SaveHomelessKitty.Models.Enums;

namespace SaveHomelessKitty.Models;

/// <summary>
/// Feeding device metadata and last known status.
/// </summary>
public class Device
{
    /// <summary>
    /// Primary key.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Unique device code reported by the terminal.
    /// </summary>
    [MaxLength(64)]
    public string DeviceCode { get; set; } = string.Empty;

    /// <summary>
    /// Display name for the device.
    /// </summary>
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Physical location description.
    /// </summary>
    [MaxLength(256)]
    public string Location { get; set; } = string.Empty;

    /// <summary>
    /// Whether this device is active for decisions.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Last reported status from the device.
    /// </summary>
    public DeviceStatus Status { get; set; } = DeviceStatus.Unknown;

    /// <summary>
    /// Battery percentage, if supported by the device.
    /// </summary>
    public int? BatteryPercent { get; set; }

    /// <summary>
    /// Signal strength reported by the device.
    /// </summary>
    public int? SignalStrength { get; set; }

    /// <summary>
    /// Device IP address, if known.
    /// </summary>
    [MaxLength(64)]
    public string IpAddress { get; set; } = string.Empty;

    /// <summary>
    /// Device firmware or software version.
    /// </summary>
    [MaxLength(64)]
    public string FirmwareVersion { get; set; } = string.Empty;

    /// <summary>
    /// Last heartbeat time in UTC.
    /// </summary>
    public DateTime? LastSeenAtUtc { get; set; }

    /// <summary>
    /// Admin note.
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

    /// <summary>
    /// Related feed logs for this device.
    /// </summary>
    public ICollection<FeedLog> FeedLogs { get; set; } = new List<FeedLog>();
}
