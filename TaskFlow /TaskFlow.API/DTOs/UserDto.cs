using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    public class UserDto
    {
        [SwaggerSchema("Kullanıcının benzersiz kimliği", Example = 123)]
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        [SwaggerSchema("Kullanıcının e-posta adresi", Example = "ali@example.com")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        [SwaggerSchema("Kullanıcının adı", Example = "Ali")]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        [SwaggerSchema("Kullanıcının soyadı", Example = "Durna")]
        public string LastName { get; set; } = string.Empty;

        [SwaggerSchema("Kullanıcının profil fotoğrafı URL'si", Example = "https://cdn.site.com/avatar.jpg")]
        public string? ProfileImage { get; set; }

        [SwaggerSchema("Kullanıcının telefon numarası", Example = "+905551112233")]
        public string? PhoneNumber { get; set; }

        [SwaggerSchema("Kullanıcının hesap oluşturma tarihi", Example = "2024-07-14T12:34:56Z")]
        public DateTime CreatedAt { get; set; }

        [SwaggerSchema("Kullanıcının son giriş tarihi", Example = "2024-07-14T15:00:00Z")]
        public DateTime? LastLoginAt { get; set; }

        [SwaggerSchema("Kullanıcı aktif mi?", Example = true)]
        public bool IsActive { get; set; }
    }
} 