using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;
using Asp.Versioning;

namespace TaskFlow.API.Controllers
{
    /// <summary>
    /// Kullanıcı yönetimi ve authentication işlemleri için API Controller
    /// Register, Login, Profile management gibi temel user operations sağlar
    /// </summary>
    /// <remarks>
    /// Bu controller, TaskFlow uygulamasının kullanıcı yönetim sisteminin ana parçasıdır.
    /// JWT tabanlı authentication, kullanıcı kaydı, girişi ve profil yönetimi yapar.
    /// 
    /// Authentication Flow:
    /// 1. Register: Yeni kullanıcı kaydı + otomatik login
    /// 2. Login: Mevcut kullanıcı girişi + JWT token
    /// 3. Profile: Token ile korumalı kullanıcı bilgileri
    /// 4. Update: Token ile korumalı profil güncelleme
    /// </remarks>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
    public class UsersController : ControllerBase
    {
        #region Private Fields

        /// <summary>
        /// User business logic servisi
        /// Authentication ve kullanıcı yönetimi işlemleri için
        /// </summary>
        private readonly IUserService _userService;

        /// <summary>
        /// ASP.NET Core logging servisi
        /// Hata ve bilgi logları için kullanılır
        /// </summary>
        private readonly ILogger<UsersController> _logger;

        #endregion

        #region Constructor

        /// <summary>
        /// UsersController constructor
        /// Dependency Injection ile gerekli servisleri alır
        /// </summary>
        /// <param name="userService">User business logic servisi</param>
        /// <param name="logger">Logging servisi</param>
        /// <exception cref="ArgumentNullException">Herhangi bir parametre null ise fırlatılır</exception>
        public UsersController(
            IUserService userService,
            ILogger<UsersController> logger)
        {
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        #endregion

        #region Authentication Endpoints

        /// <summary>
        /// Yeni kullanıcı kaydı endpoint'i
        /// Email benzersizlik kontrolü yaparak kullanıcı oluşturur ve otomatik login yapar
        /// </summary>
        /// <param name="registerDto">Kayıt için gerekli kullanıcı bilgileri</param>
        /// <returns>Authentication response with JWT token</returns>
        /// <response code="201">Kullanıcı başarıyla oluşturuldu</response>
        /// <response code="400">Geçersiz veri veya email zaten kayıtlı</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpPost("register")]
        [ProducesResponseType(typeof(ApiResponseModel<AuthResponseDto>), 201)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<AuthResponseDto>>> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                // Model validation artık GlobalValidationActionFilter tarafından handle ediliyor
                // Manuel ModelState kontrolü yapmaya gerek yok

                // UserService ile kullanıcı kaydı yap
                var authResponse = await _userService.RegisterAsync(registerDto);

                _logger.LogInformation("New user registered successfully: {Email}", registerDto.Email);

                // Başarılı response döndür - HTTP 201 Created
                return CreatedAtAction(
                    actionName: nameof(GetProfile),
                    routeValues: new { id = authResponse.User.Id },
                    value: ApiResponseModel<AuthResponseDto>.SuccessResponse(
                        "Kullanıcı başarıyla oluşturuldu ve giriş yapıldı",
                        authResponse
                    )
                );
            }
            catch (InvalidOperationException ex)
            {
                // Business rule violations (email already exists, etc.)
                _logger.LogWarning("Registration failed: {Error}", ex.Message);
                return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                // Unexpected errors
                _logger.LogError(ex, "Error during user registration for email: {Email}", registerDto.Email);
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Kullanıcı kaydı sırasında bir hata oluştu"));
            }
        }

