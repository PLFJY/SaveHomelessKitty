using System.Collections.ObjectModel;

namespace SaveHomelessKitty.Services;

/// <summary>
/// Permission definitions used by the admin console.
/// </summary>
public static class Permissions
{
    public const string CatsRead = "cats.read";
    public const string CatsWrite = "cats.write";
    public const string DevicesRead = "devices.read";
    public const string DevicesWrite = "devices.write";
    public const string DevicesPair = "devices.pair";
    public const string FeedLogsRead = "feedlogs.read";
    public const string FeedRulesRead = "feedrules.read";
    public const string FeedRulesWrite = "feedrules.write";
    public const string MediaRead = "media.read";
    public const string UsersManage = "users.manage";
    public const string RolesManage = "roles.manage";

    public static readonly ReadOnlyCollection<PermissionDefinition> All = new(new[]
    {
        new PermissionDefinition(CatsRead, "Cat: View", "View cat profiles and details."),
        new PermissionDefinition(CatsWrite, "Cat: Manage", "Create, edit, or delete cat profiles."),
        new PermissionDefinition(DevicesRead, "Device: View", "View feeder devices and status."),
        new PermissionDefinition(DevicesWrite, "Device: Manage", "Create, edit, or delete devices."),
        new PermissionDefinition(DevicesPair, "Device: Pair", "Generate or rotate pairing codes."),
        new PermissionDefinition(FeedLogsRead, "Feed Logs: View", "View feeding logs and audit trails."),
        new PermissionDefinition(FeedRulesRead, "Feed Rules: View", "View feed rule configuration."),
        new PermissionDefinition(FeedRulesWrite, "Feed Rules: Manage", "Create or update feed rules."),
        new PermissionDefinition(MediaRead, "Media: View", "Access uploaded images and snapshots."),
        new PermissionDefinition(UsersManage, "Users: Manage", "Create, edit, or delete users."),
        new PermissionDefinition(RolesManage, "Roles: Manage", "Create, edit, or delete roles and permissions.")
    });

    public static IReadOnlyCollection<string> GetDefaultPermissions(string roleName)
    {
        return roleName switch
        {
            "SuperAdmin" => All.Select(x => x.Key).ToArray(),
            "Admin" => new[]
            {
                CatsRead,
                CatsWrite,
                DevicesRead,
                DevicesWrite,
                DevicesPair,
                FeedLogsRead,
                FeedRulesRead,
                FeedRulesWrite,
                MediaRead
            },
            "Visitor" => new[]
            {
                CatsRead,
                DevicesRead,
                FeedLogsRead,
                FeedRulesRead,
                MediaRead
            },
            "Viewer" => new[]
            {
                CatsRead,
                DevicesRead,
                FeedLogsRead,
                FeedRulesRead,
                MediaRead
            },
            _ => Array.Empty<string>()
        };
    }
}

public record PermissionDefinition(string Key, string Label, string Description);
