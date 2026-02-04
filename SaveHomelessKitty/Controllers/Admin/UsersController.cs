using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SaveHomelessKitty.Data;
using SaveHomelessKitty.Dtos;
using SaveHomelessKitty.Services;

namespace SaveHomelessKitty.Controllers.Admin;

/// <summary>
/// Admin APIs for managing users.
/// </summary>
[ApiController]
[Authorize(Policy = "perm:users.manage")]
[Route("api/admin/users")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly PasswordHasher _passwordHasher;

    public UsersController(AppDbContext db, PasswordHasher passwordHasher)
    {
        _db = db;
        _passwordHasher = passwordHasher;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponse>>> GetUsers(CancellationToken cancellationToken)
    {
        var users = await _db.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .OrderBy(x => x.Username)
            .Select(x => new UserResponse
            {
                Id = x.Id,
                Username = x.Username,
                DisplayName = x.DisplayName,
                IsActive = x.IsActive,
                Roles = x.UserRoles
                    .Where(ur => ur.Role != null)
                    .Select(ur => new RoleBrief
                    {
                        Id = ur.Role!.Id,
                        Name = ur.Role!.Name
                    })
                    .ToArray()
            })
            .ToListAsync(cancellationToken);

        return Ok(users);
    }

    [HttpPost]
    public async Task<ActionResult> CreateUser([FromBody] UserCreateRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("UsernameAndPasswordRequired");
        }

        var exists = await _db.Users.AnyAsync(x => x.Username == request.Username, cancellationToken);
        if (exists)
        {
            return Conflict("UsernameExists");
        }

        var nowUtc = DateTime.UtcNow;
        var user = new Models.User
        {
            Id = Guid.NewGuid(),
            Username = request.Username.Trim(),
            DisplayName = request.DisplayName ?? request.Username.Trim(),
            PasswordHash = _passwordHasher.Hash(request.Password),
            IsActive = request.IsActive,
            CreatedAtUtc = nowUtc,
            UpdatedAtUtc = nowUtc
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(cancellationToken);

        await UpdateUserRolesAsync(user.Id, request.RoleIds, cancellationToken);

        return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, new { user.Id });
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> UpdateUser(Guid id, [FromBody] UserUpdateRequest request, CancellationToken cancellationToken)
    {
        var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (user == null)
        {
            return NotFound();
        }

        user.DisplayName = request.DisplayName ?? user.DisplayName;
        user.IsActive = request.IsActive;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            user.PasswordHash = _passwordHasher.Hash(request.Password);
        }

        user.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        await UpdateUserRolesAsync(user.Id, request.RoleIds, cancellationToken);

        return Ok();
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteUser(Guid id, CancellationToken cancellationToken)
    {
        var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (user == null)
        {
            return NotFound();
        }

        var userRoles = await _db.UserRoles.Where(x => x.UserId == id).ToListAsync(cancellationToken);
        if (userRoles.Count > 0)
        {
            _db.UserRoles.RemoveRange(userRoles);
        }

        _db.Users.Remove(user);
        await _db.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    private async Task UpdateUserRolesAsync(Guid userId, IEnumerable<Guid>? roleIds, CancellationToken cancellationToken)
    {
        var desired = roleIds?.Distinct().ToArray() ?? Array.Empty<Guid>();
        var existing = await _db.UserRoles.Where(x => x.UserId == userId).ToListAsync(cancellationToken);

        var toRemove = existing.Where(x => !desired.Contains(x.RoleId)).ToList();
        var toAdd = desired.Where(roleId => existing.All(x => x.RoleId != roleId)).ToList();

        if (toRemove.Count > 0)
        {
            _db.UserRoles.RemoveRange(toRemove);
        }

        if (toAdd.Count > 0)
        {
            _db.UserRoles.AddRange(toAdd.Select(roleId => new Models.UserRole
            {
                UserId = userId,
                RoleId = roleId
            }));
        }

        if (toRemove.Count > 0 || toAdd.Count > 0)
        {
            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
