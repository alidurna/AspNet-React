/**
 * IPasswordService Interface
 * 
 * Bu dosya, TaskFlow API'sinde şifre yönetimi işlemlerini tanımlayan
 * interface'i içerir. Şifre hash'leme, doğrulama, güvenlik kontrolü
 * ve güvenli şifre üretimi işlemlerini kapsar.
 * 
 * Ana İşlevler:
 * - Şifre hash'leme (BCrypt)
 * - Şifre doğrulama
 * - Şifre güvenlik kontrolü
 * - Güvenli şifre üretimi
 * - Password reset token üretimi
 * 
 * Password Hashing:
 * - HashPassword: Plain text'i hash'e çevirme
 * - VerifyPassword: Hash ile karşılaştırma
 * - BCrypt algoritması
 * - Salt otomatik ekleme
 * - Work factor ayarlanabilir
 * 
 * Password Validation:
 * - ValidatePassword: Güç kontrolü
 * - ValidatePasswordConfirmation: Eşleşme kontrolü
 * - Strength scoring (0-100)
 * - Detailed error messages
 * - Improvement suggestions
 * 
 * Security Rules:
 * - CheckPasswordSecurity: Güvenlik kontrolü
 * - IsCommonPassword: Yaygın şifre kontrolü
 * - Minimum length requirements
 * - Character type requirements
 * - Complexity validation
 * 
 * Password Generation:
 * - GenerateSecurePassword: Güvenli şifre üretimi
 * - GeneratePasswordResetToken: Reset token
 * - Configurable parameters
 * - Cryptographically secure
 * - Customizable requirements
 * 
 * Güvenlik Özellikleri:
 * - BCrypt hashing
 * - Salt generation
 * - Work factor optimization
 * - Timing attack protection
 * - Rainbow table resistance
 * 
 * Validation Rules:
 * - Minimum 8 karakter
 * - En az 1 büyük harf
 * - En az 1 küçük harf
 * - En az 1 rakam
 * - En az 1 özel karakter
 * - Yaygın şifre kontrolü
 * 
 * Password Strength Levels:
 * - VeryWeak: 0-20 puan
 * - Weak: 21-40 puan
 * - Medium: 41-60 puan
 * - Strong: 61-80 puan
 * - VeryStrong: 81-100 puan
 * 
 * Performance:
 * - Optimized hashing
 * - Efficient validation
 * - Memory management
 * - CPU usage optimization
 * 
 * Security Best Practices:
 * - Never store plain text
 * - Use strong algorithms
 * - Regular security audits
 * - Rate limiting
 * - Brute force protection
 * 
 * Error Handling:
 * - Validation errors
 * - Hashing failures
 * - Security violations
 * - Graceful degradation
 * 
 * Monitoring:
 * - Password strength metrics
 * - Security violation tracking
 * - Performance monitoring
 * - Usage analytics
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

namespace TaskFlow.API.Interfaces
{
    /// <summary>
    /// Password hashing ve validation işlemleri için service interface
    /// Güvenlik kritik operasyonları centralize etmek için kullanılır
    /// </summary>
    public interface IPasswordService
    {
        #region Password Hashing

        /// <summary>
        /// Plain text şifreyi güvenli hash'e çevirir
        /// BCrypt algoritması kullanır
        /// </summary>
        /// <param name="password">Plain text şifre</param>
        /// <returns>Hashed şifre</returns>
        string HashPassword(string password);

        /// <summary>
        /// Plain text şifreyi hash ile karşılaştırır
        /// </summary>
        /// <param name="password">Plain text şifre</param>
        /// <param name="hashedPassword">Database'den gelen hashed şifre</param>
        /// <returns>True: şifre doğru, False: şifre yanlış</returns>
        bool VerifyPassword(string password, string hashedPassword);

        #endregion

        #region Password Validation

        /// <summary>
        /// Şifrenin güçlü olup olmadığını kontrol eder
        /// </summary>
        /// <param name="password">Kontrol edilecek şifre</param>
        /// <returns>Validation sonucu ve mesajları</returns>
        PasswordValidationResult ValidatePassword(string password);

        /// <summary>
        /// Şifre ve confirm password'ün eşleşip eşleşmediğini kontrol eder
        /// </summary>
        /// <param name="password">Şifre</param>
        /// <param name="confirmPassword">Şifre tekrarı</param>
        /// <returns>True: eşleşiyor, False: eşleşmiyor</returns>
        bool ValidatePasswordConfirmation(string password, string confirmPassword);

        #endregion

        #region Password Security Rules

        /// <summary>
        /// Şifrenin minimum güvenlik gereksinimlerini karşılayıp karşılamadığını kontrol eder
        /// </summary>
        /// <param name="password">Kontrol edilecek şifre</param>
        /// <returns>Güvenlik kontrol sonucu</returns>
        PasswordSecurityCheckResult CheckPasswordSecurity(string password);

        /// <summary>
        /// Şifrenin yaygın (weak) şifreler listesinde olup olmadığını kontrol eder
        /// </summary>
        /// <param name="password">Kontrol edilecek şifre</param>
        /// <returns>True: yaygın şifre, False: yaygın değil</returns>
        bool IsCommonPassword(string password);

        #endregion

        #region Password Generation

        /// <summary>
        /// Güvenli random şifre üretir
        /// </summary>
        /// <param name="length">Şifre uzunluğu</param>
        /// <param name="includeSpecialChars">Özel karakter ekle</param>
        /// <param name="includeNumbers">Sayı ekle</param>
        /// <param name="includeUppercase">Büyük harf ekle</param>
        /// <param name="includeLowercase">Küçük harf ekle</param>
        /// <returns>Üretilen güvenli şifre</returns>
        string GenerateSecurePassword(
            int length = 12,
            bool includeSpecialChars = true,
            bool includeNumbers = true,
            bool includeUppercase = true,
            bool includeLowercase = true);

        /// <summary>
        /// Password reset token üretir
        /// </summary>
        /// <returns>Güvenli reset token</returns>
        string GeneratePasswordResetToken();

        #endregion
    }

    /// <summary>
    /// Şifre validation sonucu
    /// </summary>
    public class PasswordValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
        public int StrengthScore { get; set; } // 0-100 arası güç skoru
        public PasswordStrength Strength { get; set; }
        public List<string> Suggestions { get; set; } = new();
    }

    /// <summary>
    /// Şifre güvenlik kontrol sonucu
    /// </summary>
    public class PasswordSecurityCheckResult
    {
        public bool IsSecure { get; set; }
        public bool HasMinimumLength { get; set; }
        public bool HasUppercase { get; set; }
        public bool HasLowercase { get; set; }
        public bool HasNumbers { get; set; }
        public bool HasSpecialChars { get; set; }
        public bool IsNotCommon { get; set; }
        public List<string> FailedRules { get; set; } = new();
        public List<string> SecurityTips { get; set; } = new();
    }

    /// <summary>
    /// Şifre güç seviyeleri
    /// </summary>
    public enum PasswordStrength
    {
        VeryWeak = 0,
        Weak = 1,
        Medium = 2,
        Strong = 3,
        VeryStrong = 4
    }
} 