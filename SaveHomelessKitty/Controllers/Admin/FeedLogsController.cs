using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SaveHomelessKitty.Data;
using SaveHomelessKitty.Models.Enums;

namespace SaveHomelessKitty.Controllers.Admin;

/// <summary>
/// Admin APIs for querying feed logs.
/// </summary>
[ApiController]
[Route("api/admin/feedlogs")]
public class FeedLogsController : ControllerBase
{
    private readonly AppDbContext _db;

    public FeedLogsController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Query recent feed logs with optional filters.
    /// </summary>
    /// <param name="deviceId">Filter by device ID.</param>
    /// <param name="deviceCode">Filter by device code (ignored if deviceId is provided).</param>
    /// <param name="fromUtc">Filter by requested time greater than or equal to this UTC timestamp.</param>
    /// <param name="toUtc">Filter by requested time less than or equal to this UTC timestamp.</param>
    /// <param name="result">Filter by feed result.</param>
    /// <param name="decision">Filter by decision status.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of feed logs (latest 500).</returns>
    [HttpGet]
    public async Task<ActionResult> GetLogs(
        [FromQuery] Guid? deviceId,
        [FromQuery] string? deviceCode,
        [FromQuery] DateTime? fromUtc,
        [FromQuery] DateTime? toUtc,
        [FromQuery] FeedResult? result,
        [FromQuery] DecisionStatus? decision,
        CancellationToken cancellationToken)
    {
        var query = _db.FeedLogs
            .Include(x => x.Device)
            .Include(x => x.Cat)
            .AsQueryable();

        if (deviceId.HasValue)
        {
            query = query.Where(x => x.DeviceId == deviceId.Value);
        }
        else if (!string.IsNullOrWhiteSpace(deviceCode))
        {
            query = query.Where(x => x.Device != null && x.Device.DeviceCode == deviceCode);
        }

        if (fromUtc.HasValue)
        {
            query = query.Where(x => x.RequestedAtUtc >= fromUtc.Value);
        }

        if (toUtc.HasValue)
        {
            query = query.Where(x => x.RequestedAtUtc <= toUtc.Value);
        }

        if (result.HasValue)
        {
            query = query.Where(x => x.Result == result.Value);
        }

        if (decision.HasValue)
        {
            query = query.Where(x => x.Decision == decision.Value);
        }

        var logs = await query
            .OrderByDescending(x => x.RequestedAtUtc)
            .Take(500)
            .Select(x => new
            {
                x.Id,
                x.DeviceId,
                DeviceCode = x.Device != null ? x.Device.DeviceCode : string.Empty,
                x.CatId,
                x.Decision,
                x.DenyReason,
                x.Result,
                x.RequestedAtUtc,
                x.TriggeredAtUtc,
                x.ReportedAtUtc,
                x.DailyLimitCountSnapshot,
                x.CooldownSecondsSnapshot,
                x.PortionGrams,
                x.Note,
                x.Recognized,
                x.Confidence,
                x.SnapshotImageId
            })
            .ToListAsync(cancellationToken);

        return Ok(logs);
    }
}
