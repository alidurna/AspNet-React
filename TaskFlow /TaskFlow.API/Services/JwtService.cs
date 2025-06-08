using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using TaskFlow.API.Models;

namespace TaskFlow.API.Services
{
    /// <summary>
    /// JWT (JSON Web Token) işlemleri için concrete servis implementasyonu
    /// IConfiguration'dan ayarları okur ve JWT operations gerçekleştirir
    /// </summary>
    /// <remarks>
    /// Bu servis JWT token'ların oluşturulması, doğrulanması ve yönetiminden sorumludur.
    /// Microsoft.IdentityModel.Tokens kütüphanesini kullanarak güvenli token işlemleri yapar.
    /// Scoped lifetime ile register edilmelidir çünkü HTTP context'e bağımlıdır.
    /// </remarks>
    public class JwtService : IJwtService
    {
        #region Private Fields
        
        /// <summary>
        /// Uygulama konfigürasyon ayarlarına erişim için kullanılır
        /// JWT secret key, issuer, audience gibi bilgileri okur
        /// </summary>
        private readonly IConfiguration _configuration;

        /// <summary>
        /// JWT token imzalama için kullanılan gizli anahtar
        /// appsettings.json'dan okunur ve SymmetricSecurityKey'e dönüştürülür
        /// </summary>
        private readonly SymmetricSecurityKey _key;

        /// <summary>
        /// JWT token'ın kim tarafından oluşturulduğunu belirten issuer
        /// Genellikle uygulama adı veya domain adı kullanılır
        /// </summary>
        private readonly string _issuer;

        /// <summary>
        /// JWT token'ın hangi audience için oluşturulduğunu belirten audience
        /// Token'ı kullanacak client uygulamaların identifier'ı
        /// </summary>
        private readonly string _audience;

        /// <summary>
        /// Access token'ın geçerlilik süresi (dakika)
        /// Güvenlik ve kullanıcı deneyimi arasında denge kurulmalı
        /// </summary>
        private readonly int _accessTokenExpirationMinutes;

        /// <summary>
        /// Refresh token'ın geçerlilik süresi (gün)
        /// Access token'dan çok daha uzun sürelidir
        /// </summary>
        private readonly int _refreshTokenExpirationDays;

        #endregion

        #region Constructor

        /// <summary>
        /// JwtService constructor'ı
        /// IConfiguration dependency injection ile alınır ve JWT ayarları initialize edilir
        /// </summary>
        /// <param name="configuration">Uygulama konfigürasyon servisi</param>
        /// <exception cref="ArgumentNullException">Configuration null ise fırlatılır</exception>
        /// <exception cref="InvalidOperationException">JWT ayarları eksik ise fırlatılır</exception>
        /// <remarks>
        /// Constructor'da tüm JWT ayarları okunur ve validate edilir.
        /// Eksik veya hatalı ayar durumunda exception fırlatılır.
        /// </remarks>
        public JwtService(IConfiguration configuration)
        {
            // Dependency injection ile gelen configuration'ı store et
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));

            // JWT ayarlarını configuration'dan oku ve validate et
            var jwtSecret = _configuration["Jwt:Secret"] 
                ?? throw new InvalidOperationException("JWT Secret key bulunamadı");
            
            var jwtIssuer = _configuration["Jwt:Issuer"] 
                ?? throw new InvalidOperationException("JWT Issuer bulunamadı");
            
            var jwtAudience = _configuration["Jwt:Audience"] 
                ?? throw new InvalidOperationException("JWT Audience bulunamadı");

            // Secret key'i SymmetricSecurityKey'e dönüştür
            // UTF8 encoding kullanarak byte array'e çevir
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
            _issuer = jwtIssuer;
            _audience = jwtAudience;

            // Token geçerlilik sürelerini oku, default değerler ata
            _accessTokenExpirationMinutes = int.TryParse(_configuration["Jwt:AccessTokenExpirationMinutes"], out var accessExp) 
                ? accessExp : 60; // Default: 60 dakika
            
