using System.Security.Cryptography;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SaveHomelessKitty.Data;
using SaveHomelessKitty.Dtos;
using SaveHomelessKitty.Models.Enums;
using SaveHomelessKitty.Services;

namespace SaveHomelessKitty.Controllers.Admin;

/// <summary>
/// Admin APIs for device inventory and status.
/// </summary>
[ApiController]
[Authorize]
[Route("api/admin/devices")]
public class DevicesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly PasswordHasher _passwordHasher;
    private readonly IConfiguration _configuration;

    public DevicesController(AppDbContext db, PasswordHasher passwordHasher, IConfiguration configuration)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _configuration = configuration;
    }

    /// <summary>
    /// Get all devices with latest status information.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of devices.</returns>
    [HttpGet]
    [Authorize(Policy = "perm:devices.read")]
    public async Task<ActionResult> GetDevices(CancellationToken cancellationToken)
    {
        var devices = await _db.Devices
            .AsNoTracking()
            .OrderBy(x => x.DeviceCode)
            .Select(x => new
            {
                x.Id,
                x.DeviceCode,
                x.Name,
                x.Location,
                IsActive = EF.Property<bool?>(x, "IsActive") ?? true,
                Status = (DeviceStatus)(EF.Property<int?>(x, "Status") ?? 0),
                x.BatteryPercent,
                x.SignalStrength,
                x.IpAddress,
                x.FirmwareVersion,
                x.LastSeenAtUtc,
                x.FoodRemainingGrams,
                x.FoodDispensedTodayGrams,
                x.FoodDispensedTotalGrams,
                PairingCodeExpiresAtUtc = x.PairingCodeExpiresAtUtc,
                HasPairingCode = !string.IsNullOrWhiteSpace(x.PairingCodeHash),
                x.Note
            })
            .ToListAsync(cancellationToken);

        return Ok(devices);
    }

    /// <summary>
    /// Get a single device by ID.
    /// </summary>
    /// <param name="id">Device ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Device detail or 404 if not found.</returns>
    [HttpGet("{id:guid}")]
    [Authorize(Policy = "perm:devices.read")]
    public async Task<ActionResult> GetDevice(Guid id, CancellationToken cancellationToken)
    {
        var device = await _db.Devices
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.DeviceCode,
                x.Name,
                x.Location,
                IsActive = EF.Property<bool?>(x, "IsActive") ?? true,
                Status = (DeviceStatus)(EF.Property<int?>(x, "Status") ?? 0),
                x.BatteryPercent,
                x.SignalStrength,
                x.IpAddress,
                x.FirmwareVersion,
                x.LastSeenAtUtc,
                x.FoodRemainingGrams,
                x.FoodDispensedTodayGrams,
                x.FoodDispensedTotalGrams,
                PairingCodeExpiresAtUtc = x.PairingCodeExpiresAtUtc,
                HasPairingCode = !string.IsNullOrWhiteSpace(x.PairingCodeHash),
                x.Note
            })
            .FirstOrDefaultAsync(cancellationToken);
        if (device == null)
        {
            return NotFound();
        }

        return Ok(device);
    }

    /// <summary>
    /// Update device metadata and active status.
    /// </summary>
    /// <param name="id">Device ID.</param>
    /// <param name="request">Update payload.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>HTTP 200 when updated.</returns>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = "perm:devices.write")]
    public async Task<ActionResult> UpdateDevice(Guid id, [FromBody] DeviceUpdateRequest request, CancellationToken cancellationToken)
    {
        var device = await _db.Devices.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (device == null)
        {
            return NotFound();
        }

        device.Name = request.Name ?? string.Empty;
        device.Location = request.Location ?? string.Empty;
        device.IsActive = request.IsActive;
        device.Note = request.Note ?? string.Empty;
        device.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    /// <summary>
    /// Create a new device record.
    /// </summary>
    /// <param name="request">Device payload.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>201 with the new device ID.</returns>
    [HttpPost]
    [Authorize(Policy = "perm:devices.write")]
    public async Task<ActionResult> CreateDevice([FromBody] DeviceCreateRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.DeviceCode))
        {
            return BadRequest("DeviceCodeRequired");
        }

        var exists = await _db.Devices.AnyAsync(x => x.DeviceCode == request.DeviceCode, cancellationToken);
        if (exists)
        {
            return Conflict("DeviceCodeExists");
        }

        var nowUtc = DateTime.UtcNow;
        var device = new Models.Device
        {
            Id = Guid.NewGuid(),
            DeviceCode = request.DeviceCode.Trim(),
            Name = request.Name ?? string.Empty,
            Location = request.Location ?? string.Empty,
            IsActive = request.IsActive,
            Note = request.Note ?? string.Empty,
            Status = Models.Enums.DeviceStatus.Unknown,
            CreatedAtUtc = nowUtc,
            UpdatedAtUtc = nowUtc
        };

        _db.Devices.Add(device);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetDevice), new { id = device.Id }, new { device.Id });
    }

    /// <summary>
    /// Delete a device record.
    /// </summary>
    /// <param name="id">Device ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>HTTP 200 when deleted.</returns>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "perm:devices.write")]
    public async Task<ActionResult> DeleteDevice(Guid id, CancellationToken cancellationToken)
    {
        var device = await _db.Devices.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (device == null)
        {
            return NotFound();
        }

        _db.Devices.Remove(device);
        await _db.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    /// <summary>
    /// Generate or rotate a pairing code for the device.
    /// </summary>
    /// <param name="id">Device ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Pairing code and expiry.</returns>
    [HttpPost("{id:guid}/pairing-code")]
    [Authorize(Policy = "perm:devices.pair")]
    public async Task<ActionResult<PairingCodeResponse>> GeneratePairingCode(Guid id, CancellationToken cancellationToken)
    {
        var device = await _db.Devices.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (device == null)
        {
            return NotFound();
        }

        var code = CreatePairingCode();
        device.PairingCodeHash = _passwordHasher.Hash(code);
        device.PairingCodeIssuedAtUtc = DateTime.UtcNow;

        var expiresHours = _configuration.GetValue<int?>("Pairing:CodeExpiresInHours") ?? 0;
        device.PairingCodeExpiresAtUtc = expiresHours > 0
            ? device.PairingCodeIssuedAtUtc.Value.AddHours(expiresHours)
            : null;
        device.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return Ok(new PairingCodeResponse
        {
            Code = code,
            ExpiresAtUtc = device.PairingCodeExpiresAtUtc
        });
    }

    private static string CreatePairingCode()
    {
        const string alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var bytes = RandomNumberGenerator.GetBytes(6);
        var chars = bytes.Select(b => alphabet[b % alphabet.Length]).ToArray();
        return string.Join("-", new string(chars).Chunk(3).Select(chunk => new string(chunk)));
    }
}
