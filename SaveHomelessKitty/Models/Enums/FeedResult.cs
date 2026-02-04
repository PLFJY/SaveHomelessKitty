namespace SaveHomelessKitty.Models.Enums;

/// <summary>
/// Final result reported by the terminal for a feed attempt.
/// </summary>
public enum FeedResult
{
    /// <summary>
    /// Placeholder when the terminal has not reported yet.
    /// </summary>
    None = 0,

    /// <summary>
    /// Feeding succeeded on the device.
    /// </summary>
    Success = 1,

    /// <summary>
    /// Feeding failed on the device.
    /// </summary>
    Failure = 2
}
