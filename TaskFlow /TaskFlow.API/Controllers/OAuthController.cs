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
    public class OAuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<OAuthController> _logger;

        public OAuthController(
            IUserService userService,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            ILogger<OAuthController> logger)
        {
            _userService = userService;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        /// <summary>
        /// Google OAuth başlatma
        /// </summary>
        [HttpGet("google")]
        public IActionResult GoogleAuth()
        {
            try
            {
                var clientId = _configuration["OAuth:Google:ClientId"];
                var redirectUri = _configuration["OAuth:Google:RedirectUri"];
                
                if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(redirectUri))
                {
                    return BadRequest("Google OAuth konfigürasyonu eksik");
                }

                var authUrl = $"https://accounts.google.com/o/oauth2/v2/auth?" +
                             $"client_id={clientId}&" +
                             $"redirect_uri={Uri.EscapeDataString(redirectUri)}&" +
                             $"response_type=code&" +
                             $"scope={Uri.EscapeDataString("openid profile email")}&" +
                             $"access_type=offline&" +
                             $"prompt=consent";

                return Redirect(authUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Google OAuth başlatma hatası");
                return StatusCode(500, "OAuth başlatma hatası");
            }
        }

        /// <summary>
        /// Google OAuth callback
        /// </summary>
        [HttpGet("google/callback")]
        public async Task<IActionResult> GoogleCallback([FromQuery] string code, [FromQuery] string? error)
        {
            try
            {
                if (!string.IsNullOrEmpty(error))
                {
                    return Redirect($"/login?error={Uri.EscapeDataString(error)}");
                }

                if (string.IsNullOrEmpty(code))
                {
                    return Redirect("/login?error=Authorization code not received");
                }

                // Authorization code'u access token'a çevir
                var tokenResponse = await ExchangeCodeForToken(code, "google");
                if (tokenResponse == null)
                {
                    return Redirect("/login?error=Token exchange failed");
                }

                // Access token ile kullanıcı bilgilerini al
                var userInfo = await GetGoogleUserInfo(tokenResponse.AccessToken);
                if (userInfo == null)
                {
                    return Redirect("/login?error=Failed to get user info");
                }

                // Kullanıcıyı bul veya oluştur
                var user = await _userService.GetUserByEmailAsync(userInfo.Email);
                if (user == null)
                {
                    user = new User
                    {
                        Email = userInfo.Email,
                        FirstName = userInfo.GivenName ?? "Kullanıcı",
                        LastName = userInfo.FamilyName ?? "",
                        ProfileImage = userInfo.Picture,
                        IsEmailVerified = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    await _userService.CreateUserAsync(user);
                    _logger.LogInformation("New user created via Google OAuth: {Email}", userInfo.Email);
                }
                else
                {
                    user.LastLoginAt = DateTime.UtcNow;
                    user.UpdatedAt = DateTime.UtcNow;
                    if (!string.IsNullOrEmpty(userInfo.Picture))
                    {
                        user.ProfileImage = userInfo.Picture;
                    }

                    await _userService.UpdateUserAsync(user);
                    _logger.LogInformation("Existing user logged in via Google OAuth: {Email}", userInfo.Email);
                }

                // JWT token oluştur
                var jwtToken = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();
                await _userService.SaveRefreshTokenAsync(user.Id, refreshToken);

                // Frontend'e başarılı yanıt gönder
                var successHtml = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Google OAuth Success</title>
                </head>
                <body>
                    <script>
                        window.opener.postMessage({{
                            type: 'OAUTH_SUCCESS',
                            token: '{jwtToken}',
                            userData: {{
                                id: '{user.Id}',
                                email: '{user.Email}',
                                firstName: '{user.FirstName}',
                                lastName: '{user.LastName}',
                                profileImage: '{user.ProfileImage ?? ""}',
                                provider: 'google'
                            }}
                        }}, '*');
                        window.close();
                    </script>
                    <p>Giriş başarılı! Bu pencere otomatik olarak kapanacak.</p>
                </body>
                </html>";

                return Content(successHtml, "text/html");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Google OAuth callback hatası");
                return Redirect("/login?error=OAuth callback error");
            }
        }

        /// <summary>
        /// Apple OAuth başlatma
        /// </summary>
        [HttpGet("apple")]
        public IActionResult AppleAuth()
        {
            try
            {
                var clientId = _configuration["OAuth:Apple:ClientId"];
                var redirectUri = _configuration["OAuth:Apple:RedirectUri"];
                
                if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(redirectUri))
                {
                    return BadRequest("Apple OAuth konfigürasyonu eksik");
                }

                var authUrl = $"https://appleid.apple.com/auth/authorize?" +
                             $"client_id={clientId}&" +
                             $"redirect_uri={Uri.EscapeDataString(redirectUri)}&" +
                             $"response_type=code&" +
                             $"scope={Uri.EscapeDataString("name email")}&" +
                             $"response_mode=form_post";

                return Redirect(authUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Apple OAuth başlatma hatası");
                return StatusCode(500, "OAuth başlatma hatası");
            }
        }

        /// <summary>
        /// Apple OAuth callback
        /// </summary>
        [HttpGet("apple/callback")]
        public async Task<IActionResult> AppleCallback([FromQuery] string code, [FromQuery] string? error)
        {
            try
            {
                if (!string.IsNullOrEmpty(error))
                {
                    return Redirect($"/login?error={Uri.EscapeDataString(error)}");
                }

                if (string.IsNullOrEmpty(code))
                {
                    return Redirect("/login?error=Authorization code not received");
                }

                // Authorization code'u access token'a çevir
                var tokenResponse = await ExchangeCodeForToken(code, "apple");
                if (tokenResponse == null)
                {
                    return Redirect("/login?error=Token exchange failed");
                }

                // Apple için basit mock kullanıcı oluştur (gerçek implementasyonda Apple API'si kullanılır)
                var user = new User
                {
                    Email = "apple_user@example.com",
                    FirstName = "Apple",
                    LastName = "User",
                    IsEmailVerified = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _userService.CreateUserAsync(user);
                _logger.LogInformation("New user created via Apple OAuth: {Email}", user.Email);

                // JWT token oluştur
                var jwtToken = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();
                await _userService.SaveRefreshTokenAsync(user.Id, refreshToken);

                // Frontend'e başarılı yanıt gönder
                var successHtml = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Apple OAuth Success</title>
                </head>
                <body>
                    <script>
                        window.opener.postMessage({{
                            type: 'OAUTH_SUCCESS',
                            token: '{jwtToken}',
                            userData: {{
                                id: '{user.Id}',
                                email: '{user.Email}',
                                firstName: '{user.FirstName}',
                                lastName: '{user.LastName}',
                                profileImage: '{user.ProfileImage ?? ""}',
                                provider: 'apple'
                            }}
                        }}, '*');
                        window.close();
                    </script>
                    <p>Giriş başarılı! Bu pencere otomatik olarak kapanacak.</p>
                </body>
                </html>";

                return Content(successHtml, "text/html");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Apple OAuth callback hatası");
                return Redirect("/login?error=OAuth callback error");
            }
        }

        /// <summary>
        /// Microsoft OAuth başlatma
        /// </summary>
        [HttpGet("microsoft")]
        public IActionResult MicrosoftAuth()
        {
            try
            {
                var clientId = _configuration["OAuth:Microsoft:ClientId"];
                var redirectUri = _configuration["OAuth:Microsoft:RedirectUri"];
                
                if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(redirectUri))
                {
                    return BadRequest("Microsoft OAuth konfigürasyonu eksik");
                }

                var authUrl = $"https://login.microsoftonline.com/common/oauth2/v2.0/authorize?" +
                             $"client_id={clientId}&" +
                             $"redirect_uri={Uri.EscapeDataString(redirectUri)}&" +
                             $"response_type=code&" +
                             $"scope={Uri.EscapeDataString("openid profile email User.Read")}&" +
                             $"response_mode=query";

                return Redirect(authUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Microsoft OAuth başlatma hatası");
                return StatusCode(500, "OAuth başlatma hatası");
            }
        }

        /// <summary>
        /// Microsoft OAuth callback
        /// </summary>
        [HttpGet("microsoft/callback")]
        public async Task<IActionResult> MicrosoftCallback([FromQuery] string code, [FromQuery] string? error)
        {
            try
            {
                if (!string.IsNullOrEmpty(error))
                {
                    return Redirect($"/login?error={Uri.EscapeDataString(error)}");
                }

                if (string.IsNullOrEmpty(code))
                {
                    return Redirect("/login?error=Authorization code not received");
                }

                // Authorization code'u access token'a çevir
                var tokenResponse = await ExchangeCodeForToken(code, "microsoft");
                if (tokenResponse == null)
                {
                    return Redirect("/login?error=Token exchange failed");
                }

                // Microsoft için basit mock kullanıcı oluştur (gerçek implementasyonda Microsoft Graph API'si kullanılır)
                var user = new User
                {
                    Email = "microsoft_user@example.com",
                    FirstName = "Microsoft",
                    LastName = "User",
                    IsEmailVerified = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _userService.CreateUserAsync(user);
                _logger.LogInformation("New user created via Microsoft OAuth: {Email}", user.Email);

                // JWT token oluştur
                var jwtToken = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();
                await _userService.SaveRefreshTokenAsync(user.Id, refreshToken);

                // Frontend'e başarılı yanıt gönder
                var successHtml = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Microsoft OAuth Success</title>
                </head>
                <body>
                    <script>
                        window.opener.postMessage({{
                            type: 'OAUTH_SUCCESS',
                            token: '{jwtToken}',
                            userData: {{
                                id: '{user.Id}',
                                email: '{user.Email}',
                                firstName: '{user.FirstName}',
                                lastName: '{user.LastName}',
                                profileImage: '{user.ProfileImage ?? ""}',
                                provider: 'microsoft'
                            }}
                        }}, '*');
                        window.close();
                    </script>
                    <p>Giriş başarılı! Bu pencere otomatik olarak kapanacak.</p>
                </body>
                </html>";

                return Content(successHtml, "text/html");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Microsoft OAuth callback hatası");
                return Redirect("/login?error=OAuth callback error");
            }
        }

        /// <summary>
        /// Authorization code'u access token'a çevir
        /// </summary>
        private async Task<TokenResponse?> ExchangeCodeForToken(string code, string provider)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                var tokenUrl = provider switch
                {
                    "google" => "https://oauth2.googleapis.com/token",
                    "apple" => "https://appleid.apple.com/auth/token",
                    "microsoft" => "https://login.microsoftonline.com/common/oauth2/v2.0/token",
                    _ => throw new ArgumentException("Geçersiz provider")
                };

                var clientId = _configuration[$"OAuth:{provider}:ClientId"];
                var clientSecret = _configuration[$"OAuth:{provider}:ClientSecret"];
                var redirectUri = _configuration[$"OAuth:{provider}:RedirectUri"];

                var tokenRequest = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("client_id", clientId),
                    new KeyValuePair<string, string>("client_secret", clientSecret),
                    new KeyValuePair<string, string>("code", code),
                    new KeyValuePair<string, string>("grant_type", "authorization_code"),
                    new KeyValuePair<string, string>("redirect_uri", redirectUri)
                });

                var response = await client.PostAsync(tokenUrl, tokenRequest);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return JsonSerializer.Deserialize<TokenResponse>(content);
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Token exchange hatası");
                return null;
            }
        }

        /// <summary>
        /// Google kullanıcı bilgilerini al
        /// </summary>
        private async Task<GoogleUserInfo?> GetGoogleUserInfo(string accessToken)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
                
                var response = await client.GetAsync("https://www.googleapis.com/oauth2/v2/userinfo");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return JsonSerializer.Deserialize<GoogleUserInfo>(content);
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Google user info alma hatası");
                return null;
            }
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
    /// Token yanıt modeli
    /// </summary>
    public class TokenResponse
    {
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public string? TokenType { get; set; }
        public int? ExpiresIn { get; set; }
    }

    /// <summary>
    /// Google kullanıcı bilgisi
    /// </summary>
    public class GoogleUserInfo
    {
        public string? Id { get; set; }
        public string? Email { get; set; }
        public string? GivenName { get; set; }
        public string? FamilyName { get; set; }
        public string? Picture { get; set; }
    }
} 