            _refreshTokenExpirationDays = int.TryParse(_configuration["Jwt:RefreshTokenExpirationDays"], out var refreshExp) 
                ? refreshExp : 7; // Default: 7 gün
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Verilen kullanıcı için JWT access token oluşturur
        /// Kullanıcı bilgilerini claim olarak token içinde saklar
        /// </summary>
        /// <param name="user">Token oluşturulacak kullanıcı entity'si</param>
        /// <returns>Oluşturulan JWT token string'i</returns>
        /// <exception cref="ArgumentNullException">User null ise fırlatılır</exception>
        public string GenerateToken(User user)
        {
            // Input validation - user null kontrolü
            if (user == null)
                throw new ArgumentNullException(nameof(user), "Kullanıcı bilgisi null olamaz");

            // JWT claims oluştur - token içinde saklanacak kullanıcı bilgileri
            var claims = new List<Claim>
            {
                // Standard JWT claims
                new(JwtRegisteredClaimNames.Sub, user.Id.ToString()), // Subject - kullanıcı ID
                new(JwtRegisteredClaimNames.Email, user.Email),        // Email claim
                new(JwtRegisteredClaimNames.GivenName, user.FirstName), // Ad
                new(JwtRegisteredClaimNames.FamilyName, user.LastName), // Soyad
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Token benzersiz ID
                new(JwtRegisteredClaimNames.Iat, 
                    new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString(), 
                    ClaimValueTypes.Integer64), // Token oluşturulma zamanı

                // Custom claims - uygulama özel claim'leri
                new("user_id", user.Id.ToString()),
                new("full_name", user.FullName),
                new("is_active", user.IsActive.ToString().ToLower())
            };

            // Telefon numarası varsa claim olarak ekle
            if (!string.IsNullOrWhiteSpace(user.PhoneNumber))
            {
                claims.Add(new Claim("phone_number", user.PhoneNumber));
            }

            // JWT token descriptor oluştur - token'ın özelliklerini tanımlar
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                // Claim'leri ClaimsIdentity olarak ata
                Subject = new ClaimsIdentity(claims),
                
                // Token geçerlilik süresi - şu andan itibaren X dakika
                Expires = DateTime.UtcNow.AddMinutes(_accessTokenExpirationMinutes),
                
                // Token imzalama bilgileri - HMAC SHA256 algoritması
                SigningCredentials = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256Signature),
                
                // Token kim tarafından oluşturuldu
                Issuer = _issuer,
                
                // Token hangi audience için oluşturuldu
                Audience = _audience,
                
                // Token'ın ne zaman geçerli olmaya başladığı
                NotBefore = DateTime.UtcNow,
                
