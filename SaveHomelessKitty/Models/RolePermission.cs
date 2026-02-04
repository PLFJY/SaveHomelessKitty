namespace SaveHomelessKitty.Models;

/// <summary>
/// Permission entry assigned to a role.
/// </summary>
public class RolePermission
{
    public Guid RoleId { get; set; }

    public Role? Role { get; set; }

    public string Permission { get; set; } = string.Empty;
}
