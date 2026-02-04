using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SaveHomelessKitty.Data;
using SaveHomelessKitty.Dtos;

namespace SaveHomelessKitty.Controllers.Admin;

/// <summary>
/// Admin APIs for device inventory and status.
/// </summary>
[ApiController]
[Route("api/admin/devices")]
public class DevicesController : ControllerBase
{
    private readonly AppDbContext _db;

    public DevicesController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Get all devices with latest status information.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of devices.</returns>
    [HttpGet]
    public async Task<ActionResult> GetDevices(CancellationToken cancellationToken)
    {
        var devices = await _db.Devices
            .OrderBy(x => x.DeviceCode)
            .Select(x => new
            {
                x.Id,
                x.DeviceCode,
                x.Name,
                x.Location,
                x.IsActive,
                x.Status,
                x.BatteryPercent,
                x.SignalStrength,
                x.IpAddress,
                x.FirmwareVersion,
                x.LastSeenAtUtc,
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
    public async Task<ActionResult> GetDevice(Guid id, CancellationToken cancellationToken)
    {
        var device = await _db.Devices.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (device == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            device.Id,
            device.DeviceCode,
            device.Name,
            device.Location,
            device.IsActive,
            device.Status,
            device.BatteryPercent,
            device.SignalStrength,
            device.IpAddress,
            device.FirmwareVersion,
            device.LastSeenAtUtc,
            device.Note
        });
    }

    /// <summary>
    /// Update device metadata and active status.
    /// </summary>
    /// <param name="id">Device ID.</param>
    /// <param name="request">Update payload.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>HTTP 200 when updated.</returns>
    [HttpPut("{id:guid}")]
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
}
