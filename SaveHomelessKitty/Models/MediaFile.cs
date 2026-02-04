using System.ComponentModel.DataAnnotations;
using SaveHomelessKitty.Models.Enums;

namespace SaveHomelessKitty.Models;

/// <summary>
/// Media file metadata stored as a file system path.
/// </summary>
public class MediaFile
{
    /// <summary>
    /// Primary key.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Media category (Cat/Feed/Other).
    /// </summary>
    public MediaType Type { get; set; } = MediaType.Other;

    /// <summary>
    /// Related entity ID (CatId or FeedLogId), depending on Type.
    /// </summary>
    public Guid? RelatedId { get; set; }

    /// <summary>
    /// Absolute or mounted path on disk.
    /// </summary>
    [MaxLength(512)]
    public string Path { get; set; } = string.Empty;

    /// <summary>
    /// MIME content type.
    /// </summary>
    [MaxLength(128)]
    public string ContentType { get; set; } = string.Empty;

    /// <summary>
    /// File size in bytes.
    /// </summary>
    public long SizeBytes { get; set; }

    /// <summary>
    /// UTC time when the media was captured on device (if provided).
    /// </summary>
    public DateTime? CapturedAtUtc { get; set; }

    /// <summary>
    /// Source of the upload.
    /// </summary>
    public MediaUploader UploadedBy { get; set; } = MediaUploader.Terminal;

    /// <summary>
    /// UTC creation time.
    /// </summary>
    public DateTime CreatedAtUtc { get; set; }

    /// <summary>
    /// UTC last update time.
    /// </summary>
    public DateTime UpdatedAtUtc { get; set; }
}
