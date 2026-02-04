namespace SaveHomelessKitty.Models.Enums;

/// <summary>
/// Media category used to associate the file with a business entity.
/// </summary>
public enum MediaType
{
    /// <summary>
    /// Media related to a cat profile.
    /// </summary>
    Cat = 0,

    /// <summary>
    /// Media related to a feed event.
    /// </summary>
    Feed = 1,

    /// <summary>
    /// Other or unclassified media.
    /// </summary>
    Other = 2
}
