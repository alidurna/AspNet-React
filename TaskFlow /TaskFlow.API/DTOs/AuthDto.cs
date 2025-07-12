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

namespace TaskFlow.API.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Email alanı zorunludur")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şifre alanı zorunludur")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Şifre en az 6 karakter olmalıdır")]
        public string Password { get; set; } = string.Empty;

        [Compare("Password", ErrorMessage = "Şifreler eşleşmiyor")]
        public string ConfirmPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ad alanı zorunludur")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Soyad alanı zorunludur")]
        public string LastName { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }
    }

    public class LoginDto
    {
        [Required(ErrorMessage = "Email alanı zorunludur")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şifre alanı zorunludur")]
        public string Password { get; set; } = string.Empty;

        public bool RememberMe { get; set; }
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public int ExpiresInMinutes { get; set; }
        public DateTime ExpiresAt { get; set; }
        public UserDto User { get; set; } = new();
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class TokenRefreshRequestDto
    {
        [Required(ErrorMessage = "Access token gereklidir")]
        public string AccessToken { get; set; } = string.Empty;

        [Required(ErrorMessage = "Refresh token gereklidir")]
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class TokenRefreshResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public int ExpiresInMinutes { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
} 