using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SaveHomelessKitty.Data;
using SaveHomelessKitty.Dtos;
using SaveHomelessKitty.Models;

namespace SaveHomelessKitty.Controllers.Admin;

/// <summary>
/// Admin APIs for managing cat profiles.
/// </summary>
[ApiController]
[Route("api/admin/cats")]
public class CatsController : ControllerBase
{
    private readonly AppDbContext _db;

    public CatsController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Fuzzy search cats by code, alias, or description.
    /// </summary>
    /// <param name="query">Keyword for fuzzy match.</param>
    /// <param name="includeInactive">Whether to include inactive cats.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of matched cat IDs.</returns>
    [HttpGet("search")]
    [Authorize(Policy = "perm:cats.read")]
    public async Task<ActionResult> SearchCats(
        [FromQuery] string query,
        [FromQuery] bool includeInactive = false,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return BadRequest("QueryRequired");
        }

        var keyword = query.Trim();

        var catsQuery = _db.Cats.AsQueryable();
        if (!includeInactive)
        {
            catsQuery = catsQuery.Where(x => x.IsActive);
        }

        var pattern = $"%{keyword}%";
        var result = await catsQuery
            .Where(x =>
                EF.Functions.Like(x.Code, pattern) ||
                EF.Functions.Like(x.Alias, pattern) ||
                EF.Functions.Like(x.Description, pattern))
            .OrderBy(x => x.Code)
            .Select(x => new { x.Id })
            .ToListAsync(cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Get all cats.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of cats.</returns>
    [HttpGet]
    [Authorize(Policy = "perm:cats.read")]
    public async Task<ActionResult> GetCats(CancellationToken cancellationToken)
    {
        var cats = await _db.Cats
            .OrderBy(x => x.Code)
            .Select(x => new
            {
                x.Id,
                x.Code,
                x.Alias,
                x.Description,
                x.FirstSeenAtUtc,
                x.LastSeenAtUtc,
                x.PrimaryImageId,
                x.IsActive
            })
            .ToListAsync(cancellationToken);

        return Ok(cats);
    }

    /// <summary>
    /// Get a cat by ID.
    /// </summary>
    /// <param name="id">Cat ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Cat detail or 404 if not found.</returns>
    [HttpGet("{id:guid}")]
    [Authorize(Policy = "perm:cats.read")]
    public async Task<ActionResult> GetCat(Guid id, CancellationToken cancellationToken)
    {
        var cat = await _db.Cats.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (cat == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            cat.Id,
            cat.Code,
            cat.Alias,
            cat.Description,
            cat.FirstSeenAtUtc,
            cat.LastSeenAtUtc,
            cat.PrimaryImageId,
            cat.IsActive
        });
    }

    /// <summary>
    /// Create a new cat profile.
    /// </summary>
    /// <param name="request">Cat payload.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>201 with the new cat ID.</returns>
    [HttpPost]
    [Authorize(Policy = "perm:cats.write")]
    public async Task<ActionResult> CreateCat([FromBody] CatUpsertRequest request, CancellationToken cancellationToken)
    {
        var nowUtc = DateTime.UtcNow;
        var cat = new Cat
        {
            Id = Guid.NewGuid(),
            Code = request.Code ?? string.Empty,
            Alias = request.Alias ?? string.Empty,
            Description = request.Description ?? string.Empty,
            FirstSeenAtUtc = request.FirstSeenAtUtc,
            LastSeenAtUtc = request.LastSeenAtUtc,
            PrimaryImageId = request.PrimaryImageId,
            IsActive = request.IsActive,
            CreatedAtUtc = nowUtc,
            UpdatedAtUtc = nowUtc
        };

        _db.Cats.Add(cat);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetCat), new { id = cat.Id }, new { cat.Id });
    }

    /// <summary>
    /// Update an existing cat profile.
    /// </summary>
    /// <param name="id">Cat ID.</param>
    /// <param name="request">Cat payload.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>HTTP 200 when updated.</returns>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = "perm:cats.write")]
    public async Task<ActionResult> UpdateCat(Guid id, [FromBody] CatUpsertRequest request, CancellationToken cancellationToken)
    {
        var cat = await _db.Cats.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (cat == null)
        {
            return NotFound();
        }

        cat.Code = request.Code ?? string.Empty;
        cat.Alias = request.Alias ?? string.Empty;
        cat.Description = request.Description ?? string.Empty;
        cat.FirstSeenAtUtc = request.FirstSeenAtUtc;
        cat.LastSeenAtUtc = request.LastSeenAtUtc;
        cat.PrimaryImageId = request.PrimaryImageId;
        cat.IsActive = request.IsActive;
        cat.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    /// <summary>
    /// Delete a cat profile.
    /// </summary>
    /// <param name="id">Cat ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>HTTP 200 when deleted.</returns>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "perm:cats.write")]
    public async Task<ActionResult> DeleteCat(Guid id, CancellationToken cancellationToken)
    {
        var cat = await _db.Cats.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (cat == null)
        {
            return NotFound();
        }

        _db.Cats.Remove(cat);
        await _db.SaveChangesAsync(cancellationToken);
        return Ok();
    }
}
