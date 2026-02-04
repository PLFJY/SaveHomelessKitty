namespace SaveHomelessKitty.Dtos;

/// <summary>
/// Login response payload.
/// </summary>
public class AuthLoginResponse
{
    public string Token { get; set; } = string.Empty;
    public AuthUserProfile User { get; set; } = new();
}

public class AuthUserProfile
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string[] Roles { get; set; } = Array.Empty<string>();
    public string[] Permissions { get; set; } = Array.Empty<string>();
}
