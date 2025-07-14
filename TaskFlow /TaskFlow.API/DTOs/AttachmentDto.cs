using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    public class AttachmentDto
    {
        [SwaggerSchema("Ek dosyanın benzersiz kimliği", Example = 1001)]
        public int Id { get; set; }

        [Required]
        [SwaggerSchema("Ek dosyanın adı", Example = "dokuman.pdf")]
        public string FileName { get; set; } = string.Empty;

        [SwaggerSchema("Ek dosyanın URL'si", Example = "https://cdn.site.com/files/dokuman.pdf")]
        public string FileUrl { get; set; } = string.Empty;

        [SwaggerSchema("Ek dosyanın yüklenme tarihi", Example = "2024-07-14T13:00:00Z")]
        public DateTime UploadedAt { get; set; }

        [SwaggerSchema("Ek dosyanın ait olduğu görev ID'si", Example = 101)]
        public int TaskId { get; set; }
    }
} 