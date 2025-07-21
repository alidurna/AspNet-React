using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TaskFlow.API.Services;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;
using TaskFlow.API.Interfaces;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Net.Http;
using System.Text.Json;
using System.Security.Cryptography;

namespace TaskFlow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ITwoFactorAuthService _twoFactorService;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IUserService userService,
            ITwoFactorAuthService twoFactorService,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            ILogger<AuthController> logger)
        {
            _userService = userService;
            _twoFactorService = twoFactorService;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        /// <summary>
        /// Normal kullanıcı girişi
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous] // Giriş endpoint'i kimlik doğrulama gerektirmez
        public async Task<ActionResult<ApiResponseModel<AuthResponseDto>>> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                _logger.LogInformation("Login attempt for email: {Email}", loginDto.Email);

                // UserService üzerinden login işlemi
                var authResponse = await _userService.LoginAsync(loginDto);
                
                if (authResponse.Success)
                {
                    _logger.LogInformation("Login successful for user: {Email}", loginDto.Email);
                    return Ok(ApiResponseModel<AuthResponseDto>.SuccessResponse("Giriş başarılı", authResponse));
                }
                else
                {
                    _logger.LogWarning("Login failed for user: {Email}", loginDto.Email);
                    return BadRequest(ApiResponseModel<AuthResponseDto>.ErrorResponse(authResponse.Message));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login error for email: {Email}", loginDto.Email);
                return StatusCode(500, ApiResponseModel<AuthResponseDto>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// Kullanıcı kaydı
        /// </summary>
        [HttpPost("register")]
        public async Task<ActionResult<ApiResponseModel<AuthResponseDto>>> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                _logger.LogInformation("Register attempt for email: {Email}", registerDto.Email);

                // UserService üzerinden register işlemi
                var authResponse = await _userService.RegisterAsync(registerDto);
                
                if (authResponse.Success)
                {
                    _logger.LogInformation("Register successful for user: {Email}", registerDto.Email);
                    return Ok(ApiResponseModel<AuthResponseDto>.SuccessResponse("Kayıt başarılı", authResponse));
                }
                else
                {
                    _logger.LogWarning("Register failed for user: {Email}", registerDto.Email);
                    return BadRequest(ApiResponseModel<AuthResponseDto>.ErrorResponse(authResponse.Message));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Register error for email: {Email}", registerDto.Email);
                return StatusCode(500, ApiResponseModel<AuthResponseDto>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// 2FA doğrulama ile login
        /// </summary>
        [HttpPost("login-2fa")]
        public async Task<ActionResult<ApiResponseModel<AuthResponseDto>>> LoginWith2FA([FromBody] Login2FARequestDto request)
        {
            try
            {
                _logger.LogInformation("2FA login attempt for email: {Email}", request.Email);

                // Kullanıcıyı bul
                var user = await _userService.GetUserByEmailAsync(request.Email);
                if (user == null)
                {
                    return BadRequest(ApiResponseModel<AuthResponseDto>.ErrorResponse("Geçersiz email veya şifre"));
                }

                // Şifre doğrula
                if (!await _userService.VerifyPasswordAsync(request.Email, request.Password))
                {
                    return BadRequest(ApiResponseModel<AuthResponseDto>.ErrorResponse("Geçersiz email veya şifre"));
                }

                // 2FA etkin mi kontrol et
                if (!user.TwoFactorEnabled || string.IsNullOrEmpty(user.TwoFactorSecret))
                {
                    return BadRequest(ApiResponseModel<AuthResponseDto>.ErrorResponse("2FA etkin değil"));
                }

                // TOTP kodu doğrula
                if (!_twoFactorService.VerifyTotpCode(user.TwoFactorSecret, request.TotpCode))
                {
                    return BadRequest(ApiResponseModel<AuthResponseDto>.ErrorResponse("Geçersiz doğrulama kodu"));
                }

                // JWT token oluştur
                var token = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();

                // Refresh token'ı kaydet
                await _userService.SaveRefreshTokenAsync(user.Id, refreshToken);

                // Son kullanım zamanını güncelle
                user.TwoFactorLastUsed = DateTime.UtcNow;
                user.LastLoginAt = DateTime.UtcNow;
                await _userService.UpdateUserAsync(user);

                var response = new AuthResponseDto
                {
                    Token = token,
                    RefreshToken = refreshToken,
                    User = new UserDto
                    {
                        Id = user.Id,
                        Email = user.Email,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        PhoneNumber = user.PhoneNumber,
                        ProfileImage = user.ProfileImage,
                        CreatedAt = user.CreatedAt,
                        LastLoginAt = user.LastLoginAt
                    }
                };

                _logger.LogInformation("2FA login successful for user: {Email}", request.Email);

                return Ok(ApiResponseModel<AuthResponseDto>.SuccessResponse("2FA ile başarıyla giriş yapıldı", response));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "2FA login error for email: {Email}", request.Email);
                return StatusCode(500, ApiResponseModel<AuthResponseDto>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// Recovery code ile login
        /// </summary>
        [HttpPost("login-recovery")]
        public async Task<ActionResult<ApiResponseModel<AuthResponseDto>>> LoginWithRecoveryCode([FromBody] LoginRecoveryRequestDto request)
        {
            try
            {
                _logger.LogInformation("Recovery code login attempt for email: {Email}", request.Email);

                // Kullanıcıyı bul
                var user = await _userService.GetUserByEmailAsync(request.Email);
                if (user == null)
                {
                    return BadRequest(ApiResponseModel<AuthResponseDto>.ErrorResponse("Geçersiz email veya şifre"));
                }

                // Şifre doğrula
                if (!await _userService.VerifyPasswordAsync(request.Email, request.Password))
                {
                    return BadRequest(ApiResponseModel<AuthResponseDto>.ErrorResponse("Geçersiz email veya şifre"));
                }

                // 2FA etkin mi kontrol et
                if (!user.TwoFactorEnabled || string.IsNullOrEmpty(user.TwoFactorRecoveryCodes))
                {
                    return BadRequest(ApiResponseModel<AuthResponseDto>.ErrorResponse("2FA etkin değil"));
                }

                // Recovery code doğrula
                var recoveryCodes = JsonSerializer.Deserialize<List<string>>(user.TwoFactorRecoveryCodes);
                if (recoveryCodes == null || !recoveryCodes.Contains(request.RecoveryCode))
                {
                    return BadRequest(ApiResponseModel<AuthResponseDto>.ErrorResponse("Geçersiz recovery code"));
                }

                // Recovery code'u listeden çıkar
                recoveryCodes.Remove(request.RecoveryCode);
                user.TwoFactorRecoveryCodes = JsonSerializer.Serialize(recoveryCodes);

                // JWT token oluştur
                var token = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();

                // Refresh token'ı kaydet
                await _userService.SaveRefreshTokenAsync(user.Id, refreshToken);

                // Son kullanım zamanını güncelle
                user.TwoFactorLastUsed = DateTime.UtcNow;
                user.LastLoginAt = DateTime.UtcNow;
                await _userService.UpdateUserAsync(user);

                var response = new AuthResponseDto
                {
                    Token = token,
                    RefreshToken = refreshToken,
                    User = new UserDto
                    {
                        Id = user.Id,
                        Email = user.Email,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        PhoneNumber = user.PhoneNumber,
                        ProfileImage = user.ProfileImage,
                        CreatedAt = user.CreatedAt,
                        LastLoginAt = user.LastLoginAt
                    }
                };

                _logger.LogInformation("Recovery code login successful for user: {Email}", request.Email);

                return Ok(ApiResponseModel<AuthResponseDto>.SuccessResponse("Recovery code ile başarıyla giriş yapıldı", response));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Recovery code login error for email: {Email}", request.Email);
                return StatusCode(500, ApiResponseModel<AuthResponseDto>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// Sosyal medya hesapları ile giriş
        /// </summary>
        [HttpPost("social-login")]
        public async Task<ActionResult<ApiResponseModel<AuthResponseDto>>> SocialLogin([FromBody] SocialLoginRequest request)
        {
            try
            {
                _logger.LogInformation("Social login attempt for provider: {Provider}", request.Provider);

                // Token doğrulama
                var userData = await ValidateSocialToken(request.Provider, request.Token);
                if (userData == null)
                {
                    return BadRequest(new ApiResponseModel<AuthResponseDto>
                    {
                        Success = false,
                        Message = "Geçersiz token"
                    });
                }

                // Kullanıcıyı bul veya oluştur
                var user = await _userService.GetUserByEmailAsync(userData.Email);
                if (user == null)
                {
                    // Yeni kullanıcı oluştur
                    user = new User
                    {
                        Email = userData.Email,
                        FirstName = userData.FirstName ?? "Kullanıcı",
                        LastName = userData.LastName ?? "",
                        ProfileImage = userData.ProfileImage,
                        IsEmailVerified = true, // Sosyal medya ile gelen kullanıcılar doğrulanmış kabul edilir
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    await _userService.CreateUserAsync(user);
                    _logger.LogInformation("New user created via social login: {Email}", userData.Email);
                }
                else
                {
                    // Mevcut kullanıcının bilgilerini güncelle
                    user.LastLoginAt = DateTime.UtcNow;
                    user.UpdatedAt = DateTime.UtcNow;
                    if (!string.IsNullOrEmpty(userData.ProfileImage))
                    {
                        user.ProfileImage = userData.ProfileImage;
                    }

                    await _userService.UpdateUserAsync(user);
                    _logger.LogInformation("Existing user logged in via social login: {Email}", userData.Email);
                }

                // JWT token oluştur
                var token = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();

                // Refresh token'ı kaydet
                await _userService.SaveRefreshTokenAsync(user.Id, refreshToken);

                var response = new AuthResponseDto
                {
                    Token = token,
                    RefreshToken = refreshToken,
                    User = new UserDto
                    {
                        Id = user.Id,
                        Email = user.Email,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        PhoneNumber = user.PhoneNumber,
                        ProfileImage = user.ProfileImage,
                        CreatedAt = user.CreatedAt,
                        LastLoginAt = user.LastLoginAt
                    }
                };

                return Ok(new ApiResponseModel<AuthResponseDto>
                {
                    Success = true,
                    Message = $"{request.Provider} ile başarıyla giriş yapıldı",
                    Data = response
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Social login error for provider: {Provider}", request.Provider);
                return StatusCode(500, new ApiResponseModel<AuthResponseDto>
                {
                    Success = false,
                    Message = "Sosyal medya girişi sırasında bir hata oluştu"
                });
            }
        }

        /// <summary>
        /// Kullanıcı çıkış (logout) endpoint'i
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            // Burada refresh token veya session iptali yapılabilir.
            // Şimdilik sadece başarılı yanıt dönüyoruz.
            _logger.LogInformation("User logged out: {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            return Ok(new { success = true, message = "Çıkış başarılı" });
        }

        /// <summary>
        /// Google OAuth token doğrulama
        /// </summary>
        private async Task<SocialUserData?> ValidateGoogleToken(string token)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                var response = await client.GetAsync($"https://oauth2.googleapis.com/tokeninfo?id_token={token}");
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var tokenInfo = JsonSerializer.Deserialize<GoogleTokenInfo>(content);
                    
                    if (tokenInfo?.Aud == _configuration["OAuth:Google:ClientId"])
                    {
                        return new SocialUserData
                        {
                            Id = tokenInfo.Sub,
                            Email = tokenInfo.Email,
                            FirstName = tokenInfo.GivenName,
                            LastName = tokenInfo.FamilyName,
                            ProfileImage = tokenInfo.Picture,
                            Provider = "google"
                        };
                    }
                }
                
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Google token validation error");
                return null;
            }
        }

        /// <summary>
        /// Apple OAuth token doğrulama
        /// </summary>
        private async Task<SocialUserData?> ValidateAppleToken(string token)
        {
            try
            {
                // Apple token doğrulama (basit implementasyon)
                // Gerçek uygulamada Apple'ın public key'leri ile JWT doğrulaması yapılmalı
                var client = _httpClientFactory.CreateClient();
                var response = await client.GetAsync($"https://appleid.apple.com/auth/keys");
                
                if (response.IsSuccessStatusCode)
                {
                    // Apple token doğrulama mantığı burada implement edilecek
                    // Şimdilik basit bir mock response döndürüyoruz
                    return new SocialUserData
                    {
                        Id = "apple_user_id",
                        Email = "user@example.com",
                        FirstName = "Apple",
                        LastName = "User",
                        Provider = "apple"
                    };
                }
                
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Apple token validation error");
                return null;
            }
        }

        /// <summary>
        /// Microsoft OAuth token doğrulama
        /// </summary>
        private async Task<SocialUserData?> ValidateMicrosoftToken(string token)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
                
                var response = await client.GetAsync("https://graph.microsoft.com/v1.0/me");
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var userInfo = JsonSerializer.Deserialize<MicrosoftUserInfo>(content);
                    
                    return new SocialUserData
                    {
                        Id = userInfo?.Id ?? "",
                        Email = userInfo?.UserPrincipalName ?? "",
                        FirstName = userInfo?.GivenName,
                        LastName = userInfo?.Surname,
                        Provider = "microsoft"
                    };
                }
                
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Microsoft token validation error");
                return null;
            }
        }

        /// <summary>
        /// Sosyal medya token doğrulama
        /// </summary>
        private async Task<SocialUserData?> ValidateSocialToken(string provider, string token)
        {
            return provider.ToLower() switch
            {
                "google" => await ValidateGoogleToken(token),
                "apple" => await ValidateAppleToken(token),
                "microsoft" => await ValidateMicrosoftToken(token),
                _ => null
            };
        }

        /// <summary>
        /// JWT token oluşturma
        /// </summary>
        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "default-key"));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim("userId", user.Id.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        /// <summary>
        /// Refresh token oluşturma
        /// </summary>
        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }

    /// <summary>
    /// Sosyal medya giriş isteği
    /// </summary>
    public class SocialLoginRequest
    {
        public string Provider { get; set; } = "";
        public string Token { get; set; } = "";
        public SocialUserData UserData { get; set; } = new();
    }

    /// <summary>
    /// Sosyal medya kullanıcı verisi
    /// </summary>
    public class SocialUserData
    {
        public string Id { get; set; } = "";
        public string Email { get; set; } = "";
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? ProfileImage { get; set; }
        public string Provider { get; set; } = "";
    }

    /// <summary>
    /// Google token bilgisi
    /// </summary>
    public class GoogleTokenInfo
    {
        public string? Aud { get; set; }
        public string? Sub { get; set; }
        public string? Email { get; set; }
        public string? GivenName { get; set; }
        public string? FamilyName { get; set; }
        public string? Picture { get; set; }
    }

    /// <summary>
    /// Microsoft kullanıcı bilgisi
    /// </summary>
    public class MicrosoftUserInfo
    {
        public string? Id { get; set; }
        public string? UserPrincipalName { get; set; }
        public string? GivenName { get; set; }
        public string? Surname { get; set; }
    }
} 