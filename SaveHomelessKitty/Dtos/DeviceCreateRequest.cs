namespace SaveHomelessKitty.Dtos;

/// <summary>
/// Request payload to create a new device.
/// </summary>
public class DeviceCreateRequest
{
    public string DeviceCode { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Location { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Note { get; set; }
}
