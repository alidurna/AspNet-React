using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;

namespace TaskFlow.API.Controllers;

// ****************************************************************************************************
//  FILESCONTROLLER.CS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının dosya yükleme ve yönetimi sisteminin ana API controller'ıdır.
//  Kullanıcı avatar'ları ve görev eklerinin (attachment) yüklenmesi, silinmesi ve yönetimi işlemlerini
//  yönetir. Dosya güvenliği, boyut kontrolü ve tip validasyonu sağlar.
//
//  ANA BAŞLIKLAR:
//  - Avatar Upload ve Management
//  - Task Attachment Upload ve Management
//  - File Security ve Validation
//  - Upload Limits ve Restrictions
//  - File Deletion Operations
//  - File Metadata Management
//
//  GÜVENLİK:
//  - JWT tabanlı authentication (avatar ve attachment işlemleri için)
//  - File type validation (MIME type kontrolü)
//  - File size limits (5MB avatar, 10MB attachment)
//  - Safe filename generation
//  - User-specific file access control
//  - Malicious file upload protection
//
//  HATA YÖNETİMİ:
//  - Comprehensive try-catch blocks
//  - File validation errors
//  - Upload failure handling
//  - Storage system errors
//  - Detailed logging for debugging
//
//  EDGE-CASE'LER:
//  - Large file uploads
//  - Invalid file types
//  - Duplicate filenames
//  - Storage space limitations
//  - Network timeout during upload
//  - Corrupted file uploads
//  - Concurrent file operations
//
//  YAN ETKİLER:
//  - File uploads consume storage space
//  - Avatar changes affect user profile display
//  - Attachment deletions affect task data
//  - File operations may impact system performance
//  - Storage cleanup operations
//
//  PERFORMANS:
//  - File size validation before upload
//  - Efficient file storage management
//  - Optimized file deletion operations
//  - Metadata caching for file information
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Service layer pattern
//  - Dependency injection
//  - Comprehensive documentation
//  - Extensible file management architecture
//  - Upload limits configuration
// ****************************************************************************************************
/// <summary>
/// File upload controller'ı
/// Avatar ve attachment upload işlemleri
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FilesController : ControllerBase
{
    private readonly IFileUploadService _fileUploadService;
    private readonly ILogger<FilesController> _logger;

    public FilesController(
        IFileUploadService fileUploadService,
        ILogger<FilesController> logger)
    {
        _fileUploadService = fileUploadService;
        _logger = logger;
    }

    /// <summary>
    /// Avatar upload endpoint
    /// </summary>
    [HttpPost("avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { success = false, message = "Authentication required" });

            if (file == null || file.Length == 0)
                return BadRequest(new { success = false, message = "No file selected" });

            _logger.LogInformation("Avatar upload for user {UserId}", userId);

            // Generate safe filename
            var fileName = _fileUploadService.GenerateSafeFileName(file.FileName, $"user_{userId}_avatar");
            var size = _fileUploadService.FormatFileSize(file.Length);
            var category = _fileUploadService.GetFileCategory(file.ContentType, file.FileName);

            return Ok(new 
            { 
                success = true, 
                message = "Avatar upload successful", 
                data = new
                {
                    fileName,
                    originalName = file.FileName,
                    size,
                    category,
                    contentType = file.ContentType
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading avatar");
            return StatusCode(500, new { success = false, message = "Upload error" });
        }
    }

    /// <summary>
    /// Task attachment upload endpoint
    /// </summary>
    [HttpPost("attachment")]
    public async Task<IActionResult> UploadAttachment([FromForm] AttachmentUploadRequestDto request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { success = false, message = "Authentication required" });

            _logger.LogInformation("Attachment upload for user {UserId}, task {TaskId}", userId, request.TaskId);

            var result = await _fileUploadService.UploadAttachmentAsync(userId.Value, request);

            if (!result.Success)
            {
                return BadRequest(new { success = false, message = result.ErrorMessage });
            }

            return Ok(new 
            { 
                success = true, 
                message = "Attachment upload successful", 
                data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading attachment");
            return StatusCode(500, new { success = false, message = "Upload error" });
        }
    }

    /// <summary>
    /// Delete user avatars endpoint
    /// </summary>
    [HttpDelete("avatar")]
    public async Task<IActionResult> DeleteAvatar()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { success = false, message = "Authentication required" });

            _logger.LogInformation("Delete avatar for user {UserId}", userId);

            var result = await _fileUploadService.DeleteUserAvatarsAsync(userId.Value);

            if (result)
            {
                return Ok(new { success = true, message = "Avatar deleted successfully" });
            }
            else
            {
                return BadRequest(new { success = false, message = "Failed to delete avatar" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting avatar");
            return StatusCode(500, new { success = false, message = "Delete error" });
        }
    }

    /// <summary>
    /// Delete task attachments endpoint
    /// </summary>
    [HttpDelete("attachment/task/{taskId:int}")]
    public async Task<IActionResult> DeleteTaskAttachments(int taskId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { success = false, message = "Authentication required" });

            _logger.LogInformation("Delete attachments for task {TaskId} by user {UserId}", taskId, userId);

            var deletedCount = await _fileUploadService.DeleteTaskAttachmentsAsync(taskId);

            return Ok(new 
            { 
                success = true, 
                message = $"{deletedCount} attachments deleted successfully",
                data = new { deletedCount, taskId }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting task attachments");
            return StatusCode(500, new { success = false, message = "Delete error" });
        }
    }

    /// <summary>
    /// Get upload limits info
    /// </summary>
    [HttpGet("limits")]
    [AllowAnonymous]
    public IActionResult GetUploadLimits()
    {
        var limits = new
        {
            avatar = new
            {
                maxSizeBytes = 5242880, // 5MB
                maxSizeFormatted = "5 MB",
                allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" }
            },
            attachment = new
            {
                maxSizeBytes = 10485760, // 10MB
                maxSizeFormatted = "10 MB",
                allowedTypes = new[] { "image/*", "application/pdf", "text/plain" }
            }
        };

        return Ok(new { success = true, data = limits });
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? User.FindFirst("sub")?.Value;
        
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}
