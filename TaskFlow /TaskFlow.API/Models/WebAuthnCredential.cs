using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models
{
    /// <summary>
    /// WebAuthn Kimlik Bilgisi Modeli
    /// Biyometrik giriş ve güvenlik anahtarları için kullanılır
    /// </summary>
    public class WebAuthnCredential
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public string CredentialId { get; set; } = "";
        
        [Required]
        public string PublicKey { get; set; } = "";
        
        [Required]
        public string SignCount { get; set; } = "0";
        
        public string? Name { get; set; }
        
        public string? Type { get; set; }
        
        public string? Transports { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime? LastUsedAt { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        // Navigation Property
        public virtual User User { get; set; } = null!;
    }
} 