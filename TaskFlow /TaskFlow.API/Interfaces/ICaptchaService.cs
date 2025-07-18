using TaskFlow.API.DTOs;

namespace TaskFlow.API.Interfaces
{
    /// <summary>
    /// Captcha servis interface'i
    /// Google ReCAPTCHA v3 entegrasyonu için gerekli metodları tanımlar
    /// </summary>
    public interface ICaptchaService
    {
        /// <summary>
        /// ReCAPTCHA token'ını doğrula
        /// </summary>
        /// <param name="token">Frontend'den gelen captcha token'ı</param>
        /// <param name="action">Doğrulanacak action (opsiyonel)</param>
        /// <param name="remoteIp">Kullanıcının IP adresi (opsiyonel)</param>
        /// <returns>Doğrulama sonucu</returns>
        Task<CaptchaVerificationResponseDto> VerifyCaptchaAsync(string token, string? action = null, string? remoteIp = null);

        /// <summary>
        /// Captcha konfigürasyonunu getir
        /// </summary>
        /// <returns>Captcha konfigürasyon bilgileri</returns>
        CaptchaConfigDto GetCaptchaConfig();

        /// <summary>
        /// Captcha'nın etkin olup olmadığını kontrol et
        /// </summary>
        /// <returns>Captcha etkinse true, değilse false</returns>
        bool IsCaptchaEnabled();
    }
} 