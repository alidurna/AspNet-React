using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;
using TaskFlow.API.Services;

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
        /// Entity Framework database context
        /// Kullanıcı verilerine erişim için kullanılır
        /// </summary>
        private readonly TaskFlowDbContext _context;

        /// <summary>
        /// JWT token oluşturma ve validation servisi
        /// Authentication işlemlerinde kullanılır
        /// </summary>
        private readonly IJwtService _jwtService;

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
        /// <param name="context">Database context</param>
        /// <param name="jwtService">JWT token servisi</param>
        /// <param name="logger">Logging servisi</param>
        /// <exception cref="ArgumentNullException">Herhangi bir parametre null ise fırlatılır</exception>
        public UsersController(
            TaskFlowDbContext context,
            IJwtService jwtService,
            ILogger<UsersController> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _jwtService = jwtService ?? throw new ArgumentNullException(nameof(jwtService));
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

                // Email benzersizlik kontrolü - aynı email ile kayıt olmuş kullanıcı var mı?
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == registerDto.Email.ToLower());

                if (existingUser != null)
                {
                    _logger.LogWarning("Registration attempted with existing email: {Email}", registerDto.Email);
                    return BadRequest(ApiResponseModel<object>.ErrorResponse("Bu email adresi zaten kayıtlı"));
                }

                // Şifre hash'leme - BCrypt kullanarak güvenli hash oluştur
                var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

                // Yeni User entity oluştur
                var user = new User
                {
                    Email = registerDto.Email.ToLower().Trim(), // Email'i normalize et
                    PasswordHash = passwordHash,
                    FirstName = registerDto.FirstName.Trim(),
                    LastName = registerDto.LastName.Trim(),
                    PhoneNumber = string.IsNullOrWhiteSpace(registerDto.PhoneNumber) 
                        ? null 
                        : registerDto.PhoneNumber.Trim(),
                    IsActive = true, // Yeni kullanıcı aktif olarak başlar
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Database'e kullanıcıyı ekle ve kaydet
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation("New user registered successfully: {Email} (ID: {UserId})", 
                    user.Email, user.Id);

                // JWT token oluştur
                var token = _jwtService.GenerateToken(user);
                var expirationMinutes = 60; // appsettings'den alınabilir

                // UserDto oluştur (password hash'i olmadan)
                var userDto = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    PhoneNumber = user.PhoneNumber,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt,
                    IsActive = user.IsActive
                };

                // AuthResponse DTO oluştur
                var authResponse = new AuthResponseDto
                {
                    Token = token,
                    ExpiresInMinutes = expirationMinutes,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes),
                    User = userDto,
                    Success = true,
                    Message = $"Hoş geldiniz {user.FullName}! Hesabınız başarıyla oluşturuldu."
                };

                // Başarılı response döndür - HTTP 201 Created
                return CreatedAtAction(
                    actionName: nameof(GetProfile),
                    routeValues: new { id = user.Id },
                    value: ApiResponseModel<AuthResponseDto>.SuccessResponse(
                        "Kullanıcı başarıyla oluşturuldu ve giriş yapıldı",
                        authResponse
                    )
                );
            }
            catch (Exception ex)
            {
                // Hata logla ve generic error response döndür
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

                // Kullanıcıyı email ile bul
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == loginDto.Email.ToLower());

                // Kullanıcı bulunamadı veya şifre yanlış
                if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                {
                    _logger.LogWarning("Failed login attempt for email: {Email}", loginDto.Email);
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Email veya şifre hatalı"));
                }

                // Kullanıcı aktif değilse giriş izni verme
                if (!user.IsActive)
                {
                    _logger.LogWarning("Login attempt for inactive user: {Email}", loginDto.Email);
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Hesabınız pasif durumda"));
                }

                _logger.LogInformation("User logged in successfully: {Email} (ID: {UserId})", 
                    user.Email, user.Id);

                // JWT token oluştur
                var token = _jwtService.GenerateToken(user);
                var expirationMinutes = 60; // appsettings'den alınabilir

                // UserDto oluştur
                var userDto = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    PhoneNumber = user.PhoneNumber,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt,
                    IsActive = user.IsActive
                };

                // AuthResponse DTO oluştur
                var authResponse = new AuthResponseDto
                {
                    Token = token,
                    ExpiresInMinutes = expirationMinutes,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes),
                    User = userDto,
                    Success = true,
                    Message = $"Hoş geldiniz {user.FullName}!"
                };

                return Ok(ApiResponseModel<AuthResponseDto>.SuccessResponse(
                    "Giriş başarılı",
                    authResponse
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for email: {Email}", loginDto.Email);
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Giriş sırasında bir hata oluştu"));
            }
        }

        #endregion

        #region Profile Management Endpoints

        /// <summary>
        /// Kullanıcının kendi profil bilgilerini getirme endpoint'i
        /// JWT token ile korunmalı - sadece kendi profilini görebilir
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
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst("sub")?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // Kullanıcıyı database'den getir
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

                if (user == null)
                {
                    return NotFound(ApiResponseModel<object>.ErrorResponse("Kullanıcı bulunamadı"));
                }

                // UserDto oluştur
                var userDto = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    PhoneNumber = user.PhoneNumber,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt,
                    IsActive = user.IsActive
                };

                return Ok(ApiResponseModel<UserDto>.SuccessResponse(
                    "Profil bilgileri başarıyla getirildi",
                    userDto
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting profile for user");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Profil bilgileri getirilemedi"));
            }
        }

        /// <summary>
        /// Kullanıcı ID'si ile profil getirme (public endpoint)
        /// Profile sayfaları için kullanılabilir
        /// </summary>
        /// <param name="id">Kullanıcı ID'si</param>
        /// <returns>Kullanıcı profil bilgileri</returns>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<UserDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        public async Task<ActionResult<ApiResponseModel<UserDto>>> GetProfile(int id)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.IsActive);

            if (user == null)
            {
                return NotFound(ApiResponseModel<object>.ErrorResponse("Kullanıcı bulunamadı"));
            }

            var userDto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                IsActive = user.IsActive
            };

            return Ok(ApiResponseModel<UserDto>.SuccessResponse(
                "Kullanıcı profili başarıyla getirildi",
                userDto
            ));
        }

        /// <summary>
        /// Kullanıcı profil güncelleme endpoint'i
        /// JWT token ile korunmalı - sadece kendi profilini güncelleyebilir
        /// </summary>
        /// <param name="updateDto">Güncellenecek profil bilgileri</param>
        /// <returns>Güncellenmiş profil bilgileri</returns>
        /// <response code="200">Profil başarıyla güncellendi</response>
        /// <response code="400">Geçersiz veri</response>
        /// <response code="401">Token geçersiz</response>
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
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst("sub")?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // Kullanıcıyı bul
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

                if (user == null)
                {
                    return NotFound(ApiResponseModel<object>.ErrorResponse("Kullanıcı bulunamadı"));
                }

                // Profil bilgilerini güncelle
                user.FirstName = updateDto.FirstName.Trim();
                user.LastName = updateDto.LastName.Trim();
                user.PhoneNumber = string.IsNullOrWhiteSpace(updateDto.PhoneNumber) 
                    ? null 
                    : updateDto.PhoneNumber.Trim();
                user.UpdatedAt = DateTime.UtcNow;

                // Değişiklikleri kaydet
                await _context.SaveChangesAsync();

                _logger.LogInformation("User profile updated: {Email} (ID: {UserId})", 
                    user.Email, user.Id);

                // Güncellenmiş UserDto oluştur
                var userDto = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    PhoneNumber = user.PhoneNumber,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt,
                    IsActive = user.IsActive
                };

                return Ok(ApiResponseModel<UserDto>.SuccessResponse(
                    "Profil başarıyla güncellendi",
                    userDto
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating profile");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Profil güncellenemedi"));
            }
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// JWT token'dan mevcut kullanıcı ID'sini alma helper methodu
        /// Controller içinde tekrar kullanım için
        /// </summary>
        /// <returns>Kullanıcı ID'si veya null</returns>
        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return null;
            }

            return userId;
        }

        #endregion
    }
} 