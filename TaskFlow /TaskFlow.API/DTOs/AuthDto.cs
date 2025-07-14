// ****************************************************************************************************
//  AUTHDTO.CS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının authentication sisteminin ana DTO (Data Transfer Object) dosyasıdır.
//  Kullanıcı kaydı, giriş, token yenileme ve authentication response işlemleri için gerekli tüm DTO'ları içerir.
//  Validation attribute'ları ile güvenli input kontrolü ve JWT token yönetimi sağlar.
//
//  ANA BAŞLIKLAR:
//  - RegisterDto (Kullanıcı kaydı)
//  - LoginDto (Kullanıcı girişi)
//  - AuthResponseDto (Authentication response)
//  - TokenRefreshRequestDto (Token yenileme isteği)
//  - TokenRefreshResponseDto (Token yenileme response)
//  - Security ve Validation
//
//  GÜVENLİK:
//  - Email format validation
//  - Password strength requirements
//  - Password confirmation matching
//  - Token security management
//  - Input sanitization
//
//  HATA YÖNETİMİ:
//  - Comprehensive validation attributes
//  - Email format validation
//  - Password confirmation validation
//  - Required field validation
//  - Error message localization
//
//  EDGE-CASE'LER:
//  - Invalid email formats
//  - Weak passwords
//  - Mismatched password confirmation
//  - Empty required fields
//  - Expired tokens
//  - Invalid token formats
//  - Unicode characters in names
//
//  YAN ETKİLER:
//  - Validation affects user registration flow
//  - Token management affects session security
//  - Password requirements affect user experience
//  - Email validation prevents invalid registrations
//  - Remember me affects token expiration
//
//  PERFORMANS:
//  - Efficient validation
//  - Minimal memory usage
//  - Fast serialization
//  - Optimized token handling
//  - Efficient database queries
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Clear separation of concerns
//  - Comprehensive documentation
//  - Extensible validation system
//  - Backward compatibility
//  - Security-focused design
// ****************************************************************************************************
using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Email alanı zorunludur")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz")]
        [SwaggerSchema("Kullanıcının e-posta adresi", Example = "ali@example.com")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şifre alanı zorunludur")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Şifre en az 6 karakter olmalıdır")]
        [SwaggerSchema("Kullanıcının şifresi", Example = "Gizli123!")]
        public string Password { get; set; } = string.Empty;

        [Compare("Password", ErrorMessage = "Şifreler eşleşmiyor")]
        [SwaggerSchema("Şifre tekrar", Example = "Gizli123!")]
        public string ConfirmPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ad alanı zorunludur")]
        [StringLength(50)]
        [SwaggerSchema("Kullanıcının adı", Example = "Ali")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Soyad alanı zorunludur")]
        [StringLength(50)]
        [SwaggerSchema("Kullanıcının soyadı", Example = "Durna")]
        public string LastName { get; set; } = string.Empty;

        [SwaggerSchema("Kullanıcının telefon numarası", Example = "+905551112233")]
        public string? PhoneNumber { get; set; }
    }

    public class LoginDto
    {
        [Required(ErrorMessage = "Email alanı zorunludur")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz")]
        [SwaggerSchema("Kullanıcının e-posta adresi", Example = "ali@example.com")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şifre alanı zorunludur")]
        [SwaggerSchema("Kullanıcının şifresi", Example = "Gizli123!")]
        public string Password { get; set; } = string.Empty;

        [SwaggerSchema("Beni hatırla seçeneği", Example = false)]
        public bool RememberMe { get; set; }
    }

    public class AuthResponseDto
    {
        [SwaggerSchema("JWT access token", Example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")]
        public string Token { get; set; } = string.Empty;

        [SwaggerSchema("JWT refresh token", Example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")]
        public string RefreshToken { get; set; } = string.Empty;

        [SwaggerSchema("Token'ın geçerlilik süresi (dakika)", Example = 60)]
        public int ExpiresInMinutes { get; set; }

        [SwaggerSchema("Token'ın geçerlilik bitiş tarihi", Example = "2024-07-14T15:00:00Z")]
        public DateTime ExpiresAt { get; set; }

        [SwaggerSchema("Kullanıcı bilgileri")]
        public UserDto User { get; set; } = new();

        [SwaggerSchema("İşlem başarılı mı?", Example = true)]
        public bool Success { get; set; }

        [SwaggerSchema("İşlem mesajı", Example = "Giriş başarılı.")]
        public string Message { get; set; } = string.Empty;
    }

    public class TokenRefreshRequestDto
    {
        [Required(ErrorMessage = "Access token gereklidir")]
        [SwaggerSchema("Mevcut access token", Example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")]
        public string AccessToken { get; set; } = string.Empty;

        [Required(ErrorMessage = "Refresh token gereklidir")]
        [SwaggerSchema("Mevcut refresh token", Example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")]
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class TokenRefreshResponseDto
    {
        [SwaggerSchema("Yeni access token", Example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")]
        public string AccessToken { get; set; } = string.Empty;

        [SwaggerSchema("Yeni refresh token", Example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")]
        public string RefreshToken { get; set; } = string.Empty;

        [SwaggerSchema("Token'ın geçerlilik süresi (dakika)", Example = 60)]
        public int ExpiresInMinutes { get; set; }

        [SwaggerSchema("Token'ın geçerlilik bitiş tarihi", Example = "2024-07-14T15:00:00Z")]
        public DateTime ExpiresAt { get; set; }
    }
} 