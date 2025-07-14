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

            var requestDto = new AvatarUploadRequestDto { File = file, AutoResize = true };
            var result = await _fileUploadService.UploadAvatarAsync(userId.Value, requestDto);

            if (!result.Success)
            {
                return BadRequest(new { success = false, message = result.ErrorMessage });
            }

            return Ok(new 
            { 
                success = true, 
                message = "Avatar upload successful", 
                data = new
                {
                    fileName = result.FileName,
                    originalName = result.OriginalFileName,
                    size = _fileUploadService.FormatFileSize(result.FileSize),
                    contentType = result.ContentType,
                    fileUrl = result.FileUrl,
                    uploadedAt = result.UploadedAt,
                    resizedVersions = result.ResizedVersions,
                    originalDimensions = result.OriginalDimensions
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
    /// Belirli bir ekli dosyayı ID'sine göre siler.
    /// </summary>
    /// <param name="attachmentId">Silinecek ekli dosyanın ID'si.</param>
    /// <returns>İşlemin başarılı olup olmadığını gösteren bir yanıt.</returns>
    /// <response code="200">Ekli dosya başarıyla silindi.</response>
    /// <response code="401">Yetkilendirme başarısız.</response>
    /// <response code="404">Ekli dosya bulunamadı veya kullanıcıya ait değil.</response>
    /// <response code="500">Sunucu hatası.</response>
    [HttpDelete("attachment/{attachmentId:int}")]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
    public async Task<IActionResult> DeleteAttachment(int attachmentId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
            }

            _logger.LogInformation("Delete attachment {AttachmentId} by user {UserId}", attachmentId, userId);

            var result = await _fileUploadService.DeleteAttachmentAsync(attachmentId, userId.Value);

            if (result)
            {
                return Ok(ApiResponseModel<object>.SuccessResponse("Ekli dosya başarıyla silindi."));
            }
            else
            {
                return NotFound(ApiResponseModel<object>.ErrorResponse("Ekli dosya bulunamadı veya silinemedi."));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting attachment {AttachmentId}", attachmentId);
            return StatusCode(500, ApiResponseModel<object>.ErrorResponse("Ekli dosya silinirken bir hata oluştu."));
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

    /// <summary>
    /// Belirli bir göreve ait ekli dosyaların listesini getirir.
    /// </summary>
    /// <param name="taskId">Ekli dosyaları getirilecek görevin ID'si.</param>
    /// <returns>Ekli dosya listesi.</returns>
    /// <response code="200">Ekli dosyalar başarıyla getirildi.</response>
    /// <response code="401">Yetkilendirme başarısız.</response>
    /// <response code="500">Sunucu hatası.</response>
    [HttpGet("attachments/task/{taskId:int}")]
    [ProducesResponseType(typeof(ApiResponseModel<List<AttachmentDto>>), 200)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
    public async Task<ActionResult<ApiResponseModel<List<AttachmentDto>>>> GetAttachmentsForTask(int taskId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
            }

            var result = await _fileUploadService.GetAttachmentsForTaskAsync(taskId, userId.Value);

            if (!result.Success)
            {
                return BadRequest(ApiResponseModel<List<AttachmentDto>>.ErrorResponse(result.Message));
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting attachments for task {TaskId}", taskId);
            return StatusCode(500, ApiResponseModel<List<AttachmentDto>>.ErrorResponse("Ekli dosyalar getirilirken bir hata oluştu."));
        }
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
        {
            return userId;
        }
        return null;
    }
}
