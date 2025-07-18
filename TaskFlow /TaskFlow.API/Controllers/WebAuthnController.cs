using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.DTOs;
using TaskFlow.API.Services;
using TaskFlow.API.Interfaces;
using System.Security.Claims;

namespace TaskFlow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WebAuthnController : ControllerBase
    {
        private readonly IWebAuthnService _webAuthnService;
        private readonly ILogger<WebAuthnController> _logger;

        public WebAuthnController(
            IWebAuthnService webAuthnService,
            ILogger<WebAuthnController> logger)
        {
            _webAuthnService = webAuthnService;
            _logger = logger;
        }

        /// <summary>
        /// WebAuthn durumunu getir
        /// </summary>
        [HttpGet("status")]
        [Authorize]
        public async Task<ActionResult<ApiResponseModel<WebAuthnStatusDto>>> GetStatus()
        {
            try
            {
                var userId = GetCurrentUserId();
                var status = await _webAuthnService.GetStatusAsync(userId);
                
                return Ok(ApiResponseModel<WebAuthnStatusDto>.SuccessResponse("WebAuthn durumu getirildi", status));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting WebAuthn status for user");
                return StatusCode(500, ApiResponseModel<WebAuthnStatusDto>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// WebAuthn kayıt başlat
        /// </summary>
        [HttpPost("register/start")]
        [Authorize]
        public async Task<ActionResult<ApiResponseModel<WebAuthnRegistrationResponseDto>>> StartRegistration([FromBody] WebAuthnRegistrationRequestDto request)
        {
            try
            {
                var response = await _webAuthnService.StartRegistrationAsync(request);
                
                return Ok(ApiResponseModel<WebAuthnRegistrationResponseDto>.SuccessResponse("WebAuthn kayıt başlatıldı", response));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting WebAuthn registration");
                return StatusCode(500, ApiResponseModel<WebAuthnRegistrationResponseDto>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// WebAuthn kayıt tamamla
        /// </summary>
        [HttpPost("register/complete")]
        [Authorize]
        public async Task<ActionResult<ApiResponseModel<object>>> CompleteRegistration([FromBody] WebAuthnRegistrationCompleteDto request)
        {
            try
            {
                var success = await _webAuthnService.CompleteRegistrationAsync(request);
                
                if (success)
                {
                    return Ok(ApiResponseModel<object>.SuccessResponse("WebAuthn kayıt tamamlandı"));
                }
                else
                {
                    return BadRequest(ApiResponseModel<object>.ErrorResponse("WebAuthn kayıt tamamlanamadı"));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing WebAuthn registration");
                return StatusCode(500, ApiResponseModel<object>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// WebAuthn giriş başlat
        /// </summary>
        [HttpPost("authenticate/start")]
        public async Task<ActionResult<ApiResponseModel<WebAuthnAuthenticationResponseDto>>> StartAuthentication([FromBody] WebAuthnAuthenticationRequestDto request)
        {
            try
            {
                var response = await _webAuthnService.StartAuthenticationAsync(request);
                
                return Ok(ApiResponseModel<WebAuthnAuthenticationResponseDto>.SuccessResponse("WebAuthn giriş başlatıldı", response));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting WebAuthn authentication");
                return StatusCode(500, ApiResponseModel<WebAuthnAuthenticationResponseDto>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// WebAuthn giriş tamamla
        /// </summary>
        [HttpPost("authenticate/complete")]
        public async Task<ActionResult<ApiResponseModel<object>>> CompleteAuthentication([FromBody] WebAuthnAuthenticationCompleteDto request)
        {
            try
            {
                var success = await _webAuthnService.CompleteAuthenticationAsync(request);
                
                if (success)
                {
                    return Ok(ApiResponseModel<object>.SuccessResponse("WebAuthn giriş başarılı"));
                }
                else
                {
                    return BadRequest(ApiResponseModel<object>.ErrorResponse("WebAuthn giriş başarısız"));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing WebAuthn authentication");
                return StatusCode(500, ApiResponseModel<object>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// WebAuthn credential sil
        /// </summary>
        [HttpDelete("credentials/{credentialId}")]
        [Authorize]
        public async Task<ActionResult<ApiResponseModel<object>>> DeleteCredential(string credentialId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _webAuthnService.DeleteCredentialAsync(userId, credentialId);
                
                if (success)
                {
                    return Ok(ApiResponseModel<object>.SuccessResponse("WebAuthn credential silindi"));
                }
                else
                {
                    return NotFound(ApiResponseModel<object>.NotFoundResponse("WebAuthn credential bulunamadı"));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting WebAuthn credential");
                return StatusCode(500, ApiResponseModel<object>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// Mevcut kullanıcı ID'sini al
        /// </summary>
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
                return userId;
            
            throw new UnauthorizedAccessException("Geçersiz kullanıcı kimliği");
        }
    }
} 