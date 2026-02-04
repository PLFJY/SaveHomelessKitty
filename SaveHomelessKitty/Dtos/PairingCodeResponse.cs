namespace SaveHomelessKitty.Dtos;

public class PairingCodeResponse
{
    public string Code { get; set; } = string.Empty;
    public DateTime? ExpiresAtUtc { get; set; }
}
