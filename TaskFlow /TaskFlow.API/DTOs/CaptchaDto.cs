using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.DTOs
{
    /// <summary>
    /// Captcha doğrulama isteği
    /// </summary>
    public class CaptchaVerificationDto
    {
        [Required]
        public string Token { get; set; } = "";
        
        public string? Action { get; set; }
        
        public string? RemoteIp { get; set; }
    }

    /// <summary>
    /// Captcha doğrulama yanıtı
    /// </summary>
    public class CaptchaVerificationResponseDto
    {
        public bool Success { get; set; }
        public double Score { get; set; }
        public string Action { get; set; } = "";
        public DateTime ChallengeTs { get; set; }
        public string Hostname { get; set; } = "";
        public List<string> ErrorCodes { get; set; } = new();
    }

    /// <summary>
    /// Captcha konfigürasyonu
    /// </summary>
    public class CaptchaConfigDto
    {
        public string SiteKey { get; set; } = "";
        public string SecretKey { get; set; } = "";
        public double Threshold { get; set; } = 0.5;
        public bool Enabled { get; set; } = true;
    }
} 