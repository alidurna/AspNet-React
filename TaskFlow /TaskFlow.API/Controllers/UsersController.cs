using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;

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
    [Route("api/[controller]")]
    [Produces("application/json")]
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
                // Model validation - DTO validation attributes kontrolü
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();

                    _logger.LogWarning("Register validation failed: {Errors}", string.Join(", ", errors));
                    return BadRequest(ApiResponseModel<object>.ErrorResponse("Validation hatası", errors));
                }

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
                // Model validation
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();

                    return BadRequest(ApiResponseModel<object>.ErrorResponse("Validation hatası", errors));
                }

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
        /// Mevcut kullanıcının profil bilgilerini günceller
        /// </summary>
        /// <param name="updateDto">Güncellenecek profil bilgileri</param>
        /// <returns>Güncellenmiş kullanıcı bilgileri</returns>
        /// <response code="200">Profil başarıyla güncellendi</response>
        /// <response code="400">Geçersiz veri</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="404">Kullanıcı bulunamadı</response>
        [HttpPut("profile")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponseModel<UserDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        public async Task<ActionResult<ApiResponseModel<UserDto>>> UpdateProfile([FromBody] UpdateProfileDto updateDto)
        {
            try
            {
                // Model validation
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();

                    return BadRequest(ApiResponseModel<object>.ErrorResponse("Validation hatası", errors));
                }

                // JWT token'dan user ID'yi al
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // UserService ile profil güncelle
                var updatedUser = await _userService.UpdateUserProfileAsync(userId.Value, updateDto);

                _logger.LogInformation("User profile updated successfully: {UserId}", userId.Value);

                return Ok(ApiResponseModel<UserDto>.SuccessResponse(
                    "Profil başarıyla güncellendi",
                    updatedUser
                ));
            }
            catch (InvalidOperationException ex)
            {
                // Business rule violations
                _logger.LogWarning("Profile update failed: {Error}", ex.Message);
                return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating profile");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Profil güncellenirken bir hata oluştu"));
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