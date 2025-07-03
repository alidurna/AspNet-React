using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;
using System.Text.RegularExpressions;

namespace TaskFlow.API.Services;

/// <summary>
/// File upload servis implementasyonu
/// Avatar ve attachment upload, resize ve yönetim işlemlerini handle eder
/// </summary>
public class FileUploadService : IFileUploadService
{
    private readonly ILogger<FileUploadService> _logger;
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;
    
    // Upload klasör yolları
    private readonly string _uploadsPath;
    private readonly string _avatarsPath;
    private readonly string _attachmentsPath;
    
    // Validation ayarları
    private readonly FileValidationSettings _avatarValidation;
    private readonly FileValidationSettings _attachmentValidation;
    private readonly AvatarResizeSettings _resizeSettings;

    /// <summary>
    /// FileUploadService constructor
    /// </summary>
    public FileUploadService(
        ILogger<FileUploadService> logger,
        IWebHostEnvironment environment,
        IConfiguration configuration)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _environment = environment ?? throw new ArgumentNullException(nameof(environment));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        
        // Upload klasörlerini ayarla
        _uploadsPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads");
        _avatarsPath = Path.Combine(_uploadsPath, "avatars");
        _attachmentsPath = Path.Combine(_uploadsPath, "attachments");
        
        // Klasörleri oluştur
        EnsureDirectoriesExist();
        
        // Validation ayarlarını yükle
        _avatarValidation = LoadAvatarValidationSettings();
        _attachmentValidation = LoadAttachmentValidationSettings();
        _resizeSettings = LoadAvatarResizeSettings();
        
