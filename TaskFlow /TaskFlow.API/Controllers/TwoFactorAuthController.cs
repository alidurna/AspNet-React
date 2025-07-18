using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.DTOs;
using TaskFlow.API.Services;
using TaskFlow.API.Interfaces;
using TaskFlow.API.Models;
using System.Security.Claims;

namespace TaskFlow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TwoFactorAuthController : ControllerBase
    {
        private readonly ITwoFactorAuthService _twoFactorService;
        private readonly IUserService _userService;
        private readonly IPasswordService _passwordService;
        private readonly ILogger<TwoFactorAuthController> _logger;

        public TwoFactorAuthController(
            ITwoFactorAuthService twoFactorService,
            IUserService userService,
            IPasswordService passwordService,
            ILogger<TwoFactorAuthController> logger)
        {
            _twoFactorService = twoFactorService;
            _userService = userService;
            _passwordService = passwordService;
            _logger = logger;
        }

        /// <summary>
        /// 2FA durumunu getir
        /// </summary>
        [HttpGet("status")]
        public async Task<ActionResult<ApiResponseModel<TwoFactorStatusDto>>> GetStatus()
        {
            try
            {
                var userId = GetCurrentUserId();
                var userDto = await _userService.GetUserByIdAsync(userId);
                
                if (userDto == null)
                    return NotFound(ApiResponseModel<TwoFactorStatusDto>.NotFoundResponse("Kullanıcı bulunamadı"));

                // User model'ini al
                var user = await _userService.GetUserByEmailAsync(userDto.Email);
                if (user == null)
                    return NotFound(ApiResponseModel<TwoFactorStatusDto>.NotFoundResponse("Kullanıcı bulunamadı"));

                var status = _twoFactorService.GetTwoFactorStatus(user);
                
                return Ok(ApiResponseModel<TwoFactorStatusDto>.SuccessResponse("2FA durumu getirildi", status));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting 2FA status for user");
                return StatusCode(500, ApiResponseModel<TwoFactorStatusDto>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// 2FA etkinleştir
        /// </summary>
        [HttpPost("enable")]
        public async Task<ActionResult<ApiResponseModel<Enable2FAResponseDto>>> Enable([FromBody] Enable2FARequestDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userDto = await _userService.GetUserByIdAsync(userId);
                
                if (userDto == null)
                    return NotFound(ApiResponseModel<Enable2FAResponseDto>.NotFoundResponse("Kullanıcı bulunamadı"));

                // User model'ini al
                var user = await _userService.GetUserByEmailAsync(userDto.Email);
                if (user == null)
                    return NotFound(ApiResponseModel<Enable2FAResponseDto>.NotFoundResponse("Kullanıcı bulunamadı"));

                // Şifre doğrulama
                if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash))
                    return BadRequest(ApiResponseModel<Enable2FAResponseDto>.ErrorResponse("Şifre yanlış"));

                // Yeni secret key oluştur
                var secretKey = _twoFactorService.GenerateSecretKey();
                var qrCodeUrl = _twoFactorService.GenerateQrCodeUrl(secretKey, user.Email);
                var recoveryCodes = _twoFactorService.GenerateRecoveryCodes();

                // Kullanıcıyı güncelle (henüz etkinleştirme)
                user.TwoFactorSecret = secretKey;
                user.TwoFactorRecoveryCodes = System.Text.Json.JsonSerializer.Serialize(recoveryCodes);
                await _userService.UpdateUserAsync(user);

                var response = new Enable2FAResponseDto
                {
                    SecretKey = secretKey,
                    QrCodeUrl = qrCodeUrl,
                    ManualEntryKey = secretKey,
                    IsEnabled = false
                };

                _logger.LogInformation("2FA setup initiated for user {UserId}", userId);
                
                return Ok(ApiResponseModel<Enable2FAResponseDto>.SuccessResponse("2FA kurulumu başlatıldı", response));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enabling 2FA for user");
                return StatusCode(500, ApiResponseModel<Enable2FAResponseDto>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// 2FA doğrula ve etkinleştir
        /// </summary>
        [HttpPost("verify")]
        public async Task<ActionResult<ApiResponseModel<object>>> Verify([FromBody] Verify2FARequestDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userDto = await _userService.GetUserByIdAsync(userId);
                
                if (userDto == null)
                    return NotFound(ApiResponseModel<object>.NotFoundResponse("Kullanıcı bulunamadı"));

                // User model'ini al
                var user = await _userService.GetUserByEmailAsync(userDto.Email);
                if (user == null)
                    return NotFound(ApiResponseModel<object>.NotFoundResponse("Kullanıcı bulunamadı"));

                if (string.IsNullOrEmpty(user.TwoFactorSecret))
                    return BadRequest(ApiResponseModel<object>.ErrorResponse("2FA henüz kurulmamış"));

                // TOTP kodu doğrula
                if (!_twoFactorService.VerifyTotpCode(user.TwoFactorSecret, request.Code))
                    return BadRequest(ApiResponseModel<object>.ErrorResponse("Geçersiz doğrulama kodu"));

                // 2FA'yı etkinleştir
                user.TwoFactorEnabled = true;
                user.TwoFactorEnabledAt = DateTime.UtcNow;
                user.TwoFactorLastUsed = DateTime.UtcNow;
                await _userService.UpdateUserAsync(user);

                _logger.LogInformation("2FA enabled for user {UserId}", userId);
                
                return Ok(ApiResponseModel<object>.SuccessResponse("2FA başarıyla etkinleştirildi"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying 2FA for user");
                return StatusCode(500, ApiResponseModel<object>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// 2FA devre dışı bırak
        /// </summary>
        [HttpPost("disable")]
        public async Task<ActionResult<ApiResponseModel<object>>> Disable([FromBody] Disable2FARequestDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userDto = await _userService.GetUserByIdAsync(userId);
                
                if (userDto == null)
                    return NotFound(ApiResponseModel<object>.NotFoundResponse("Kullanıcı bulunamadı"));

                // User model'ini al
                var user = await _userService.GetUserByEmailAsync(userDto.Email);
                if (user == null)
                    return NotFound(ApiResponseModel<object>.NotFoundResponse("Kullanıcı bulunamadı"));

                // Şifre doğrulama
                if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash))
                    return BadRequest(ApiResponseModel<object>.ErrorResponse("Şifre yanlış"));

                // TOTP kodu doğrula
                if (!_twoFactorService.VerifyTotpCode(user.TwoFactorSecret!, request.Code))
                    return BadRequest(ApiResponseModel<object>.ErrorResponse("Geçersiz doğrulama kodu"));

                // 2FA'yı devre dışı bırak
                user.TwoFactorEnabled = false;
                user.TwoFactorSecret = null;
                user.TwoFactorEnabledAt = null;
                user.TwoFactorLastUsed = null;
                user.TwoFactorRecoveryCodes = null;
                await _userService.UpdateUserAsync(user);

                _logger.LogInformation("2FA disabled for user {UserId}", userId);
                
                return Ok(ApiResponseModel<object>.SuccessResponse("2FA başarıyla devre dışı bırakıldı"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error disabling 2FA for user");
                return StatusCode(500, ApiResponseModel<object>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// Kurtarma kodları oluştur
        /// </summary>
        [HttpPost("recovery-codes")]
        public async Task<ActionResult<ApiResponseModel<RecoveryCodesResponseDto>>> GenerateRecoveryCodes()
        {
            try
            {
                var userId = GetCurrentUserId();
                var userDto = await _userService.GetUserByIdAsync(userId);
                
                if (userDto == null)
                    return NotFound(ApiResponseModel<RecoveryCodesResponseDto>.NotFoundResponse("Kullanıcı bulunamadı"));

                // User model'ini al
                var user = await _userService.GetUserByEmailAsync(userDto.Email);
                if (user == null)
                    return NotFound(ApiResponseModel<RecoveryCodesResponseDto>.NotFoundResponse("Kullanıcı bulunamadı"));

                if (!user.TwoFactorEnabled)
                    return BadRequest(ApiResponseModel<RecoveryCodesResponseDto>.ErrorResponse("2FA etkin değil"));

                var recoveryCodes = _twoFactorService.GenerateRecoveryCodes();
                user.TwoFactorRecoveryCodes = System.Text.Json.JsonSerializer.Serialize(recoveryCodes);
                await _userService.UpdateUserAsync(user);

                var response = new RecoveryCodesResponseDto
                {
                    Codes = recoveryCodes,
                    IsGenerated = true
                };

                _logger.LogInformation("Recovery codes generated for user {UserId}", userId);
                
                return Ok(ApiResponseModel<RecoveryCodesResponseDto>.SuccessResponse("Kurtarma kodları oluşturuldu", response));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating recovery codes for user");
                return StatusCode(500, ApiResponseModel<RecoveryCodesResponseDto>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// Kurtarma kodu ile giriş
        /// </summary>
        [HttpPost("recovery")]
        public async Task<ActionResult<ApiResponseModel<object>>> UseRecoveryCode([FromBody] Verify2FARequestDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userDto = await _userService.GetUserByIdAsync(userId);
                
                if (userDto == null)
                    return NotFound(ApiResponseModel<object>.NotFoundResponse("Kullanıcı bulunamadı"));

                // User model'ini al
                var user = await _userService.GetUserByEmailAsync(userDto.Email);
                if (user == null)
                    return NotFound(ApiResponseModel<object>.NotFoundResponse("Kullanıcı bulunamadı"));

                if (!user.TwoFactorEnabled)
                    return BadRequest(ApiResponseModel<object>.ErrorResponse("2FA etkin değil"));

                // Kurtarma kodu doğrula
                if (!_twoFactorService.VerifyRecoveryCode(user, request.Code))
                    return BadRequest(ApiResponseModel<object>.ErrorResponse("Geçersiz kurtarma kodu"));

                // Son kullanım tarihini güncelle
                user.TwoFactorLastUsed = DateTime.UtcNow;
                await _userService.UpdateUserAsync(user);

                _logger.LogInformation("Recovery code used for user {UserId}", userId);
                
                return Ok(ApiResponseModel<object>.SuccessResponse("Kurtarma kodu başarıyla kullanıldı"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error using recovery code for user");
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