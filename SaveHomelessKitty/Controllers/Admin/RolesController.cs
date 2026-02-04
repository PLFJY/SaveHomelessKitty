using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SaveHomelessKitty.Data;
using SaveHomelessKitty.Dtos;
using SaveHomelessKitty.Services;

namespace SaveHomelessKitty.Controllers.Admin;

/// <summary>
/// Admin APIs for managing roles and permissions.
/// </summary>
[ApiController]
[Authorize]
[Route("api/admin/roles")]
public class RolesController : ControllerBase
{
    private readonly AppDbContext _db;

    public RolesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoleResponse>>> GetRoles(CancellationToken cancellationToken)
    {
        var roles = await _db.Roles
            .Include(x => x.RolePermissions)
            .OrderBy(x => x.Name)
            .Select(x => new RoleResponse
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                Permissions = x.RolePermissions.Select(rp => rp.Permission).ToArray()
            })
            .ToListAsync(cancellationToken);

        return Ok(roles);
    }

    [HttpPost]
    [Authorize(Policy = "perm:roles.manage")]
    public async Task<ActionResult> CreateRole([FromBody] RoleUpsertRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("RoleNameRequired");
        }

        var exists = await _db.Roles.AnyAsync(x => x.Name == request.Name, cancellationToken);
        if (exists)
        {
            return Conflict("RoleNameExists");
        }

        var nowUtc = DateTime.UtcNow;
        var role = new Models.Role
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Description = request.Description ?? string.Empty,
            CreatedAtUtc = nowUtc,
            UpdatedAtUtc = nowUtc
        };

        _db.Roles.Add(role);
        await _db.SaveChangesAsync(cancellationToken);

        await UpdateRolePermissionsAsync(role, request.Permissions, cancellationToken);

        return CreatedAtAction(nameof(GetRoles), new { id = role.Id }, new { role.Id });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "perm:roles.manage")]
    public async Task<ActionResult> UpdateRole(Guid id, [FromBody] RoleUpsertRequest request, CancellationToken cancellationToken)
    {
        var role = await _db.Roles.Include(x => x.RolePermissions).FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (role == null)
        {
            return NotFound();
        }

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            role.Name = request.Name.Trim();
        }
        role.Description = request.Description ?? role.Description;
        role.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        await UpdateRolePermissionsAsync(role, request.Permissions, cancellationToken);

        return Ok();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "perm:roles.manage")]
    public async Task<ActionResult> DeleteRole(Guid id, CancellationToken cancellationToken)
    {
        var role = await _db.Roles.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (role == null)
        {
            return NotFound();
        }

        var userRoles = await _db.UserRoles.Where(x => x.RoleId == id).ToListAsync(cancellationToken);
        if (userRoles.Count > 0)
        {
            _db.UserRoles.RemoveRange(userRoles);
        }

        var rolePermissions = await _db.RolePermissions.Where(x => x.RoleId == id).ToListAsync(cancellationToken);
        if (rolePermissions.Count > 0)
        {
            _db.RolePermissions.RemoveRange(rolePermissions);
        }

        _db.Roles.Remove(role);
        await _db.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    private async Task UpdateRolePermissionsAsync(Models.Role role, string[]? permissions, CancellationToken cancellationToken)
    {
        var allowed = Permissions.All.Select(x => x.Key).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var desired = permissions?
            .Where(permission => allowed.Contains(permission))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray() ?? Array.Empty<string>();
        var existing = await _db.RolePermissions.Where(x => x.RoleId == role.Id).ToListAsync(cancellationToken);

        var toRemove = existing.Where(x => !desired.Contains(x.Permission, StringComparer.OrdinalIgnoreCase)).ToList();
        var toAdd = desired
            .Where(permission => existing.All(x => !string.Equals(x.Permission, permission, StringComparison.OrdinalIgnoreCase)))
            .ToList();

        if (toRemove.Count > 0)
        {
            _db.RolePermissions.RemoveRange(toRemove);
        }

        if (toAdd.Count > 0)
        {
            _db.RolePermissions.AddRange(toAdd.Select(permission => new Models.RolePermission
            {
                RoleId = role.Id,
                Permission = permission
            }));
        }

        if (toRemove.Count > 0 || toAdd.Count > 0)
        {
            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
