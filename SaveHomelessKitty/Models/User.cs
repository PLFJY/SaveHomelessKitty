using System.ComponentModel.DataAnnotations;

namespace SaveHomelessKitty.Models;

/// <summary>
/// System user for admin access and audit purposes.
/// </summary>
public class User
{
    /// <summary>
    /// Primary key.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Login username (unique).
    /// </summary>
    [MaxLength(64)]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Display name for UI.
    /// </summary>
    [MaxLength(128)]
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// Password hash (no plaintext storage).
    /// </summary>
    [MaxLength(256)]
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// Whether the user account is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// UTC creation time.
    /// </summary>
    public DateTime CreatedAtUtc { get; set; }

    /// <summary>
    /// UTC last update time.
    /// </summary>
    public DateTime UpdatedAtUtc { get; set; }

    /// <summary>
    /// Role memberships for RBAC.
    /// </summary>
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
