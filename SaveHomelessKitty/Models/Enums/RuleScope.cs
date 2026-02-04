namespace SaveHomelessKitty.Models.Enums;

/// <summary>
/// Scope of a feeding rule.
/// </summary>
public enum RuleScope
{
    /// <summary>
    /// Global default rule used for all devices/cats when no specific rule exists.
    /// </summary>
    Global = 0,

    /// <summary>
    /// Rule applies only to a specific device.
    /// </summary>
    Device = 1,

    /// <summary>
    /// Rule applies only to a specific cat.
    /// </summary>
    Cat = 2
}
