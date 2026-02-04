namespace SaveHomelessKitty.Models;

/// <summary>
/// Join table between users and roles.
/// </summary>
public class UserRole
{
    /// <summary>
    /// User ID.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Navigation to user.
    /// </summary>
    public User? User { get; set; }

    /// <summary>
    /// Role ID.
    /// </summary>
    public Guid RoleId { get; set; }

    /// <summary>
    /// Navigation to role.
    /// </summary>
    public Role? Role { get; set; }
}
