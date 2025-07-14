/**
 * IUserService Interface
 * 
 * Bu dosya, kullanıcı yönetimi işlemlerini tanımlayan interface'i içerir.
 * Kullanıcı kayıt, giriş, profil yönetimi ve güvenlik işlemlerini
 * kapsayan kapsamlı bir servis sözleşmesi sağlar.
 * 
 * Ana İşlevler:
 * - Kullanıcı kayıt ve giriş işlemleri
 * - Profil yönetimi (görüntüleme, güncelleme)
 * - Şifre yönetimi (değiştirme, sıfırlama)
 * - Email doğrulama işlemleri
 * - Token yönetimi (refresh, revoke)
 * - Kullanıcı istatistikleri
 * - Oturum yönetimi
 * 
 * Güvenlik:
 * - JWT token tabanlı kimlik doğrulama
 * - Şifre hash'leme ve doğrulama
 * - Email doğrulama sistemi
 * - Refresh token yönetimi
 * - Oturum güvenliği
 * 
 * Validation:
 * - Input validation
 * - Business rule validation
 * - Data integrity checks
 * 
 * Error Handling:
 * - Comprehensive exception handling
 * - User-friendly error messages
 * - Logging and monitoring
 * 
 * Performance:
 * - Async/await pattern
 * - Efficient database queries
 * - Caching strategies
 * 
 * Sürdürülebilirlik:
 * - SOLID principles
 * - Dependency injection ready
 * - Testable design
 * - Clear separation of concerns
 * 
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

using TaskFlow.API.DTOs;

namespace TaskFlow.API.Interfaces
{
    public interface IUserService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<UserDto?> GetUserByIdAsync(int id);
        Task<UserProfileDto> GetUserProfileAsync(string userId);
        Task<UserProfileDto> UpdateProfileAsync(string userId, UpdateProfileDto model);
        Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto model);
        Task<UserStatsDto> GetUserStatsAsync(int userId);
        Task<bool> RequestPasswordResetAsync(PasswordResetRequestDto model);
        Task<bool> ResetPasswordAsync(PasswordResetDto model);
        Task<bool> RequestEmailVerificationAsync(EmailVerificationRequest model);
        Task<bool> VerifyEmailAsync(EmailVerification model);
        Task<TokenRefreshResponseDto> RefreshTokenAsync(TokenRefreshRequestDto model);
        Task<bool> RevokeRefreshTokenAsync(int userId);
        Task<bool> LogoutAllSessionsAsync(int userId);
    }
} 