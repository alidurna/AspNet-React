using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace TaskFlow.API.DTOs
{
    /// <summary>
    /// WebAuthn kayıt başlatma isteği
    /// </summary>
    public class WebAuthnRegistrationRequestDto
    {
        [Required]
        public string Username { get; set; } = "";
        
        public string? DisplayName { get; set; }
    }

    /// <summary>
    /// WebAuthn kayıt başlatma yanıtı
    /// </summary>
    public class WebAuthnRegistrationResponseDto
    {
        public string Challenge { get; set; } = "";
        public JsonElement PublicKeyCredentialCreationOptions { get; set; }
        public string SessionId { get; set; } = "";
    }

    /// <summary>
    /// WebAuthn kayıt tamamlama isteği
    /// </summary>
    public class WebAuthnRegistrationCompleteDto
    {
        [Required]
        public string SessionId { get; set; } = "";
        
        [Required]
        public JsonElement AttestationResponse { get; set; }
    }

    /// <summary>
    /// WebAuthn giriş başlatma isteği
    /// </summary>
    public class WebAuthnAuthenticationRequestDto
    {
        [Required]
        public string Username { get; set; } = "";
    }

    /// <summary>
    /// WebAuthn giriş başlatma yanıtı
    /// </summary>
    public class WebAuthnAuthenticationResponseDto
    {
        public string Challenge { get; set; } = "";
        public JsonElement PublicKeyCredentialRequestOptions { get; set; }
        public string SessionId { get; set; } = "";
    }

    /// <summary>
    /// WebAuthn giriş tamamlama isteği
    /// </summary>
    public class WebAuthnAuthenticationCompleteDto
    {
        [Required]
        public string SessionId { get; set; } = "";
        
        [Required]
        public JsonElement AssertionResponse { get; set; }
    }

    /// <summary>
    /// WebAuthn kimlik bilgisi
    /// </summary>
    public class WebAuthnCredentialDto
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public DateTime? LastUsedAt { get; set; }
        public string Type { get; set; } = "";
        public string Transports { get; set; } = "";
    }

    /// <summary>
    /// WebAuthn durumu
    /// </summary>
    public class WebAuthnStatusDto
    {
        public bool IsSupported { get; set; }
        public bool IsEnabled { get; set; }
        public List<WebAuthnCredentialDto> Credentials { get; set; } = new();
    }
} 