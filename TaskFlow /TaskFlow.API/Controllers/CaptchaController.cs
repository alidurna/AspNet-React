using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;
using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;

namespace TaskFlow.API.Controllers
{
    /// <summary>
    /// Captcha Controller - ReCAPTCHA doğrulama işlemleri
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [AllowAnonymous] // Tüm captcha endpoint'leri anonim erişime açık
    public class CaptchaController : ControllerBase
    {
        private readonly ICaptchaService _captchaService;
        private readonly ILogger<CaptchaController> _logger;

        public CaptchaController(
            ICaptchaService captchaService,
            ILogger<CaptchaController> logger)
        {
            _captchaService = captchaService;
            _logger = logger;
        }

        /// <summary>
        /// Captcha konfigürasyonunu getir
        /// </summary>
        [HttpGet("config")]
        public ActionResult<ApiResponseModel<CaptchaConfigDto>> GetConfig()
        {
            try
            {
                var config = _captchaService.GetCaptchaConfig();
                return Ok(ApiResponseModel<CaptchaConfigDto>.SuccessResponse("Captcha konfigürasyonu getirildi", config));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting captcha config");
                return StatusCode(500, ApiResponseModel<CaptchaConfigDto>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// Captcha token'ını doğrula
        /// </summary>
        /// <param name="request">Doğrulama isteği</param>
        /// <returns>Doğrulama sonucu</returns>
        [HttpPost("verify")]
        public async Task<ActionResult<ApiResponseModel<CaptchaVerificationResponseDto>>> Verify([FromBody] CaptchaVerificationDto request)
        {
            try
            {
                var remoteIp = HttpContext.Connection.RemoteIpAddress?.ToString();
                var result = await _captchaService.VerifyCaptchaAsync(request.Token, request.Action, remoteIp);
                
                if (result.Success)
                {
                    return Ok(ApiResponseModel<CaptchaVerificationResponseDto>.SuccessResponse("Captcha doğrulaması başarılı", result));
                }
                else
                {
                    return BadRequest(ApiResponseModel<CaptchaVerificationResponseDto>.ErrorResponse("Captcha doğrulaması başarısız", result.ErrorCodes));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying captcha");
                return StatusCode(500, ApiResponseModel<CaptchaVerificationResponseDto>.ServerErrorResponse());
            }
        }
    }
} 