        /// <summary>
        /// Kullanıcı girişi endpoint'i
        /// Email/password doğrulaması yaparak JWT token döndürür
        /// </summary>
        /// <param name="loginDto">Giriş için email ve şifre</param>
        /// <returns>Authentication response with JWT token</returns>
        /// <response code="200">Giriş başarılı</response>
        /// <response code="400">Geçersiz veri</response>
        /// <response code="401">Yanlış email veya şifre</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpPost("login")]
        [ProducesResponseType(typeof(ApiResponseModel<AuthResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<AuthResponseDto>>> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                // Model validation artık GlobalValidationActionFilter tarafından handle ediliyor

                // UserService ile login yap
                var authResponse = await _userService.LoginAsync(loginDto);

                _logger.LogInformation("User logged in successfully: {Email}", loginDto.Email);

                return Ok(ApiResponseModel<AuthResponseDto>.SuccessResponse(
                    "Giriş başarılı",
                    authResponse
                ));
            }
            catch (UnauthorizedAccessException ex)
            {
                // Invalid credentials
                _logger.LogWarning("Login failed for email {Email}: {Error}", loginDto.Email, ex.Message);
                return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz email veya şifre"));
            }
            catch (Exception ex)
            {
                // Unexpected errors
                _logger.LogError(ex, "Error during login for email: {Email}", loginDto.Email);
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Giriş sırasında bir hata oluştu"));
            }
        }

        #endregion

        #region Profile Management Endpoints

        /// <summary>
        /// Mevcut kullanıcının profil bilgilerini getirir (JWT token'dan user ID alır)
        /// </summary>
        /// <returns>Kullanıcı profil bilgileri</returns>
        /// <response code="200">Profil bilgileri başarıyla getirildi</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="404">Kullanıcı bulunamadı</response>
        [HttpGet("profile")]
        [Authorize] // JWT token gerekli
        [ProducesResponseType(typeof(ApiResponseModel<UserDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        public async Task<ActionResult<ApiResponseModel<UserDto>>> GetProfile()
        {
            try
            {
                // JWT token'dan user ID'yi al
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // UserService ile kullanıcı bilgilerini getir
                var userDto = await _userService.GetUserByIdAsync(userId.Value);

                if (userDto == null)
                {
                    return NotFound(ApiResponseModel<object>.ErrorResponse("Kullanıcı bulunamadı"));
                }

                return Ok(ApiResponseModel<UserDto>.SuccessResponse(
                    "Profil bilgileri getirildi",
                    userDto
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting profile for user");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Profil bilgileri getirilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Belirli bir kullanıcının profil bilgilerini getirir (public endpoint)
        /// </summary>
        /// <param name="id">Kullanıcı ID'si</param>
        /// <returns>Kullanıcı profil bilgileri</returns>
        /// <response code="200">Profil bilgileri başarıyla getirildi</response>
        /// <response code="404">Kullanıcı bulunamadı</response>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<UserDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        public async Task<ActionResult<ApiResponseModel<UserDto>>> GetProfile(int id)
        {
            try
            {
                var userDto = await _userService.GetUserByIdAsync(id);

                if (userDto == null)
                {
                    return NotFound(ApiResponseModel<object>.ErrorResponse("Kullanıcı bulunamadı"));
                }

                return Ok(ApiResponseModel<UserDto>.SuccessResponse(
                    "Kullanıcı bilgileri getirildi",
                    userDto
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user profile for ID: {UserId}", id);
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Kullanıcı bilgileri getirilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Kullanıcının profilini günceller
        /// </summary>
        /// <param name="updateDto">Güncelleme bilgileri</param>
        /// <returns>Güncellenmiş kullanıcı bilgileri</returns>
        [HttpPut("profile")]
        [ProducesResponseType(typeof(ApiResponseModel<UserDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<UserDto>>> UpdateProfile([FromBody] UpdateProfileDto updateDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var user = await _userService.UpdateUserProfileAsync(userId.Value, updateDto);

                return Ok(ApiResponseModel<UserDto>.SuccessResponse(
                    "Profil başarıyla güncellendi",
                    user
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user profile");
                return StatusCode(500, ApiResponseModel<UserDto>.ErrorResponse(
                    "Profil güncellenirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Kullanıcının istatistiklerini getirir
        /// </summary>
        /// <returns>Kullanıcı istatistikleri</returns>
        /// <response code="200">İstatistikler başarıyla getirildi</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="404">Kullanıcı bulunamadı</response>
        [HttpGet("statistics")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponseModel<UserStatsDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        public async Task<ActionResult<ApiResponseModel<UserStatsDto>>> GetUserStatistics()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var stats = await _userService.GetUserStatsAsync(userId.Value);
                return Ok(ApiResponseModel<UserStatsDto>.SuccessResponse(
                    "Kullanıcı istatistikleri getirildi",
                    stats
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user statistics for user: {UserId}", GetCurrentUserId());
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "İstatistikler getirilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Kullanıcının şifresini değiştirir
        /// </summary>
        /// <param name="changePasswordDto">Şifre değiştirme bilgileri</param>
        /// <returns>İşlem sonucu</returns>
        [HttpPost("change-password")]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<object>>> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                await _userService.ChangePasswordAsync(userId.Value, changePasswordDto);

                return Ok(ApiResponseModel<object>.SuccessResponse(
                    "Şifreniz başarıyla değiştirildi",
                    null
                ));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Şifre değiştirilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Şifre sıfırlama isteği gönderir
        /// </summary>
        /// <param name="passwordResetRequestDto">Şifre sıfırlama istek bilgileri</param>
        /// <returns>İşlem sonucu</returns>
        [HttpPost("password-reset-request")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<object>>> RequestPasswordReset([FromBody] PasswordResetRequestDto passwordResetRequestDto)
        {
            try
            {
                await _userService.RequestPasswordResetAsync(passwordResetRequestDto);

                return Ok(ApiResponseModel<object>.SuccessResponse(
                    "Şifre sıfırlama bağlantısı email adresinize gönderildi",
                    null
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error requesting password reset");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Şifre sıfırlama isteği gönderilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Şifre sıfırlama işlemini gerçekleştirir
        /// </summary>
        /// <param name="passwordResetDto">Şifre sıfırlama bilgileri</param>
        /// <returns>İşlem sonucu</returns>
        [HttpPost("password-reset")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<object>>> ResetPassword([FromBody] PasswordResetDto passwordResetDto)
        {
            try
            {
                await _userService.ResetPasswordAsync(passwordResetDto);

                return Ok(ApiResponseModel<object>.SuccessResponse(
                    "Şifreniz başarıyla sıfırlandı",
                    null
                ));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Şifre sıfırlanırken bir hata oluştu"));
            }
        }

        /// <summary>
        /// E-posta doğrulama isteği gönderir
        /// </summary>
        /// <param name="emailVerificationRequestDto">E-posta doğrulama istek bilgileri</param>
        /// <returns>İşlem sonucu</returns>
        [HttpPost("email-verification-request")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<object>>> RequestEmailVerification([FromBody] EmailVerificationRequestDto emailVerificationRequestDto)
        {
            try
            {
                await _userService.RequestEmailVerificationAsync(emailVerificationRequestDto);

                return Ok(ApiResponseModel<object>.SuccessResponse(
                    "E-posta doğrulama bağlantısı email adresinize gönderildi",
                    null
                ));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error requesting email verification");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "E-posta doğrulama isteği gönderilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// E-posta doğrulama işlemini gerçekleştirir
        /// </summary>
        /// <param name="emailVerificationDto">E-posta doğrulama bilgileri</param>
        /// <returns>İşlem sonucu</returns>
        [HttpPost("email-verification")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<object>>> VerifyEmail([FromBody] EmailVerificationDto emailVerificationDto)
        {
            try
            {
                await _userService.VerifyEmailAsync(emailVerificationDto);

                return Ok(ApiResponseModel<object>.SuccessResponse(
                    "E-posta adresiniz başarıyla doğrulandı",
                    null
                ));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying email");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "E-posta doğrulanırken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Access token'ı yeniler
        /// </summary>
        /// <param name="tokenRefreshRequestDto">Token yenileme istek bilgileri</param>
        /// <returns>Yeni token bilgileri</returns>
        [HttpPost("refresh-token")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponseModel<TokenRefreshResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<TokenRefreshResponseDto>>> RefreshToken([FromBody] TokenRefreshRequestDto tokenRefreshRequestDto)
        {
            try
            {
                var result = await _userService.RefreshTokenAsync(tokenRefreshRequestDto);

                return Ok(ApiResponseModel<TokenRefreshResponseDto>.SuccessResponse(
                    "Token başarıyla yenilendi",
                    result
                ));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing token");
                return StatusCode(500, ApiResponseModel<TokenRefreshResponseDto>.ErrorResponse(
                    "Token yenilenirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Kullanıcının refresh token'ını iptal eder
        /// </summary>
        /// <returns>İşlem sonucu</returns>
        [HttpPost("revoke-refresh-token")]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<object>>> RevokeRefreshToken()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                await _userService.RevokeRefreshTokenAsync(userId.Value);

                return Ok(ApiResponseModel<object>.SuccessResponse(
                    "Refresh token başarıyla iptal edildi",
                    null
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking refresh token");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Refresh token iptal edilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Kullanıcının tüm aktif oturumlarını sonlandırır
        /// </summary>
        /// <returns>İşlem sonucu</returns>
        [HttpPost("logout-all-sessions")]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<object>>> LogoutAllSessions()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                await _userService.LogoutAllSessionsAsync(userId.Value);

                return Ok(ApiResponseModel<object>.SuccessResponse(
                    "Tüm oturumlar başarıyla sonlandırıldı",
                    null
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging out all sessions");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Oturumlar sonlandırılırken bir hata oluştu"));
            }
        }

        #endregion

        #region Test Endpoints (Development Only)

        /// <summary>
        /// Global exception handler'ı test etmek için endpoint
        /// Sadece development ortamında aktif
        /// </summary>
        /// <param name="exceptionType">Test edilecek exception tipi</param>
        /// <returns>Exception fırlatır</returns>
        [HttpGet("test-exception/{exceptionType}")]
        [ApiExplorerSettings(IgnoreApi = true)] // Swagger'da gözükmesin
        public ActionResult TestException(string exceptionType)
        {
            // Sadece development ortamında çalışsın
            if (!HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment())
            {
                return NotFound();
            }

            // Exception tipine göre farklı exception'lar fırlat
            switch (exceptionType.ToLower())
            {
                case "unauthorized":
                    throw new UnauthorizedAccessException("Test unauthorized exception");
                
                case "notfound":
                    throw new KeyNotFoundException("Test not found exception");
                
                case "badrequest":
                    throw new ArgumentException("Test bad request exception");
                
                case "business":
                    throw new InvalidOperationException("Test business rule violation");
                
                case "timeout":
                    throw new TimeoutException("Test timeout exception");
                
                case "notimplemented":
                    throw new NotImplementedException("Test not implemented exception");
                
                case "general":
                default:
                    throw new Exception("Test general exception");
            }
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// JWT token'dan mevcut kullanıcının ID'sini alır
        /// </summary>
        /// <returns>User ID veya null</returns>
        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        #endregion
    }
} 