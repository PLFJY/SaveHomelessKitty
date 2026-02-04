using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SaveHomelessKitty.Data;
using SaveHomelessKitty.Dtos;
using SaveHomelessKitty.Models;
using SaveHomelessKitty.Models.Enums;
using SaveHomelessKitty.Services;

namespace SaveHomelessKitty.Controllers.Terminal;

/// <summary>
/// APIs used by the feeder terminal (Raspberry Pi).
/// </summary>
[ApiController]
[Route("api/terminal")]
public class TerminalFeedController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly FeedDecisionService _decisionService;

    public TerminalFeedController(AppDbContext db, FeedDecisionService decisionService)
    {
        _db = db;
        _decisionService = decisionService;
    }

    /// <summary>
    /// Ask the backend whether the device is allowed to feed right now.
    /// </summary>
    /// <param name="request">Allow-feed request payload.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Decision result including rule snapshots and remaining counts.</returns>
    /// <remarks>
    /// Possible error codes: 400 DeviceCodeRequired.
    /// </remarks>
    [HttpPost("feed/allow")]
    public async Task<ActionResult<TerminalFeedAllowResponse>> AllowFeed([FromBody] TerminalFeedAllowRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.DeviceCode))
        {
            return BadRequest("DeviceCodeRequired");
        }

        var nowUtc = DateTime.UtcNow;
        var triggeredAtUtc = request.TriggeredAtUtc ?? nowUtc;
        var device = await _db.Devices.FirstOrDefaultAsync(x => x.DeviceCode == request.DeviceCode, cancellationToken);

        if (device == null)
        {
            device = new Device
            {
                Id = Guid.NewGuid(),
                DeviceCode = request.DeviceCode.Trim(),
                Name = request.DeviceCode.Trim(),
                CreatedAtUtc = nowUtc,
                UpdatedAtUtc = nowUtc,
                LastSeenAtUtc = nowUtc,
                Status = DeviceStatus.Online
            };
            _db.Devices.Add(device);
        }
        else
        {
            device.LastSeenAtUtc = nowUtc;
            device.UpdatedAtUtc = nowUtc;
        }

        var response = new TerminalFeedAllowResponse();
        var log = new FeedLog
        {
            Id = Guid.NewGuid(),
            DeviceId = device.Id,
            CatId = request.CatId,
            RequestedAtUtc = nowUtc,
            TriggeredAtUtc = triggeredAtUtc,
            DecisionAtUtc = nowUtc,
            CreatedAtUtc = nowUtc,
            UpdatedAtUtc = nowUtc,
            Recognized = request.Recognized,
            Confidence = request.Confidence,
            SnapshotImageId = request.SnapshotImageId
        };

        if (!device.IsActive)
        {
            log.Decision = DecisionStatus.Denied;
            log.DenyReason = "DeviceInactive";
            response.Allowed = false;
            response.Reason = log.DenyReason;
        }
        else
        {
            var decision = await _decisionService.DecideAsync(device.Id, request.CatId, triggeredAtUtc, cancellationToken);
            response.Allowed = decision.Allowed;
            response.Reason = decision.Reason;
            response.CooldownRemainingSeconds = decision.CooldownRemainingSeconds;
            response.DailyRemainingCount = decision.DailyRemainingCount;
            response.DailyLimitCount = decision.DailyLimitCount;
            response.CooldownSeconds = decision.CooldownSeconds;

            log.Decision = decision.Allowed ? DecisionStatus.Allowed : DecisionStatus.Denied;
            log.DenyReason = decision.Allowed ? string.Empty : decision.Reason;
            log.DailyLimitCountSnapshot = decision.DailyLimitCount;
            log.CooldownSecondsSnapshot = decision.CooldownSeconds;
        }

        _db.FeedLogs.Add(log);
        await _db.SaveChangesAsync(cancellationToken);

        response.LogId = log.Id;
        return Ok(response);
    }

    /// <summary>
    /// Report the final result of a feeding attempt.
    /// </summary>
    /// <param name="request">Result report payload.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>HTTP 200 when stored.</returns>
    /// <remarks>
    /// Possible error codes: 400 DeviceCodeRequired/ResultRequired, 404 DeviceNotFound/LogNotFound, 409 LogNotAllowed.
    /// </remarks>
    [HttpPost("feed/report")]
    public async Task<ActionResult> ReportFeed([FromBody] TerminalFeedReportRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.DeviceCode))
        {
            return BadRequest("DeviceCodeRequired");
        }

        var device = await _db.Devices.FirstOrDefaultAsync(x => x.DeviceCode == request.DeviceCode, cancellationToken);
        if (device == null)
        {
            return NotFound("DeviceNotFound");
        }

        var log = await _db.FeedLogs.FirstOrDefaultAsync(x => x.Id == request.LogId && x.DeviceId == device.Id, cancellationToken);
        if (log == null)
        {
            return NotFound("LogNotFound");
        }

        if (log.Decision != DecisionStatus.Allowed)
        {
            return Conflict("LogNotAllowed");
        }

        if (request.Result == FeedResult.None)
        {
            return BadRequest("ResultRequired");
        }

        var nowUtc = request.ReportedAtUtc ?? DateTime.UtcNow;
        log.Result = request.Result;
        log.ReportedAtUtc = nowUtc;
        log.PortionGrams = request.PortionGrams;
        log.Note = request.Note ?? string.Empty;
        log.UpdatedAtUtc = nowUtc;

        device.LastSeenAtUtc = nowUtc;
        device.UpdatedAtUtc = nowUtc;

        await _db.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    /// <summary>
    /// Report device heartbeat, status and diagnostics.
    /// </summary>
    /// <param name="request">Heartbeat payload.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>HTTP 200 when stored.</returns>
    /// <remarks>
    /// Possible error codes: 400 DeviceCodeRequired.
    /// </remarks>
    [HttpPost("devices/heartbeat")]
    public async Task<ActionResult> Heartbeat([FromBody] TerminalHeartbeatRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.DeviceCode))
        {
            return BadRequest("DeviceCodeRequired");
        }

        var nowUtc = request.TimestampUtc ?? DateTime.UtcNow;
        var device = await _db.Devices.FirstOrDefaultAsync(x => x.DeviceCode == request.DeviceCode, cancellationToken);

        if (device == null)
        {
            device = new Device
            {
                Id = Guid.NewGuid(),
                DeviceCode = request.DeviceCode.Trim(),
                Name = request.DeviceCode.Trim(),
                CreatedAtUtc = nowUtc,
                UpdatedAtUtc = nowUtc,
                LastSeenAtUtc = nowUtc
            };
            _db.Devices.Add(device);
        }

        device.Status = request.Status;
        device.BatteryPercent = request.BatteryPercent;
        device.SignalStrength = request.SignalStrength;
        device.IpAddress = request.IpAddress ?? string.Empty;
        device.FirmwareVersion = request.FirmwareVersion ?? string.Empty;
        device.Note = request.Note ?? string.Empty;
        device.LastSeenAtUtc = nowUtc;
        device.UpdatedAtUtc = nowUtc;

        await _db.SaveChangesAsync(cancellationToken);
        return Ok();
    }
}
