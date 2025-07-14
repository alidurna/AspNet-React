using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    public class UserDto
    {
        
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        [SwaggerSchema("Kullanıcının e-posta adresi")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        [SwaggerSchema("Kullanıcının adı")]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        [SwaggerSchema("Kullanıcının soyadı")]
        public string LastName { get; set; } = string.Empty;

        [SwaggerSchema("Kullanıcının profil fotoğrafı URL'si")]
        public string? ProfileImage { get; set; }

        [SwaggerSchema("Kullanıcının telefon numarası")]
        public string? PhoneNumber { get; set; }

        [SwaggerSchema("Kullanıcının hesap oluşturma tarihi")]
        public DateTime CreatedAt { get; set; }

        [SwaggerSchema("Kullanıcının son giriş tarihi")]
        public DateTime? LastLoginAt { get; set; }

        
        public bool IsActive { get; set; }
    }
} 