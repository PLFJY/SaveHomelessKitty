using System.ComponentModel.DataAnnotations;

namespace SaveHomelessKitty.Models;

/// <summary>
/// Role definition for RBAC.
/// </summary>
public class Role
{
    /// <summary>
    /// Primary key.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Role name (unique).
    /// </summary>
    [MaxLength(64)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Role description.
    /// </summary>
    [MaxLength(256)]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// UTC creation time.
    /// </summary>
    public DateTime CreatedAtUtc { get; set; }

    /// <summary>
    /// UTC last update time.
    /// </summary>
    public DateTime UpdatedAtUtc { get; set; }

    /// <summary>
    /// Users assigned to this role.
    /// </summary>
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
