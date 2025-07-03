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
    /// Task'ın tüm attachment'larını siler
    /// </summary>
    /// <param name="taskId">Task ID</param>
    /// <returns>Silinen dosya sayısı</returns>
    Task<int> DeleteTaskAttachmentsAsync(int taskId);
    
    /// <summary>
    /// Dosya boyutu formatlar (KB, MB, GB)
    /// </summary>
    /// <param name="bytes">Byte cinsinden boyut</param>
    /// <returns>Formatlanmış boyut string'i</returns>
    string FormatFileSize(long bytes);
    
    /// <summary>
    /// Dosya tipi kategori belirler (image, document, archive vb.)
    /// </summary>
    /// <param name="contentType">MIME type</param>
    /// <param name="fileName">Dosya adı</param>
    /// <returns>Dosya kategorisi</returns>
    string GetFileCategory(string contentType, string fileName);
    
    /// <summary>
    /// Güvenli dosya adı oluşturur
    /// </summary>
    /// <param name="originalFileName">Orijinal dosya adı</param>
    /// <param name="prefix">Dosya adı prefix'i (opsiyonel)</param>
    /// <returns>Güvenli dosya adı</returns>
    string GenerateSafeFileName(string originalFileName, string? prefix = null);
} 