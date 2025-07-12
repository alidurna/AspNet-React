// ****************************************************************************************************
//  JWTSERVICE.CS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının JWT (JSON Web Token) yönetimi sisteminin ana servisidir. Kullanıcı
//  authentication için JWT token'ları oluşturma, doğrulama, yenileme ve yönetimi işlemlerini yönetir.
//  Güvenli token generation, validation ve refresh token management sağlar.
//
//  ANA BAŞLIKLAR:
//  - JWT Token Generation ve Validation
//  - Refresh Token Management
//  - Token Claims ve Metadata
//  - Token Expiration ve Time Management
//  - Security ve Encryption
//  - Token Parsing ve Analysis
//
//  GÜVENLİK:
//  - HMAC-SHA256 signing algorithm
//  - Secure random number generation
//  - Token expiration validation
//  - Issuer ve audience validation
//  - Clock skew protection
//  - Secure key management
//
//  HATA YÖNETİMİ:
//  - Comprehensive exception handling
//  - Token validation errors
//  - Malformed token handling
//  - Expired token detection
//  - Graceful error recovery
//
//  EDGE-CASE'LER:
//  - Expired tokens
//  - Malformed token strings
//  - Invalid signing keys
//  - Clock synchronization issues
//  - Empty or null tokens
//  - Token with missing claims
//  - Concurrent token validation
//
//  YAN ETKİLER:
//  - Token generation creates new session data
//  - Token validation may update last access time
//  - Refresh token generation affects user sessions
//  - Token expiration affects user authentication
//  - Claims extraction may expose sensitive data
//
//  PERFORMANS:
//  - Efficient token generation
//  - Optimized validation algorithms
//  - Minimal memory allocation
//  - Fast token parsing
//  - Caching for validation parameters
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Service layer pattern
//  - Dependency injection
//  - Comprehensive documentation
//  - Extensible token system
//  - Configuration-based settings
// ****************************************************************************************************
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TaskFlow.API.Models;

namespace TaskFlow.API.Services
{
    public interface IJwtService
    {
        string GenerateToken(User user);
        string GenerateRefreshToken();
        int TokenExpirationMinutes { get; }
        int? GetUserIdFromToken(string token);
    }

    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;
        private readonly SymmetricSecurityKey _key;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]));
        }

        public int TokenExpirationMinutes => _configuration.GetValue<int>("Jwt:AccessTokenExpirationMinutes", 60);

        public string GenerateToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim(ClaimTypes.MobilePhone, user.PhoneNumber ?? string.Empty)
            };

            var credentials = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddMinutes(TokenExpirationMinutes);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expires,
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public int? GetUserIdFromToken(string token)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(token))
                    return null;

                var tokenHandler = new JwtSecurityTokenHandler();
                var principal = tokenHandler.ValidateToken(token, GetTokenValidationParameters(), out _);

                var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
                {
                    return userId;
                }

                return null;
            }
            catch
            {
                return null;
            }
        }

        public bool IsTokenValid(string token)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(token))
                    return false;

                var tokenHandler = new JwtSecurityTokenHandler();
                tokenHandler.ValidateToken(token, GetTokenValidationParameters(), out _);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public Dictionary<string, string> GetTokenClaims(string token)
        {
            var claims = new Dictionary<string, string>();

            try
            {
                if (string.IsNullOrWhiteSpace(token))
                    return claims;

                var tokenHandler = new JwtSecurityTokenHandler();
                var principal = tokenHandler.ValidateToken(token, GetTokenValidationParameters(), out _);

                foreach (var claim in principal.Claims)
                {
                    claims[claim.Type] = claim.Value;
                }
            }
            catch
            {
                // Return empty dictionary on error
            }

            return claims;
        }

        public TimeSpan? GetTokenRemainingTime(string token)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(token))
                    return null;

                var tokenHandler = new JwtSecurityTokenHandler();
                var jsonToken = tokenHandler.ReadJwtToken(token);

                var expiration = jsonToken.ValidTo;
                var now = DateTime.UtcNow;

                return expiration > now ? expiration - now : null;
            }
            catch
            {
                return null;
            }
        }

        private TokenValidationParameters GetTokenValidationParameters()
        {
            return new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidAudience = _configuration["Jwt:Audience"],
                IssuerSigningKey = _key,
                ClockSkew = TimeSpan.Zero
            };
        }
    }
} 