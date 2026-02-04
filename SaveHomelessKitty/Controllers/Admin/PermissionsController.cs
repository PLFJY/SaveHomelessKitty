using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaveHomelessKitty.Services;

namespace SaveHomelessKitty.Controllers.Admin;

/// <summary>
/// Admin APIs for permission definitions.
/// </summary>
[ApiController]
[Authorize]
[Route("api/admin/permissions")]
public class PermissionsController : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<PermissionDefinition>> GetPermissions()
    {
        return Ok(Permissions.All);
    }
}
