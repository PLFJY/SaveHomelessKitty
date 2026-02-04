using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SaveHomelessKitty.Data;

namespace SaveHomelessKitty.Controllers.Admin;

/// <summary>
/// Admin APIs for downloading media files.
/// </summary>
[ApiController]
[Authorize]
[Route("api/admin/media")]
public class MediaController : ControllerBase
{
    private readonly AppDbContext _db;

    public MediaController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Download a media file by ID.
    /// </summary>
    /// <param name="id">Media file ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Media file stream or 404 if not found.</returns>
    [HttpGet("{id:guid}")]
    [Authorize(Policy = "perm:media.read")]
    public async Task<IActionResult> GetMedia(Guid id, CancellationToken cancellationToken = default)
    {
        var media = await _db.MediaFiles.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (media == null)
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(media.Path) || !System.IO.File.Exists(media.Path))
        {
            return NotFound();
        }

        var contentType = string.IsNullOrWhiteSpace(media.ContentType)
            ? "application/octet-stream"
            : media.ContentType;

        return PhysicalFile(media.Path, contentType);
    }
}
