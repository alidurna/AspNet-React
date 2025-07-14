using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    public class EmailVerificationRequestDto
    {
        [Required]
        [EmailAddress]
        [SwaggerSchema("Doğrulama kodu gönderilecek e-posta adresi", Example = "ali@example.com")]
        public string Email { get; set; } = string.Empty;
    }

    public class EmailVerificationDto
    {
        [Required]
        [EmailAddress]
        [SwaggerSchema("Doğrulama yapılacak e-posta adresi", Example = "ali@example.com")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [SwaggerSchema("E-posta doğrulama kodu", Example = "123456")]
        public string Token { get; set; } = string.Empty;
    }
} 