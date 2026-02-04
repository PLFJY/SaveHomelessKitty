using System.ComponentModel.DataAnnotations;

namespace SaveHomelessKitty.Models;

/// <summary>
/// Stray cat profile tracked by the system (stable identity, model-agnostic).
/// </summary>
public class Cat
{
    /// <summary>
    /// Primary key.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Internal cat code (e.g., CAT-001).
    /// </summary>
    [MaxLength(32)]
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Optional alias or nickname.
    /// </summary>
    [MaxLength(64)]
    public string Alias { get; set; } = string.Empty;

    /// <summary>
    /// Human-readable description for identification.
    /// </summary>
    [MaxLength(256)]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// First time the cat was observed (UTC).
    /// </summary>
    public DateTime? FirstSeenAtUtc { get; set; }

    /// <summary>
    /// Last time the cat was observed (UTC).
    /// </summary>
    public DateTime? LastSeenAtUtc { get; set; }

    /// <summary>
    /// Whether the cat is active in the system.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Optional primary image reference.
    /// </summary>
    public Guid? PrimaryImageId { get; set; }

    /// <summary>
    /// Navigation to the primary image.
    /// </summary>
    public MediaFile? PrimaryImage { get; set; }

    /// <summary>
    /// UTC creation time.
    /// </summary>
    public DateTime CreatedAtUtc { get; set; }

    /// <summary>
    /// UTC last update time.
    /// </summary>
    public DateTime UpdatedAtUtc { get; set; }

    /// <summary>
    /// Feed logs related to this cat.
    /// </summary>
    public ICollection<FeedLog> FeedLogs { get; set; } = new List<FeedLog>();
}
