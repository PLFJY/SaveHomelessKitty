namespace SaveHomelessKitty.Models.Enums;

/// <summary>
/// Source of the media upload.
/// </summary>
public enum MediaUploader
{
    /// <summary>
    /// Uploaded by a feeder terminal.
    /// </summary>
    Terminal = 0,

    /// <summary>
    /// Uploaded by an admin or backend process.
    /// </summary>
    Admin = 1
}
