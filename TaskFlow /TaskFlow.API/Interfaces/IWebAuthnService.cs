using TaskFlow.API.DTOs;

namespace TaskFlow.API.Interfaces
{
    /// <summary>
    /// WebAuthn servis interface'i
    /// Biyometrik giriş ve güvenlik anahtarları için kullanılır
    /// </summary>
    public interface IWebAuthnService
    {
        /// <summary>
        /// WebAuthn kayıt başlatma
        /// </summary>
        Task<WebAuthnRegistrationResponseDto> StartRegistrationAsync(WebAuthnRegistrationRequestDto request);

        /// <summary>
        /// WebAuthn kayıt tamamlama
        /// </summary>
        Task<bool> CompleteRegistrationAsync(WebAuthnRegistrationCompleteDto request);

        /// <summary>
        /// WebAuthn giriş başlatma
        /// </summary>
        Task<WebAuthnAuthenticationResponseDto> StartAuthenticationAsync(WebAuthnAuthenticationRequestDto request);

        /// <summary>
        /// WebAuthn giriş tamamlama
        /// </summary>
        Task<bool> CompleteAuthenticationAsync(WebAuthnAuthenticationCompleteDto request);

        /// <summary>
        /// WebAuthn durumunu getir
        /// </summary>
        Task<WebAuthnStatusDto> GetStatusAsync(int userId);

        /// <summary>
        /// WebAuthn credential'ını sil
        /// </summary>
        Task<bool> DeleteCredentialAsync(int userId, string credentialId);
    }
} 