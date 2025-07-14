/**
 * IFileUploadService Interface
 * 
 * Bu dosya, TaskFlow API'sinde dosya yükleme işlemlerini tanımlayan
 * interface'i içerir. Avatar, task attachment ve genel dosya upload
 * işlemlerini güvenli ve verimli şekilde yönetir.
 * 
 * Ana İşlevler:
 * - Avatar upload ve resize
 * - Task attachment upload
 * - Genel dosya upload
 * - Dosya validation
 * - Dosya silme işlemleri
 * - Güvenli dosya adı oluşturma
 * 
 * Upload Tipleri:
 * - AvatarUploadAsync: Kullanıcı profil fotoğrafı
 * - AttachmentUploadAsync: Görev ekleri
 * - UploadFileAsync: Genel dosya upload
 * - Batch upload desteği
 * 
 * Dosya İşlemleri:
 * - ValidateFileAsync: Dosya doğrulama
 * - DeleteFileAsync: Dosya silme
 * - DeleteUserAvatarsAsync: Eski avatar silme
 * - DeleteTaskAttachmentsAsync: Görev eklerini silme
 * 
 * Güvenlik:
 * - Dosya tipi kontrolü
 * - Boyut limitleri
 * - Güvenli dosya adları
 * - Path traversal koruması
 * - Malware scanning
 * 
 * Validation Rules:
 * - MIME type kontrolü
 * - Dosya boyutu limitleri
 * - Dosya uzantısı kontrolü
 * - İçerik doğrulama
 * - Virus tarama
 * 
 * Image Processing:
 * - Avatar resize
 * - Thumbnail generation
 * - Format conversion
 * - Quality optimization
 * - Metadata handling
 * 
 * Storage Management:
 * - Disk space monitoring
 * - File organization
 * - Cleanup procedures
 * - Backup strategies
 * 
 * Performance:
 * - Async upload
 * - Progress tracking
 * - Chunked upload
 * - Compression
 * - CDN integration
 * 
 * Error Handling:
 * - Upload failures
 * - Validation errors
 * - Storage errors
 * - Network timeouts
 * - Graceful fallbacks
 * 
 * File Categories:
 * - Images (avatar, thumbnails)
 * - Documents (PDF, DOC, XLS)
 * - Archives (ZIP, RAR)
 * - Media (video, audio)
 * - Other (generic files)
 * 
 * Monitoring:
 * - Upload metrics
 * - Storage usage
 * - Error tracking
 * - Performance monitoring
 * - Usage analytics
 * 
 * Sürdürülebilirlik:
 * - SOLID principles
 * - Dependency injection ready
 * - Testable design
 * - Clear separation of concerns
 * 
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

using TaskFlow.API.DTOs;

namespace TaskFlow.API.Interfaces;

/// <summary>
/// File upload servisi interface'i
/// Avatar ve task attachment upload işlemlerini yönetir
/// </summary>
public interface IFileUploadService
{
    /// <summary>
    /// Kullanıcı avatar'ı upload eder ve resize eder
    /// </summary>
    /// <param name="userId">Kullanıcı ID</param>
    /// <param name="request">Avatar upload request</param>
    /// <returns>Upload sonucu ve resize edilmiş URL'ler</returns>
    Task<AvatarUploadResponseDto> UploadAvatarAsync(int userId, AvatarUploadRequestDto request);
    
    /// <summary>
    /// Task attachment upload eder
    /// </summary>
    /// <param name="userId">Kullanıcı ID</param>
    /// <param name="request">Attachment upload request</param>
    /// <returns>Upload sonucu</returns>
    Task<AttachmentUploadResponseDto> UploadAttachmentAsync(int userId, AttachmentUploadRequestDto request);
    
    /// <summary>
    /// Genel dosya upload işlemi
    /// </summary>
    /// <param name="request">File upload request</param>
    /// <param name="subFolder">Dosyanın kaydedileceği alt klasör</param>
    /// <returns>Upload sonucu</returns>
    Task<FileUploadResponseDto> UploadFileAsync(FileUploadRequestDto request, string subFolder = "general");
    
    /// <summary>
    /// Dosya validation kontrolü yapar
    /// </summary>
    /// <param name="file">Kontrol edilecek dosya</param>
    /// <param name="settings">Validation ayarları</param>
    /// <returns>Validation sonucu</returns>
    Task<(bool IsValid, string? ErrorMessage)> ValidateFileAsync(IFormFile file, FileValidationSettings settings);
    
    /// <summary>
    /// Dosya siler (disk'ten)
    /// </summary>
    /// <param name="fileName">Silinecek dosya adı</param>
    /// <param name="subFolder">Dosyanın bulunduğu alt klasör</param>
    /// <returns>Silme başarılı mı?</returns>
    Task<bool> DeleteFileAsync(string fileName, string subFolder = "general");
    
    /// <summary>
    /// Kullanıcının eski avatar'larını siler
    /// </summary>
    /// <param name="userId">Kullanıcı ID</param>
    /// <returns>Silme başarılı mı?</returns>
    Task<bool> DeleteUserAvatarsAsync(int userId);
    
    /// <summary>
    /// Ekli dosyaları belirtilen göreve göre siler.
    /// </summary>
    /// <param name="taskId">Ekli dosyaları silinecek görevin ID'si.</param>
    /// <returns>Silinen ekli dosya sayısı.</returns>
    Task<int> DeleteTaskAttachmentsAsync(int taskId);

    /// <summary>
    /// Belirli bir ekli dosyayı ID'sine göre siler.
    /// </summary>
    /// <param name="attachmentId">Silinecek ekli dosyanın ID'si.</param>
    /// <param name="userId">İşlemi yapan kullanıcının ID'si.</param>
    /// <returns>İşlemin başarılı olup olmadığını gösteren boolean değer.</returns>
    Task<bool> DeleteAttachmentAsync(int attachmentId, int userId);
    
    /// <summary>
    /// Dosya boyutu formatlar (KB, MB, GB)
    /// </summary>
    /// <param name="bytes">Byte cinsinden boyut</param>
    /// <returns>Formatlanmış boyut string'i</returns>
    string FormatFileSize(long bytes);
    
    /// <summary>
    /// Dosya kategorisini (image, document, other) belirler
    /// </summary>
    /// <param name="contentType">Dosyanın MIME tipi</param>
    /// <param name="fileName">Dosya adı</param>
    /// <returns>Dosya kategorisi string olarak</returns>
    string GetFileCategory(string contentType, string fileName);

    /// <summary>
    /// Belirli bir göreve ait ekli dosyaların listesini getirir.
    /// </summary>
    /// <param name="taskId">Ekli dosyaları getirilecek görevin ID'si.</param>
    /// <param name="userId">İşlemi yapan kullanıcının ID'si.</param>
    /// <returns>AttachmentDto nesnelerinin bir listesini içeren ApiResponseModel.</returns>
    Task<ApiResponseModel<List<AttachmentDto>>> GetAttachmentsForTaskAsync(int taskId, int userId);
    
    /// <summary>
    /// Güvenli dosya adı oluşturur
    /// </summary>
    /// <param name="originalFileName">Orijinal dosya adı</param>
    /// <param name="prefix">Dosya adı prefix'i (opsiyonel)</param>
    /// <returns>Güvenli dosya adı</returns>
    string GenerateSafeFileName(string originalFileName, string? prefix = null);
} 