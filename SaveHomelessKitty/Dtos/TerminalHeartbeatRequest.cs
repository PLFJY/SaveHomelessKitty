using SaveHomelessKitty.Models.Enums;

namespace SaveHomelessKitty.Dtos;

/// <summary>
/// Periodic device heartbeat for status reporting and online presence.
/// </summary>
public class TerminalHeartbeatRequest
{
    /// <summary>
    /// Unique device code bound to the feeder.
    /// </summary>
    public string DeviceCode { get; set; } = string.Empty;

    /// <summary>
    /// Current device status reported by the terminal.
    /// </summary>
    public DeviceStatus Status { get; set; } = DeviceStatus.Unknown;

    /// <summary>
    /// Battery percentage reported by the device, if available.
    /// </summary>
    public int? BatteryPercent { get; set; }

    /// <summary>
    /// Signal strength in dBm or vendor-specific unit.
    /// </summary>
    public int? SignalStrength { get; set; }

    /// <summary>
    /// Device local IP address, if known.
    /// </summary>
    public string IpAddress { get; set; } = string.Empty;

    /// <summary>
    /// Firmware or software version string.
    /// </summary>
    public string FirmwareVersion { get; set; } = string.Empty;

    /// <summary>
    /// UTC time when the heartbeat was generated.
    /// </summary>
    public DateTime? TimestampUtc { get; set; }

    /// <summary>
    /// Optional diagnostic note.
    /// </summary>
    public string Note { get; set; } = string.Empty;
}
