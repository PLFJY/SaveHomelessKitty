namespace SaveHomelessKitty.Models.Enums;

/// <summary>
/// Runtime status reported by a feeder device.
/// </summary>
public enum DeviceStatus
{
    /// <summary>
    /// Status is not provided or unknown.
    /// </summary>
    Unknown = 0,

    /// <summary>
    /// Device is online and healthy.
    /// </summary>
    Online = 1,

    /// <summary>
    /// Device is offline.
    /// </summary>
    Offline = 2,

    /// <summary>
    /// Device is online but reports errors.
    /// </summary>
    Error = 3
}
