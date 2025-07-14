using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    public class PasswordResetRequestDto
    {
        [Required]
        [EmailAddress]
        [SwaggerSchema("Şifre sıfırlama için e-posta adresi")]
        public string Email { get; set; } = string.Empty;
    }

    public class PasswordResetDto
    {
        [Required]
        [EmailAddress]
        [SwaggerSchema("Şifre sıfırlama için e-posta adresi")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [SwaggerSchema("Şifre sıfırlama token'ı")]
        public string Token { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 6)]
        [SwaggerSchema("Yeni şifre")]
        public string NewPassword { get; set; } = string.Empty;

        [Compare("NewPassword", ErrorMessage = "Şifreler eşleşmiyor")]
        [SwaggerSchema("Yeni şifre tekrar")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
} 