using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SaveHomelessKitty.Data;
using SaveHomelessKitty.Dtos;
using SaveHomelessKitty.Services;

namespace SaveHomelessKitty.Controllers.Admin;

/// <summary>
/// Admin authentication endpoints.
/// </summary>
[ApiController]
[Route("api/admin/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly PasswordHasher _passwordHasher;
    private readonly JwtTokenService _jwtTokenService;

    public AuthController(AppDbContext db, PasswordHasher passwordHasher, JwtTokenService jwtTokenService)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    /// <summary>
    /// Login with username and password.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthLoginResponse>> Login([FromBody] AuthLoginRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("UsernameAndPasswordRequired");
        }

        var user = await _db.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Username == request.Username, cancellationToken);

        if (user == null || !user.IsActive || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized();
        }

        var roles = user.UserRoles
            .Select(x => x.Role?.Name)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var roleIds = user.UserRoles.Select(x => x.RoleId).ToArray();
        var permissions = await _db.RolePermissions
            .Where(x => roleIds.Contains(x.RoleId))
            .Select(x => x.Permission)
            .Distinct()
            .ToArrayAsync(cancellationToken);

        var token = _jwtTokenService.CreateToken(user, roles, permissions);

        return Ok(new AuthLoginResponse
        {
            Token = token,
            User = new AuthUserProfile
            {
                Id = user.Id,
                Username = user.Username,
                DisplayName = user.DisplayName,
                Roles = roles,
                Permissions = permissions
            }
        });
    }

    /// <summary>
    /// Get current user profile.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AuthUserProfile>> Me(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst("sub")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await _db.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);

        if (user == null)
        {
            return Unauthorized();
        }

        var roles = user.UserRoles
            .Select(x => x.Role?.Name)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var roleIds = user.UserRoles.Select(x => x.RoleId).ToArray();
        var permissions = await _db.RolePermissions
            .Where(x => roleIds.Contains(x.RoleId))
            .Select(x => x.Permission)
            .Distinct()
            .ToArrayAsync(cancellationToken);

        return Ok(new AuthUserProfile
        {
            Id = user.Id,
            Username = user.Username,
            DisplayName = user.DisplayName,
            Roles = roles,
            Permissions = permissions
        });
    }
}