                // Token'ın oluşturulma zamanı
                IssuedAt = DateTime.UtcNow
            };

            // JWT token handler oluştur ve token'ı generate et
            var tokenHandler = new JwtSecurityTokenHandler();
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            
            // Security token'ı string'e serialize et
            var tokenString = tokenHandler.WriteToken(securityToken);

            return tokenString;
        }

        /// <summary>
        /// Verilen kullanıcı için refresh token oluşturur
        /// Cryptographically secure random string generate eder
        /// </summary>
        /// <param name="user">Refresh token oluşturulacak kullanıcı</param>
        /// <returns>Base64 encoded refresh token</returns>
        public string GenerateRefreshToken(User user)
        {
            // Input validation
            if (user == null)
                throw new ArgumentNullException(nameof(user), "Kullanıcı bilgisi null olamaz");

            // Cryptographically secure random bytes oluştur
            var randomBytes = new byte[64]; // 64 byte = 512 bit güvenlik
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            
            // Random bytes'ı Base64 string'e çevir
            var refreshToken = Convert.ToBase64String(randomBytes);
            
            return refreshToken;
        }

        /// <summary>
        /// JWT token'dan kullanıcı ID'sini çıkarır
        /// Token validation yaparak güvenli erişim sağlar
        /// </summary>
        /// <param name="token">Decode edilecek JWT token</param>
        /// <returns>Kullanıcı ID'si veya null</returns>
        public int? GetUserIdFromToken(string token)
        {
            try
            {
                // Input validation
                if (string.IsNullOrWhiteSpace(token))
                    return null;

                // Token validation parameters oluştur
                var validationParameters = GetTokenValidationParameters();
                
                // JWT token handler ile token'ı validate et
                var tokenHandler = new JwtSecurityTokenHandler();
                var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);
                
                // Subject claim'inden user ID'yi al
                var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier) 
                    ?? principal.FindFirst(JwtRegisteredClaimNames.Sub)
                    ?? principal.FindFirst("user_id");
                
                // User ID'yi integer'a çevir
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
                {
                    return userId;
                }
                
                return null;
            }
            catch (SecurityTokenException)
            {
                // Token validation hatası - token geçersiz
                return null;
            }
            catch (Exception)
            {
                // Genel hata - log edilebilir
                return null;
            }
        }

        /// <summary>
        /// JWT token'ın geçerli olup olmadığını kontrol eder
        /// </summary>
        /// <param name="token">Kontrol edilecek token</param>
        /// <returns>Token geçerli ise true</returns>
        public bool IsTokenValid(string token)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(token))
                    return false;

                var validationParameters = GetTokenValidationParameters();
                var tokenHandler = new JwtSecurityTokenHandler();
                
                // Token validation - exception fırlatırsa geçersiz
                tokenHandler.ValidateToken(token, validationParameters, out _);
                
                return true;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// JWT token'dan tüm claim'leri çıkarır
        /// </summary>
        /// <param name="token">Claim'leri çıkarılacak token</param>
        /// <returns>Claim dictionary'si</returns>
        public Dictionary<string, string> GetTokenClaims(string token)
        {
            var claims = new Dictionary<string, string>();
            
            try
            {
                if (string.IsNullOrWhiteSpace(token))
                    return claims;

                var validationParameters = GetTokenValidationParameters();
                var tokenHandler = new JwtSecurityTokenHandler();
                var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
                
                // Tüm claim'leri dictionary'e ekle
                foreach (var claim in principal.Claims)
                {
                    claims[claim.Type] = claim.Value;
                }
            }
            catch
            {
                // Hata durumunda boş dictionary döndür
            }
            
            return claims;
        }

        /// <summary>
        /// Token'ın kalan geçerlilik süresini hesaplar
        /// </summary>
        /// <param name="token">Kontrol edilecek token</param>
        /// <returns>Kalan süre veya null</returns>
        public TimeSpan? GetTokenRemainingTime(string token)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(token))
                    return null;

                var tokenHandler = new JwtSecurityTokenHandler();
                var jsonToken = tokenHandler.ReadJwtToken(token);
                
                // Token'ın expiration time'ını al
                var expiration = jsonToken.ValidTo;
                var now = DateTime.UtcNow;
                
                // Eğer token henüz expire olmadıysa kalan süreyi hesapla
                if (expiration > now)
                {
                    return expiration - now;
                }
                
                return null; // Token expire olmuş
            }
            catch
            {
                return null;
            }
        }

        #endregion

        #region Private Helper Methods

        /// <summary>
        /// JWT token validation için gerekli parametreleri oluşturur
        /// Tüm JWT servis methodları tarafından kullanılır
        /// </summary>
        /// <returns>Token validation parameters</returns>
        /// <remarks>
        /// Bu method JWT token validation'ı için gerekli tüm parametreleri
        /// merkezi bir yerden yönetir. Validation kuralları değiştiğinde
        /// sadece burası güncellenir.
        /// </remarks>
        private TokenValidationParameters GetTokenValidationParameters()
        {
            return new TokenValidationParameters
            {
                // Issuer validation - token'ı kim oluşturdu kontrolü
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                
                // Audience validation - token kim için oluşturuldu kontrolü  
                ValidateAudience = true,
                ValidAudience = _audience,
                
                // Lifetime validation - token'ın süresi dolmuş mu kontrolü
                ValidateLifetime = true,
                
                // Signing key validation - token imzası doğru mu kontrolü
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = _key,
                
                // Clock skew - server saatleri arasındaki fark toleransı
                ClockSkew = TimeSpan.Zero, // Sıfır tolerans - kesin zaman kontrolü
                
                // Token'ın şu anda geçerli olup olmadığını kontrol et
                RequireExpirationTime = true,
                
                // Signing key null olamaz
                RequireSignedTokens = true
            };
        }

        #endregion
    }
} 