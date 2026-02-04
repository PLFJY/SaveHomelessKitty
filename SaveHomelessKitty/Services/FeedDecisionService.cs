using Microsoft.EntityFrameworkCore;
using SaveHomelessKitty.Data;
using SaveHomelessKitty.Models;
using SaveHomelessKitty.Models.Enums;

namespace SaveHomelessKitty.Services;

/// <summary>
/// Core policy engine for cooldown and daily limits.
/// </summary>
public class FeedDecisionService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;

    public FeedDecisionService(AppDbContext db, IConfiguration configuration)
    {
        _db = db;
        _configuration = configuration;
    }

    /// <summary>
    /// Evaluate whether a device is allowed to feed at a given time.
    /// </summary>
    /// <param name="deviceId">Device ID for rule lookup and logging.</param>
    /// <param name="catId">Optional cat ID for rule lookup.</param>
    /// <param name="detectedAtUtc">UTC time to evaluate against; uses now if null.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    public async Task<FeedDecisionResult> DecideAsync(Guid deviceId, Guid? catId, DateTime? detectedAtUtc, CancellationToken cancellationToken)
    {
        var nowUtc = detectedAtUtc ?? DateTime.UtcNow;
        var rule = await ResolveRuleAsync(deviceId, catId, cancellationToken);

        var decision = new FeedDecisionResult
        {
            Allowed = true,
            DailyLimitCount = rule.DailyLimitCount,
            CooldownSeconds = rule.CooldownSeconds,
            DailyRemainingCount = rule.DailyLimitCount
        };

        var lastSuccess = await _db.FeedLogs
            .Where(x => x.DeviceId == deviceId && x.Result == FeedResult.Success)
            .OrderByDescending(x => x.ReportedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastSuccess?.ReportedAtUtc != null)
        {
            var elapsed = nowUtc - lastSuccess.ReportedAtUtc.Value;
            if (elapsed.TotalSeconds < rule.CooldownSeconds)
            {
                decision.Allowed = false;
                decision.Reason = "Cooldown";
                decision.CooldownRemainingSeconds = Math.Max(0, rule.CooldownSeconds - (int)elapsed.TotalSeconds);
                return decision;
            }
        }

        var (dayStartUtc, dayEndUtc) = GetBusinessDayRangeUtc(nowUtc);
        var todaysCount = await _db.FeedLogs
            .Where(x => x.DeviceId == deviceId && x.Result == FeedResult.Success)
            .Where(x => x.ReportedAtUtc >= dayStartUtc && x.ReportedAtUtc < dayEndUtc)
            .CountAsync(cancellationToken);

        decision.DailyRemainingCount = Math.Max(0, rule.DailyLimitCount - todaysCount);

        if (todaysCount >= rule.DailyLimitCount)
        {
            decision.Allowed = false;
            decision.Reason = "DailyLimitReached";
        }

        return decision;
    }

    /// <summary>
    /// Resolve the rule in order of priority: cat-specific, device-specific, then global.
    /// </summary>
    /// <param name="deviceId">Device ID for rule lookup.</param>
    /// <param name="catId">Optional cat ID for rule lookup.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    public async Task<FeedRule> ResolveRuleAsync(Guid deviceId, Guid? catId, CancellationToken cancellationToken)
    {
        if (catId.HasValue)
        {
            var catRule = await _db.FeedRules
                .Where(x => x.IsActive && x.ScopeType == RuleScope.Cat && x.ScopeId == catId)
                .FirstOrDefaultAsync(cancellationToken);
            if (catRule != null)
            {
                return catRule;
            }
        }

        var deviceRule = await _db.FeedRules
            .Where(x => x.IsActive && x.ScopeType == RuleScope.Device && x.ScopeId == deviceId)
            .FirstOrDefaultAsync(cancellationToken);

        if (deviceRule != null)
        {
            return deviceRule;
        }

        var globalRule = await _db.FeedRules
            .Where(x => x.IsActive && x.ScopeType == RuleScope.Global)
            .OrderBy(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);

        if (globalRule != null)
        {
            return globalRule;
        }

        return new FeedRule
        {
            ScopeType = RuleScope.Global,
            DailyLimitCount = 10,
            CooldownSeconds = 900,
            IsActive = true,
            Name = "default"
        };
    }

    /// <summary>
    /// Compute business day start/end in UTC based on configured time zone.
    /// </summary>
    /// <param name="nowUtc">Current UTC time.</param>
    private (DateTime startUtc, DateTime endUtc) GetBusinessDayRangeUtc(DateTime nowUtc)
    {
        var timeZoneId = _configuration.GetValue<string>("BusinessTimeZone") ?? "Asia/Shanghai";
        TimeZoneInfo tz;
        try
        {
            tz = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
        }
        catch (TimeZoneNotFoundException)
        {
            tz = TimeZoneInfo.Utc;
        }
        catch (InvalidTimeZoneException)
        {
            tz = TimeZoneInfo.Utc;
        }

        var local = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, tz);
        var localStart = local.Date;
        var startUtc = TimeZoneInfo.ConvertTimeToUtc(localStart, tz);
        return (startUtc, startUtc.AddDays(1));
    }
}
