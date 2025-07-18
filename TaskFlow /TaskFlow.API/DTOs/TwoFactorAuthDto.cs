using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.DTOs
{
    /// <summary>
    /// 2FA etkinleştirme isteği
    /// </summary>
    public class Enable2FARequestDto
    {
        [Required]
        public string Password { get; set; } = "";
    }

    /// <summary>
    /// 2FA etkinleştirme yanıtı
    /// </summary>
    public class Enable2FAResponseDto
    {
        public string SecretKey { get; set; } = "";
        public string QrCodeUrl { get; set; } = "";
        public string ManualEntryKey { get; set; } = "";
        public bool IsEnabled { get; set; }
    }

    /// <summary>
    /// 2FA doğrulama isteği
    /// </summary>
    public class Verify2FARequestDto
    {
        [Required]
        [StringLength(6, MinimumLength = 6)]
        public string Code { get; set; } = "";
        
        public bool RememberDevice { get; set; } = false;
    }

    /// <summary>
    /// 2FA devre dışı bırakma isteği
    /// </summary>
    public class Disable2FARequestDto
    {
        [Required]
        public string Password { get; set; } = "";
        
        [Required]
        [StringLength(6, MinimumLength = 6)]
        public string Code { get; set; } = "";
    }

    /// <summary>
    /// 2FA durumu
    /// </summary>
    public class TwoFactorStatusDto
    {
        public bool IsEnabled { get; set; }
        public bool IsConfigured { get; set; }
        public DateTime? LastUsed { get; set; }
        public int RecoveryCodesRemaining { get; set; }
    }

    /// <summary>
    /// Kurtarma kodları yanıtı
    /// </summary>
    public class RecoveryCodesResponseDto
    {
        public List<string> Codes { get; set; } = new();
        public bool IsGenerated { get; set; }
    }
} 