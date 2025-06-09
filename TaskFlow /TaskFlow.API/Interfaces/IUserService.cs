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

    /// <summary>
    /// Kullanıcı istatistikleri DTO'su
    /// </summary>
    public class UserStatsDto
    {
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int PendingTasks { get; set; }
        public int TotalCategories { get; set; }
        public DateTime LastLoginDate { get; set; }
        public DateTime RegistrationDate { get; set; }
        public decimal TaskCompletionRate { get; set; }
    }
} 