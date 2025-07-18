using System.Text;
using System.Text.Json;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;

namespace TaskFlow.API.Services
{
    /// <summary>
    /// Google ReCAPTCHA v3 Servisi
    /// Bot koruması ve spam önleme için kullanılır
    /// </summary>
    public class CaptchaService : ICaptchaService
    {
        private readonly ILogger<CaptchaService> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly string _secretKey;
        private readonly double _threshold;

        public CaptchaService(ILogger<CaptchaService> logger, IConfiguration configuration, HttpClient httpClient)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClient = httpClient;
            _secretKey = _configuration["Captcha:SecretKey"] ?? "";
            _threshold = double.TryParse(_configuration["Captcha:Threshold"], out var threshold) ? threshold : 0.5;
        }

        /// <summary>
        /// ReCAPTCHA token'ını doğrula
        /// </summary>
        public async Task<CaptchaVerificationResponseDto> VerifyCaptchaAsync(string token, string? action = null, string? remoteIp = null)
        {
            try
            {
                if (string.IsNullOrEmpty(_secretKey))
                {
                    _logger.LogWarning("Captcha secret key not configured, skipping verification");
                    return new CaptchaVerificationResponseDto { Success = true };
                }

                if (string.IsNullOrEmpty(token))
                {
                    return new CaptchaVerificationResponseDto 
                    { 
                        Success = false, 
                        ErrorCodes = new List<string> { "missing-input-response" } 
                    };
                }

                var verificationUrl = "https://www.google.com/recaptcha/api/siteverify";
                var content = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("secret", _secretKey),
                    new KeyValuePair<string, string>("response", token),
                    new KeyValuePair<string, string>("remoteip", remoteIp ?? "")
                });

                var response = await _httpClient.PostAsync(verificationUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Captcha verification request failed: {StatusCode}", response.StatusCode);
                    return new CaptchaVerificationResponseDto 
                    { 
                        Success = false, 
                        ErrorCodes = new List<string> { "request-failed" } 
                    };
                }

                var verificationResult = JsonSerializer.Deserialize<CaptchaVerificationResponseDto>(responseContent);
                
                if (verificationResult == null)
                {
                    return new CaptchaVerificationResponseDto 
                    { 
                        Success = false, 
                        ErrorCodes = new List<string> { "invalid-response" } 
                    };
                }

                // Action kontrolü (eğer belirtilmişse)
                if (!string.IsNullOrEmpty(action) && verificationResult.Action != action)
                {
                    verificationResult.Success = false;
                    verificationResult.ErrorCodes.Add("action-mismatch");
                }

                // Score kontrolü
                if (verificationResult.Success && verificationResult.Score < _threshold)
                {
                    verificationResult.Success = false;
                    verificationResult.ErrorCodes.Add("score-below-threshold");
                }

                _logger.LogInformation("Captcha verification result: Success={Success}, Score={Score}, Action={Action}", 
                    verificationResult.Success, verificationResult.Score, verificationResult.Action);

                return verificationResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying captcha");
                return new CaptchaVerificationResponseDto 
                { 
                    Success = false, 
                    ErrorCodes = new List<string> { "verification-error" } 
                };
            }
        }

        /// <summary>
        /// Captcha konfigürasyonunu getir
        /// </summary>
        public CaptchaConfigDto GetCaptchaConfig()
        {
            var siteKey = _configuration["Captcha:SiteKey"] ?? "";
            var isEnabled = !string.IsNullOrEmpty(siteKey) && !string.IsNullOrEmpty(_secretKey);
            
            return new CaptchaConfigDto
            {
                SiteKey = siteKey,
                SecretKey = _secretKey,
                Threshold = _threshold,
                Enabled = isEnabled
            };
        }

        /// <summary>
        /// Captcha'nın etkin olup olmadığını kontrol et
        /// </summary>
        public bool IsCaptchaEnabled()
        {
            var siteKey = _configuration["Captcha:SiteKey"] ?? "";
            return !string.IsNullOrEmpty(siteKey) && 
                   !string.IsNullOrEmpty(_secretKey);
        }
    }
} 