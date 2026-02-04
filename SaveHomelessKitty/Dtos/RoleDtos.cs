namespace SaveHomelessKitty.Dtos;

public class RoleUpsertRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string[]? Permissions { get; set; }
}

public class RoleResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string[] Permissions { get; set; } = Array.Empty<string>();
}

public class RoleBrief
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
