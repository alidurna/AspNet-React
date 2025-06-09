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