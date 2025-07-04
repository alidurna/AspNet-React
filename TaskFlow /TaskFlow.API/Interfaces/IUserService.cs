using TaskFlow.API.DTOs;
using TaskFlow.API.Models;

namespace TaskFlow.API.Interfaces
{
    /// <summary>
    /// User yönetimi ve authentication işlemleri için service interface
    /// Business logic'i controller'dan ayırmak ve test edilebilirlik sağlamak için kullanılır
    /// </summary>
    public interface IUserService
    {
        #region Authentication Operations

        /// <summary>
        /// Yeni kullanıcı kaydı oluşturur
        /// Email benzersizlik kontrolü yapar ve şifre hash'ler
        /// </summary>
        /// <param name="registerDto">Kullanıcı kayıt bilgileri</param>
        /// <returns>Authentication response with JWT token</returns>
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);

        /// <summary>
        /// Kullanıcı girişi yapar
        /// Email/password doğrulaması ve JWT token üretimi
        /// </summary>
        /// <param name="loginDto">Giriş bilgileri</param>
        /// <returns>Authentication response with JWT token</returns>
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);

        /// <summary>
        /// Email adresinin zaten kayıtlı olup olmadığını kontrol eder
        /// </summary>
        /// <param name="email">Kontrol edilecek email</param>
        /// <returns>True: email kayıtlı, False: email müsait</returns>
        Task<bool> IsEmailExistsAsync(string email);

        #endregion

        #region User Profile Operations

        /// <summary>
        /// Kullanıcıyı ID'sine göre getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <returns>UserDto veya null</returns>
        Task<UserDto?> GetUserByIdAsync(int userId);

        /// <summary>
        /// Kullanıcıyı email'ine göre getirir
        /// </summary>
        /// <param name="email">Email adresi</param>
        /// <returns>User entity veya null</returns>
        Task<User?> GetUserByEmailAsync(string email);

        /// <summary>
        /// Kullanıcı profil bilgilerini günceller
        /// </summary>
        /// <param name="userId">Güncellenecek kullanıcı ID</param>
        /// <param name="updateDto">Güncelleme bilgileri</param>
        /// <returns>Güncellenmiş UserDto</returns>
        Task<UserDto> UpdateUserProfileAsync(int userId, UpdateProfileDto updateDto);

        /// <summary>
        /// Kullanıcının aktif olup olmadığını kontrol eder
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <returns>True: aktif, False: pasif</returns>
        Task<bool> IsUserActiveAsync(int userId);

        /// <summary>
        /// Kullanıcının şifresini değiştirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="changePasswordDto">Şifre değiştirme bilgileri</param>
        /// <returns>Başarı durumu</returns>
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);

        /// <summary>
        /// Şifre sıfırlama isteği gönderir
        /// </summary>
        /// <param name="passwordResetRequestDto">Şifre sıfırlama istek bilgileri</param>
        /// <returns>Başarı durumu</returns>
        Task<bool> RequestPasswordResetAsync(PasswordResetRequestDto passwordResetRequestDto);

        /// <summary>
        /// Şifre sıfırlama işlemini gerçekleştirir
        /// </summary>
        /// <param name="passwordResetDto">Şifre sıfırlama bilgileri</param>
        /// <returns>Başarı durumu</returns>
        Task<bool> ResetPasswordAsync(PasswordResetDto passwordResetDto);

        /// <summary>
        /// E-posta doğrulama isteği gönderir
        /// </summary>
        /// <param name="emailVerificationRequestDto">E-posta doğrulama istek bilgileri</param>
        /// <returns>Başarı durumu</returns>
        Task<bool> RequestEmailVerificationAsync(EmailVerificationRequestDto emailVerificationRequestDto);

        /// <summary>
        /// E-posta doğrulama işlemini gerçekleştirir
        /// </summary>
        /// <param name="emailVerificationDto">E-posta doğrulama bilgileri</param>
        /// <returns>Başarı durumu</returns>
        Task<bool> VerifyEmailAsync(EmailVerificationDto emailVerificationDto);

        /// <summary>
        /// Access token'ı yeniler
        /// </summary>
        /// <param name="tokenRefreshRequestDto">Token yenileme istek bilgileri</param>
        /// <returns>Yeni token bilgileri</returns>
        Task<TokenRefreshResponseDto> RefreshTokenAsync(TokenRefreshRequestDto tokenRefreshRequestDto);

        /// <summary>
        /// Kullanıcının refresh token'ını iptal eder
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <returns>Başarı durumu</returns>
        Task<bool> RevokeRefreshTokenAsync(int userId);

        /// <summary>
        /// Kullanıcının tüm aktif oturumlarını sonlandırır
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <returns>Başarı durumu</returns>
        Task<bool> LogoutAllSessionsAsync(int userId);

        #endregion

        #region User Statistics

        /// <summary>
        /// Kullanıcının genel istatistiklerini getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <returns>Kullanıcı istatistikleri</returns>
        Task<UserStatsDto> GetUserStatsAsync(int userId);

        #endregion

        #region Helper Methods

        /// <summary>
        /// User entity'sini UserDto'ya çevirir
        /// </summary>
        /// <param name="user">User entity</param>
        /// <returns>UserDto</returns>
        UserDto MapToDto(User user);

        #endregion
    }


} 