        _logger.LogInformation("FileUploadService initialized. Upload path: {UploadPath}", _uploadsPath);
    }

    #region Interface Implementation Placeholder

    public async Task<AvatarUploadResponseDto> UploadAvatarAsync(int userId, AvatarUploadRequestDto request)
    {
        try
        {
            // Validate file
            var validationResult = await ValidateFileAsync(request.File, _avatarValidation);
            if (!validationResult.IsValid)
            {
                return new AvatarUploadResponseDto
                {
                    Success = false,
                    ErrorMessage = validationResult.ErrorMessage
                };
            }

            // Generate safe filename
            var fileName = GenerateSafeFileName(request.File.FileName, $"user_{userId}_avatar");
            var avatarPath = Path.Combine(_avatarsPath, fileName);

            // Save original file
            await using var stream = new FileStream(avatarPath, FileMode.Create);
            await request.File.CopyToAsync(stream);

            // Generate response
            var response = new AvatarUploadResponseDto
            {
                Success = true,
                FileName = fileName,
                OriginalFileName = request.File.FileName,
                FileSize = request.File.Length,
                ContentType = request.File.ContentType,
                UploadedAt = DateTime.UtcNow,
                FileUrl = $"/uploads/avatars/{fileName}"
            };

            // If resize is requested, generate resized versions
            if (request.AutoResize && IsImageFile(request.File.ContentType))
            {
                var resizedVersions = await GenerateResizedVersionsAsync(avatarPath, fileName);
                response.ResizedVersions = resizedVersions;
                
                // Add image dimensions
                response.OriginalDimensions = await GetImageDimensionsAsync(avatarPath);
            }

            _logger.LogInformation("Avatar uploaded successfully for user {UserId}: {FileName}", userId, fileName);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Avatar upload failed for user {UserId}", userId);
            return new AvatarUploadResponseDto
            {
                Success = false,
                ErrorMessage = $"Avatar upload failed: {ex.Message}"
            };
        }
    }

    public async Task<AttachmentUploadResponseDto> UploadAttachmentAsync(int userId, AttachmentUploadRequestDto request)
    {
        try
        {
            // Validate file
            var validationResult = await ValidateFileAsync(request.File, _attachmentValidation);
            if (!validationResult.IsValid)
            {
                return new AttachmentUploadResponseDto
                {
                    Success = false,
                    ErrorMessage = validationResult.ErrorMessage
                };
            }

            // Generate safe filename
            var fileName = GenerateSafeFileName(request.File.FileName, $"task_{request.TaskId}_attachment");
            var attachmentPath = Path.Combine(_attachmentsPath, fileName);

            // Save file to disk
            await using var stream = new FileStream(attachmentPath, FileMode.Create);
            await request.File.CopyToAsync(stream);

            // Generate response
            var response = new AttachmentUploadResponseDto
            {
                Success = true,
                FileName = fileName,
                OriginalFileName = request.File.FileName,
                FileSize = request.File.Length,
                ContentType = request.File.ContentType,
                UploadedAt = DateTime.UtcNow,
                FileUrl = $"/uploads/attachments/{fileName}",
                TaskId = request.TaskId,
                Description = request.Description,
                FileCategory = GetFileCategory(request.File.ContentType, request.File.FileName)
            };

            _logger.LogInformation("Attachment uploaded successfully for user {UserId}, task {TaskId}: {FileName}", 
                userId, request.TaskId, fileName);
            
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Attachment upload failed for user {UserId}, task {TaskId}", userId, request.TaskId);
            return new AttachmentUploadResponseDto
            {
                Success = false,
                ErrorMessage = $"Attachment upload failed: {ex.Message}"
            };
        }
    }

    public async Task<FileUploadResponseDto> UploadFileAsync(FileUploadRequestDto request, string subFolder = "general")
    {
        try
        {
            // Basic validation
            if (request.File == null || request.File.Length == 0)
            {
                return new FileUploadResponseDto
                {
                    Success = false,
                    ErrorMessage = "Dosya seçilmedi"
                };
            }

            // Create subfolder if not exists
            var targetPath = Path.Combine(_uploadsPath, subFolder);
            Directory.CreateDirectory(targetPath);

            // Generate safe filename
            var fileName = GenerateSafeFileName(request.File.FileName, $"file");
            var filePath = Path.Combine(targetPath, fileName);

            // Save file to disk
            await using var stream = new FileStream(filePath, FileMode.Create);
            await request.File.CopyToAsync(stream);

            // Generate response
            var response = new FileUploadResponseDto
            {
                Success = true,
                FileName = fileName,
                OriginalFileName = request.File.FileName,
                FileSize = request.File.Length,
                ContentType = request.File.ContentType,
                UploadedAt = DateTime.UtcNow,
                FileUrl = $"/uploads/{subFolder}/{fileName}"
            };

            _logger.LogInformation("File uploaded successfully to {SubFolder}: {FileName}", subFolder, fileName);
            
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "File upload failed to {SubFolder}", subFolder);
            return new FileUploadResponseDto
            {
                Success = false,
                ErrorMessage = $"File upload failed: {ex.Message}"
            };
        }
    }

    public async Task<(bool IsValid, string? ErrorMessage)> ValidateFileAsync(IFormFile file, FileValidationSettings settings)
    {
        if (file == null || file.Length == 0)
        {
            return (false, "Dosya seçilmedi");
        }

        // Dosya boyutu kontrolü
        if (file.Length > settings.MaxFileSize)
        {
            return (false, $"Dosya boyutu çok büyük. Maksimum {FormatFileSize(settings.MaxFileSize)} olabilir");
        }

        // Content type kontrolü
        if (settings.AllowedContentTypes.Any() && !settings.AllowedContentTypes.Contains(file.ContentType))
        {
            return (false, "Dosya tipi desteklenmiyor");
        }

        // Dosya uzantısı kontrolü
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (settings.AllowedExtensions.Any() && !settings.AllowedExtensions.Contains(extension))
        {
            return (false, "Dosya uzantısı desteklenmiyor");
        }

        // Dosya adında yasak karakter kontrolü
        var fileName = Path.GetFileName(file.FileName);
        if (settings.ForbiddenChars.Any(c => fileName.Contains(c)))
        {
            return (false, "Dosya adında yasak karakterler var");
        }

        return (true, null);
    }

    public async Task<bool> DeleteFileAsync(string fileName, string subFolder = "general")
    {
        try
        {
            var filePath = Path.Combine(_uploadsPath, subFolder, fileName);
            
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                _logger.LogInformation("File deleted: {FilePath}", filePath);
                return true;
            }
            
            _logger.LogWarning("File not found for deletion: {FilePath}", filePath);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file: {FileName}", fileName);
            return false;
        }
    }

    public async Task<bool> DeleteUserAvatarsAsync(int userId)
    {
        try
        {
            var deletedCount = 0;
            var avatarDirectory = new DirectoryInfo(_avatarsPath);
            
            if (!avatarDirectory.Exists)
            {
                _logger.LogWarning("Avatar directory does not exist: {AvatarPath}", _avatarsPath);
                return true; // Klasör yoksa zaten temiz
            }

            // User'a ait avatar dosyalarını bul (pattern: user_{userId}_avatar_*)
            var userAvatarPattern = $"user_{userId}_avatar_*";
            var userAvatarFiles = avatarDirectory.GetFiles(userAvatarPattern);

            foreach (var file in userAvatarFiles)
            {
                try
                {
                    file.Delete();
                    deletedCount++;
                    _logger.LogDebug("Deleted avatar file: {FileName}", file.Name);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to delete avatar file: {FileName}", file.Name);
                }
            }

            // Resize edilmiş versiyonları da sil (thumb_, small_, medium_, large_)
            var resizePrefixes = new[] { "thumb_", "small_", "medium_", "large_" };
            foreach (var prefix in resizePrefixes)
            {
                var resizePattern = $"{prefix}user_{userId}_avatar_*";
                var resizeFiles = avatarDirectory.GetFiles(resizePattern);
                
                foreach (var file in resizeFiles)
                {
                    try
                    {
                        file.Delete();
                        deletedCount++;
                        _logger.LogDebug("Deleted resized avatar file: {FileName}", file.Name);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to delete resized avatar file: {FileName}", file.Name);
                    }
                }
            }

            _logger.LogInformation("Deleted {Count} avatar files for user {UserId}", deletedCount, userId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting avatars for user {UserId}", userId);
            return false;
        }
    }

    public async Task<int> DeleteTaskAttachmentsAsync(int taskId)
    {
        try
        {
            var deletedCount = 0;
            var attachmentDirectory = new DirectoryInfo(_attachmentsPath);
            
            if (!attachmentDirectory.Exists)
            {
                _logger.LogWarning("Attachment directory does not exist: {AttachmentPath}", _attachmentsPath);
                return 0; // Klasör yoksa silecek bir şey yok
            }

            // Task'a ait attachment dosyalarını bul (pattern: task_{taskId}_attachment_*)
            var taskAttachmentPattern = $"task_{taskId}_attachment_*";
            var taskAttachmentFiles = attachmentDirectory.GetFiles(taskAttachmentPattern);

            foreach (var file in taskAttachmentFiles)
            {
                try
                {
                    file.Delete();
                    deletedCount++;
                    _logger.LogDebug("Deleted attachment file: {FileName}", file.Name);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to delete attachment file: {FileName}", file.Name);
                }
            }

            _logger.LogInformation("Deleted {Count} attachment files for task {TaskId}", deletedCount, taskId);
            return deletedCount;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting attachments for task {TaskId}", taskId);
            return 0;
        }
    }

    public string FormatFileSize(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB", "TB" };
        double len = bytes;
        int order = 0;
        
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len /= 1024;
        }
        
        return $"{len:0.##} {sizes[order]}";
    }

    public string GetFileCategory(string contentType, string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        
        // Resim dosyaları
        if (contentType.StartsWith("image/") || 
            new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp" }.Contains(extension))
        {
            return "image";
        }
        
        // Doküman dosyaları
        if (contentType.StartsWith("text/") ||
            new[] { ".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt" }.Contains(extension))
        {
            return "document";
        }
        
        return "other";
    }

    public string GenerateSafeFileName(string originalFileName, string? prefix = null)
    {
        // Dosya adını temizle
        var fileName = Path.GetFileNameWithoutExtension(originalFileName);
        var extension = Path.GetExtension(originalFileName);
        
        // Özel karakterleri temizle
        fileName = Regex.Replace(fileName, @"[^\w\-_\.]", "_");
        fileName = fileName.Trim('_', '-', '.');
        
        // Boş ise varsayılan ad ver
        if (string.IsNullOrEmpty(fileName))
        {
            fileName = "file";
        }
        
        // Prefix ekle
        if (!string.IsNullOrEmpty(prefix))
        {
            fileName = $"{prefix}_{fileName}";
        }
        
        // Timestamp ekle (benzersizlik için)
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        fileName = $"{fileName}_{timestamp}";
        
        // Extension ekle
        return $"{fileName}{extension.ToLowerInvariant()}";
    }

    #endregion

    #region Private Helper Methods

    /// <summary>
    /// Gerekli klasörleri oluşturur
    /// </summary>
    private void EnsureDirectoriesExist()
    {
        Directory.CreateDirectory(_uploadsPath);
        Directory.CreateDirectory(_avatarsPath);
        Directory.CreateDirectory(_attachmentsPath);
    }

    /// <summary>
    /// Avatar validation ayarlarını yükler
    /// </summary>
    private FileValidationSettings LoadAvatarValidationSettings()
    {
        return new FileValidationSettings
        {
            MaxFileSize = _configuration.GetValue("FileUpload:Avatar:MaxSizeBytes", 5 * 1024 * 1024), // 5MB
            AllowedContentTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" },
            AllowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" }
        };
    }

    /// <summary>
    /// Attachment validation ayarlarını yükler
    /// </summary>
    private FileValidationSettings LoadAttachmentValidationSettings()
    {
        return new FileValidationSettings
        {
            MaxFileSize = _configuration.GetValue("FileUpload:Attachment:MaxSizeBytes", 10 * 1024 * 1024), // 10MB
            AllowedContentTypes = new[]
            {
                "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
                "application/pdf", "text/plain", "application/msword"
            },
            AllowedExtensions = new[]
            {
                ".jpg", ".jpeg", ".png", ".gif", ".webp",
                ".pdf", ".txt", ".doc", ".docx", ".zip", ".rar"
            }
        };
    }

    /// <summary>
    /// Avatar resize ayarlarını yükler
    /// </summary>
    private AvatarResizeSettings LoadAvatarResizeSettings()
    {
        return new AvatarResizeSettings
        {
            ThumbnailSize = _configuration.GetValue("FileUpload:Avatar:ThumbnailSize", 64),
            SmallSize = _configuration.GetValue("FileUpload:Avatar:SmallSize", 128),
            MediumSize = _configuration.GetValue("FileUpload:Avatar:MediumSize", 256),
            LargeSize = _configuration.GetValue("FileUpload:Avatar:LargeSize", 512),
            JpegQuality = _configuration.GetValue("FileUpload:Avatar:JpegQuality", 85),
            UseProgressiveJpeg = _configuration.GetValue("FileUpload:Avatar:UseProgressiveJpeg", true)
        };
    }

    #endregion

    #region Image Processing Methods

    /// <summary>
    /// Dosyanın resim dosyası olup olmadığını kontrol eder
    /// </summary>
    private bool IsImageFile(string contentType)
    {
        return contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Avatar için farklı boyutlarda resim oluşturur
    /// </summary>
    private async Task<Dictionary<string, string>> GenerateResizedVersionsAsync(string originalPath, string fileName)
    {
        var resizedVersions = new Dictionary<string, string>();
        
        try
        {
            using var image = await Image.LoadAsync(originalPath);
            
            // Thumbnail (64x64)
            await CreateResizedVersionAsync(image, fileName, "thumb", _resizeSettings.ThumbnailSize);
            resizedVersions.Add("thumbnail", $"/uploads/avatars/thumb_{fileName}");
            
            // Small (128x128)
            await CreateResizedVersionAsync(image, fileName, "small", _resizeSettings.SmallSize);
            resizedVersions.Add("small", $"/uploads/avatars/small_{fileName}");
            
            // Medium (256x256)
            await CreateResizedVersionAsync(image, fileName, "medium", _resizeSettings.MediumSize);
            resizedVersions.Add("medium", $"/uploads/avatars/medium_{fileName}");
            
            // Large (512x512)
            await CreateResizedVersionAsync(image, fileName, "large", _resizeSettings.LargeSize);
            resizedVersions.Add("large", $"/uploads/avatars/large_{fileName}");
            
            _logger.LogDebug("Generated {Count} resized versions for {FileName}", resizedVersions.Count, fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating resized versions for {FileName}", fileName);
            // Hata durumunda boş dictionary döndür, upload başarısız olmasın
        }
        
        return resizedVersions;
    }

    /// <summary>
    /// Belirli boyutta resim oluşturur ve kaydeder
    /// </summary>
    private async Task CreateResizedVersionAsync(Image originalImage, string fileName, string prefix, int size)
    {
        try
        {
            var resizedFileName = $"{prefix}_{fileName}";
            var resizedPath = Path.Combine(_avatarsPath, resizedFileName);
            
            using var resizedImage = originalImage.Clone(ctx => ctx.Resize(new ResizeOptions
            {
                Size = new Size(size, size),
                Mode = ResizeMode.Crop, // Kare şeklinde crop et
                Position = AnchorPositionMode.Center // Ortadan crop et
            }));
            
            // Save with optimized quality
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            if (extension == ".jpg" || extension == ".jpeg")
            {
                await resizedImage.SaveAsJpegAsync(resizedPath, new JpegEncoder
                {
                    Quality = _resizeSettings.JpegQuality
                });
            }
            else if (extension == ".png")
            {
                await resizedImage.SaveAsPngAsync(resizedPath);
            }
            else
            {
                // Default to JPEG for other formats
                await resizedImage.SaveAsJpegAsync(resizedPath, new JpegEncoder
                {
                    Quality = _resizeSettings.JpegQuality
                });
            }
            
            _logger.LogDebug("Created resized version: {ResizedFileName} ({Size}x{Size})", resizedFileName, size, size);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating resized version {Prefix}_{FileName}", prefix, fileName);
        }
    }

    /// <summary>
    /// Resmin boyutlarını alır
    /// </summary>
    private async Task<ImageDimensions> GetImageDimensionsAsync(string imagePath)
    {
        try
        {
            using var image = await Image.LoadAsync(imagePath);
            return new ImageDimensions
            {
                Width = image.Width,
                Height = image.Height
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting image dimensions for {ImagePath}", imagePath);
            return new ImageDimensions { Width = 0, Height = 0 };
        }
    }

    #endregion
} 