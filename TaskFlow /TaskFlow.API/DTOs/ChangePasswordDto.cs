using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    public class ChangePasswordDto
    {
        [Required]
        [SwaggerSchema("Mevcut şifre")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 6)]
        [SwaggerSchema("Yeni şifre")]
        public string NewPassword { get; set; } = string.Empty;

        [Compare("NewPassword", ErrorMessage = "Şifreler eşleşmiyor")]
        [SwaggerSchema("Yeni şifre tekrar")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
} 