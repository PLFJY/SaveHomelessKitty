namespace SaveHomelessKitty.Dtos;

public class UserCreateRequest
{
    public string Username { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string Password { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public Guid[]? RoleIds { get; set; }
}

public class UserUpdateRequest
{
    public string? DisplayName { get; set; }
    public string? Password { get; set; }
    public bool IsActive { get; set; } = true;
    public Guid[]? RoleIds { get; set; }
}

public class UserResponse
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public RoleBrief[] Roles { get; set; } = Array.Empty<RoleBrief>();
}
