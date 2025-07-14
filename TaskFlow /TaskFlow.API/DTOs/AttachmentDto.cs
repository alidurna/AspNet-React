using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    public class AttachmentDto
    {
        
        public int Id { get; set; }

        [Required]
        [SwaggerSchema("Ek dosyanın adı")]
        public string FileName { get; set; } = string.Empty;

        [SwaggerSchema("Ek dosyanın URL'si")]
        public string FileUrl { get; set; } = string.Empty;

        [SwaggerSchema("Ek dosyanın yüklenme tarihi")]
        public DateTime UploadedAt { get; set; }

        [SwaggerSchema("Ek dosyanın dosya yolu")]
        public string? FilePath { get; set; }

        [SwaggerSchema("Ek dosyanın boyutu (byte)")]
        public long? FileSize { get; set; }

        [SwaggerSchema("Ek dosyanın içerik tipi")]
        public string? ContentType { get; set; }

        [SwaggerSchema("Ek dosyayı yükleyen kullanıcı ID'si")]
        public int? UserId { get; set; }
        
        public int TaskId { get; set; }
    }
} 