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
    /// Remaining food in grams reported by the device.
    /// </summary>
    public int? FoodRemainingGrams { get; set; }

    /// <summary>
    /// Food dispensed today in grams reported by the device.
    /// </summary>
    public int? FoodDispensedTodayGrams { get; set; }

    /// <summary>
    /// Total food dispensed in grams reported by the device.
    /// </summary>
    public int? FoodDispensedTotalGrams { get; set; }

    /// <summary>
    /// Pairing code hash used to authenticate device updates.
    /// </summary>
    [MaxLength(256)]
    public string PairingCodeHash { get; set; } = string.Empty;

    /// <summary>
    /// UTC time when the pairing code was issued.
    /// </summary>
    public DateTime? PairingCodeIssuedAtUtc { get; set; }

    /// <summary>
    /// UTC time when the pairing code expires (optional).
    /// </summary>
    public DateTime? PairingCodeExpiresAtUtc { get; set; }

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
