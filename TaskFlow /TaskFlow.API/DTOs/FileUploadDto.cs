using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.DTOs;

/// <summary>
/// Dosya upload response modeli
/// Upload işlemi sonucu döndürülen bilgiler
/// </summary>
public class FileUploadResponseDto
{
    /// <summary>Dosyanın sunucudaki benzersiz adı</summary>
    public string FileName { get; set; } = string.Empty;
    
    /// <summary>Dosyanın orijinal adı</summary>
    public string OriginalFileName { get; set; } = string.Empty;
    
    /// <summary>Dosyaya erişim URL'si</summary>
    public string FileUrl { get; set; } = string.Empty;
    
    /// <summary>Dosya boyutu (bytes)</summary>
    public long FileSize { get; set; }
    
    /// <summary>Dosya tipi (MIME type)</summary>
    public string ContentType { get; set; } = string.Empty;
    
    /// <summary>Upload tarihi</summary>
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>Upload başarılı mı?</summary>
    public bool Success { get; set; }
    
    /// <summary>Hata mesajı (varsa)</summary>
    public string? ErrorMessage { get; set; }
}

/// <summary>
/// Avatar upload response modeli
/// Avatar-specific bilgiler içerir
/// </summary>
public class AvatarUploadResponseDto : FileUploadResponseDto
{
    /// <summary>Resize edilmiş boyutlar</summary>
    public Dictionary<string, string> ResizedVersions { get; set; } = new();
    
    /// <summary>Dominant renk (hex)</summary>
    public string? DominantColor { get; set; }
    
    /// <summary>Orijinal resim boyutları</summary>
    public ImageDimensions OriginalDimensions { get; set; } = new();
}

/// <summary>
/// Task attachment upload response
/// </summary>
public class AttachmentUploadResponseDto : FileUploadResponseDto
{
    /// <summary>Attachment'ın ait olduğu task ID</summary>
    public int TaskId { get; set; }
    
    /// <summary>Dosya açıklaması</summary>
    public string? Description { get; set; }
    
    /// <summary>Dosya kategorisi (document, image, archive vb.)</summary>
    public string FileCategory { get; set; } = string.Empty;
}

/// <summary>
/// Upload request base modeli
/// </summary>
public class FileUploadRequestDto
{
    /// <summary>Upload edilecek dosya</summary>
    [Required(ErrorMessage = "Dosya seçilmesi zorunludur")]
    public IFormFile File { get; set; } = null!;
    
    /// <summary>Dosya açıklaması (opsiyonel)</summary>
    [StringLength(500, ErrorMessage = "Açıklama en fazla 500 karakter olabilir")]
    public string? Description { get; set; }
}

/// <summary>
/// Avatar upload request modeli
/// </summary>
public class AvatarUploadRequestDto : FileUploadRequestDto
{
    /// <summary>Avatar boyutları otomatik resize edilsin mi?</summary>
    public bool AutoResize { get; set; } = true;
    
    /// <summary>Eski avatar silinsin mi?</summary>
    public bool DeleteOldAvatar { get; set; } = true;
}

/// <summary>
/// Task attachment upload request
/// </summary>
public class AttachmentUploadRequestDto : FileUploadRequestDto
{
    /// <summary>Attachment'ın ekleneceği task ID</summary>
    [Required(ErrorMessage = "Task ID gereklidir")]
    public int TaskId { get; set; }
    
    /// <summary>Dosya kategorisi</summary>
    public string FileCategory { get; set; } = "document";
}

/// <summary>
/// Resim boyut bilgileri
/// </summary>
public class ImageDimensions
{
    /// <summary>Genişlik (pixel)</summary>
    public int Width { get; set; }
    
    /// <summary>Yükseklik (pixel)</summary>
    public int Height { get; set; }
    
    /// <summary>Aspect ratio</summary>
    public double AspectRatio => Height > 0 ? (double)Width / Height : 0;
}

/// <summary>
/// Dosya validation ayarları
/// </summary>
public class FileValidationSettings
{
    /// <summary>Maximum dosya boyutu (bytes)</summary>
    public long MaxFileSize { get; set; } = 5 * 1024 * 1024; // 5MB default
    
    /// <summary>İzin verilen dosya tipleri</summary>
    public string[] AllowedContentTypes { get; set; } = Array.Empty<string>();
    
    /// <summary>İzin verilen dosya uzantıları</summary>
    public string[] AllowedExtensions { get; set; } = Array.Empty<string>();
    
    /// <summary>Dosya adında yasak karakterler</summary>
    public char[] ForbiddenChars { get; set; } = { '<', '>', ':', '"', '|', '?', '*' };
}

/// <summary>
/// Avatar resize ayarları
/// </summary>
public class AvatarResizeSettings
{
    /// <summary>Thumbnail boyutu</summary>
    public int ThumbnailSize { get; set; } = 64;
    
    /// <summary>Small boyut</summary>
    public int SmallSize { get; set; } = 128;
    
    /// <summary>Medium boyut</summary>
    public int MediumSize { get; set; } = 256;
    
    /// <summary>Large boyut</summary>
    public int LargeSize { get; set; } = 512;
    
    /// <summary>JPEG kalitesi (1-100)</summary>
    public int JpegQuality { get; set; } = 85;
    
    /// <summary>Progressive JPEG kullanılsın mı?</summary>
    public bool UseProgressiveJpeg { get; set; } = true;
} 