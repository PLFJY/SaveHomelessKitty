namespace SaveHomelessKitty.Models.Enums;

/// <summary>
/// Backend decision result for a feed request.
/// </summary>
public enum DecisionStatus
{
    /// <summary>
    /// The backend allows this feed action to proceed.
    /// </summary>
    Allowed = 0,

    /// <summary>
    /// The backend denies this feed action.
    /// </summary>
    Denied = 1
}
