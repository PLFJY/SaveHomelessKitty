using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SaveHomelessKitty.Data;
using SaveHomelessKitty.Dtos;
using SaveHomelessKitty.Models;
using SaveHomelessKitty.Models.Enums;

namespace SaveHomelessKitty.Controllers.Admin;

/// <summary>
/// Admin APIs for managing feeding rules.
/// </summary>
[ApiController]
[Route("api/admin/feedrules")]
public class FeedRulesController : ControllerBase
{
    private readonly AppDbContext _db;

    public FeedRulesController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Get all feed rules.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of rules.</returns>
    [HttpGet]
    public async Task<ActionResult> GetRules(CancellationToken cancellationToken)
    {
        var rules = await _db.FeedRules
            .OrderBy(x => x.ScopeType)
            .ThenBy(x => x.Name)
            .Select(x => new
            {
                x.Id,
                x.ScopeType,
                x.ScopeId,
                x.Name,
                x.DailyLimitCount,
                x.CooldownSeconds,
                x.IsActive
            })
            .ToListAsync(cancellationToken);

        return Ok(rules);
    }

    /// <summary>
    /// Create or update the global default rule.
    /// </summary>
    /// <param name="request">Rule payload.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>HTTP 200 when stored.</returns>
    [HttpPut("default")]
    public async Task<ActionResult> UpsertDefault([FromBody] FeedRuleUpsertRequest request, CancellationToken cancellationToken)
    {
        var rule = await _db.FeedRules
            .FirstOrDefaultAsync(x => x.ScopeType == RuleScope.Global, cancellationToken);

        if (rule == null)
        {
            rule = new FeedRule
            {
                Id = Guid.NewGuid(),
                ScopeType = RuleScope.Global,
                ScopeId = null,
                CreatedAtUtc = DateTime.UtcNow
            };
            _db.FeedRules.Add(rule);
        }

        ApplyRule(rule, request);
        rule.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    /// <summary>
    /// Create or update a rule scoped to a specific device.
    /// </summary>
    /// <param name="deviceId">Target device ID.</param>
    /// <param name="request">Rule payload.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>HTTP 200 when stored.</returns>
    [HttpPut("device/{deviceId:guid}")]
    public async Task<ActionResult> UpsertDeviceRule(Guid deviceId, [FromBody] FeedRuleUpsertRequest request, CancellationToken cancellationToken)
    {
        var rule = await _db.FeedRules
            .FirstOrDefaultAsync(x => x.ScopeType == RuleScope.Device && x.ScopeId == deviceId, cancellationToken);

        if (rule == null)
        {
            rule = new FeedRule
            {
                Id = Guid.NewGuid(),
                ScopeType = RuleScope.Device,
                ScopeId = deviceId,
                CreatedAtUtc = DateTime.UtcNow
            };
            _db.FeedRules.Add(rule);
        }

        ApplyRule(rule, request);
        rule.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    /// <summary>
    /// Create or update a rule scoped to a specific cat.
    /// </summary>
    /// <param name="catId">Target cat ID.</param>
    /// <param name="request">Rule payload.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>HTTP 200 when stored.</returns>
    [HttpPut("cat/{catId:guid}")]
    public async Task<ActionResult> UpsertCatRule(Guid catId, [FromBody] FeedRuleUpsertRequest request, CancellationToken cancellationToken)
    {
        var rule = await _db.FeedRules
            .FirstOrDefaultAsync(x => x.ScopeType == RuleScope.Cat && x.ScopeId == catId, cancellationToken);

        if (rule == null)
        {
            rule = new FeedRule
            {
                Id = Guid.NewGuid(),
                ScopeType = RuleScope.Cat,
                ScopeId = catId,
                CreatedAtUtc = DateTime.UtcNow
            };
            _db.FeedRules.Add(rule);
        }

        ApplyRule(rule, request);
        rule.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    private static void ApplyRule(FeedRule rule, FeedRuleUpsertRequest request)
    {
        rule.Name = string.IsNullOrWhiteSpace(request.Name) ? rule.Name : request.Name;
        rule.DailyLimitCount = request.DailyLimitCount;
        rule.CooldownSeconds = request.CooldownSeconds;
        rule.IsActive = request.IsActive;
    }
}
