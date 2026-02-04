namespace SaveHomelessKitty.Dtos;

/// <summary>
/// Request payload to update a device configuration from the admin UI.
/// </summary>
public class DeviceUpdateRequest
{
    /// <summary>
    /// Human-friendly device name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Physical location description.
    /// </summary>
    public string Location { get; set; } = string.Empty;

    /// <summary>
    /// Whether the device is enabled for feeding decisions.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Optional admin note.
    /// </summary>
    public string Note { get; set; } = string.Empty;
}
