namespace SaveHomelessKitty.Dtos;

/// <summary>
/// Request payload to create or update a cat profile.
/// </summary>
public class CatUpsertRequest
{
    /// <summary>
    /// Internal cat code (e.g., CAT-001).
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Optional alias or nickname.
    /// </summary>
    public string Alias { get; set; } = string.Empty;

    /// <summary>
    /// Human-readable description.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// First seen time in UTC.
    /// </summary>
    public DateTime? FirstSeenAtUtc { get; set; }

    /// <summary>
    /// Last seen time in UTC.
    /// </summary>
    public DateTime? LastSeenAtUtc { get; set; }

    /// <summary>
    /// Optional primary image ID.
    /// </summary>
    public Guid? PrimaryImageId { get; set; }

    /// <summary>
    /// Whether the cat is active in the system.
    /// </summary>
    public bool IsActive { get; set; } = true;
}
