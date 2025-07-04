using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.DTOs
{
    /// <summary>
    /// Kullanıcı bilgilerini geri döndürmek için kullanılan DTO
    /// Şifre gibi hassas bilgileri içermez - güvenlik için ayrılmıştır
    /// </summary>
    /// <remarks>
    /// Bu DTO sadece okuma amaçlı kullanılır (READ operations)
    /// API response'larda kullanıcı bilgilerini güvenli şekilde döndürür
    /// </remarks>
    public class UserDto
    {
        /// <summary>
        /// Kullanıcının benzersiz ID'si
        /// Database'de otomatik oluşturulan primary key
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Kullanıcının email adresi
        /// Aynı zamanda login username'i olarak kullanılır
        /// </summary>
        /// <example>ali@example.com</example>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Kullanıcının adı
        /// Profil bilgilerinde görüntülenir
        /// </summary>
        /// <example>Ali</example>
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// Kullanıcının soyadı
        /// Profil bilgilerinde görüntülenir
        /// </summary>
        /// <example>Durna</example>
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// Kullanıcının telefon numarası
        /// İsteğe bağlı bilgi, bildirimler için kullanılabilir
        /// </summary>
        /// <example>+90 555 123 45 67</example>
        public string? PhoneNumber { get; set; }

        /// <summary>
        /// Kullanıcının hesap oluşturulma tarihi
        /// İstatistikler ve raporlarda kullanılır
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Kullanıcının profil bilgilerinin son güncellenme tarihi
        /// Audit trail için önemli
        /// </summary>
        public DateTime UpdatedAt { get; set; }

        /// <summary>
        /// Kullanıcının tam adını birleştiren computed property
        /// UI'da görüntüleme için kullanılır
        /// </summary>
        /// <returns>Ad + Soyad formatında string</returns>
        /// <example>Ali Durna</example>
        public string FullName => $"{FirstName} {LastName}".Trim();

        /// <summary>
        /// Kullanıcının hesabının aktif olup olmadığını belirten flag
        /// Pasif kullanıcılar sisteme giriş yapamaz
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Kullanıcının toplam görev sayısı
        /// AutoMapper tarafından hesaplanır
        /// </summary>
        public int TotalTaskCount { get; set; }

        /// <summary>
        /// Kullanıcının tamamladığı görev sayısı
        /// AutoMapper tarafından hesaplanır
        /// </summary>
        public int CompletedTaskCount { get; set; }

        /// <summary>
        /// Kullanıcının bekleyen görev sayısı
        /// AutoMapper tarafından hesaplanır
        /// </summary>
        public int PendingTaskCount { get; set; }
    }

    /// <summary>
    /// Yeni kullanıcı kaydı için kullanılan DTO
    /// Validation attribute'ları ile gelen verileri doğrular
    /// </summary>
    /// <remarks>
    /// Bu DTO sadece kullanıcı kaydı sırasında kullanılır
    /// Password field'ı içerir çünkü yeni hesap oluşturma işlemi
    /// </remarks>
    public class RegisterDto
    {
        /// <summary>
        /// Kayıt için gerekli email adresi
        /// Unique olmalı - aynı email ile birden çok hesap açılamaz
        /// </summary>
        [Required(ErrorMessage = "Email alanı zorunludur")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz")]
        [StringLength(100, ErrorMessage = "Email adresi 100 karakterden uzun olamaz")]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Kayıt için gerekli şifre
        /// Güvenlik kurallarına uygun olmalı
        /// </summary>
        [Required(ErrorMessage = "Şifre alanı zorunludur")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Şifre en az 6, en fazla 100 karakter olmalıdır")]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Şifre tekrar alanı
        /// Password ile aynı olmalı - client-side validation
        /// </summary>
        [Required(ErrorMessage = "Şifre tekrar alanı zorunludur")]
        [DataType(DataType.Password)]
        [Compare("Password", ErrorMessage = "Şifreler uyuşmuyor")]
        public string ConfirmPassword { get; set; } = string.Empty;

        /// <summary>
        /// Kullanıcının adı
        /// Profil oluşturma için gerekli
        /// </summary>
        [Required(ErrorMessage = "Ad alanı zorunludur")]
        [StringLength(50, ErrorMessage = "Ad 50 karakterden uzun olamaz")]
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// Kullanıcının soyadı
        /// Profil oluşturma için gerekli
        /// </summary>
        [Required(ErrorMessage = "Soyad alanı zorunludur")]
        [StringLength(50, ErrorMessage = "Soyad 50 karakterden uzun olamaz")]
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// İsteğe bağlı telefon numarası
        /// Validation ile format kontrolü yapılır
        /// </summary>
        [Phone(ErrorMessage = "Geçerli bir telefon numarası giriniz")]
        [StringLength(20, ErrorMessage = "Telefon numarası 20 karakterden uzun olamaz")]
        public string? PhoneNumber { get; set; }
    }

    /// <summary>
    /// Kullanıcı girişi için kullanılan DTO
    /// Minimal bilgi ile authentication yapar
    /// </summary>
    /// <remarks>
    /// Bu DTO sadece login işlemi için kullanılır
    /// Email ve password bilgisi yeterli
    /// </remarks>
    public class LoginDto
    {
        /// <summary>
        /// Giriş için email adresi
        /// Sistemde kayıtlı olmalı
        /// </summary>
        [Required(ErrorMessage = "Email alanı zorunludur")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz")]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Giriş için şifre
        /// Database'deki hash ile karşılaştırılır
        /// </summary>
        [Required(ErrorMessage = "Şifre alanı zorunludur")]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Beni hatırla seçeneği
        /// JWT token süresini uzatır (opsiyonel)
        /// </summary>
        public bool RememberMe { get; set; } = false;
    }

    /// <summary>
    /// Authentication işlemi sonucunda döndürülen DTO
    /// JWT token ve kullanıcı bilgilerini içerir
    /// </summary>
    /// <remarks>
    /// Başarılı login/register işlemi sonrasında client'a gönderilir
    /// Client bu bilgileri storage'da saklar ve sonraki isteklerde kullanır
    /// </remarks>
    public class AuthResponseDto
    {
        /// <summary>
        /// JWT access token
        /// API isteklerinde Authorization header'ında kullanılır
        /// </summary>
        /// <example>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</example>
        public string Token { get; set; } = string.Empty;

        /// <summary>
        /// JWT refresh token
        /// Access token yenileme için kullanılır
        /// </summary>
        public string RefreshToken { get; set; } = string.Empty;

        /// <summary>
        /// Token'ın geçerlilik süresi (dakika)
        /// Client-side'da token yenileme için kullanılır
        /// </summary>
        /// <example>60</example>
        public int ExpiresInMinutes { get; set; }

        /// <summary>
        /// Token'ın son kullanma tarihi
        /// Client-side'da kontrol için kullanılır
        /// </summary>
        public DateTime ExpiresAt { get; set; }

        /// <summary>
        /// Giriş yapan kullanıcının detay bilgileri
        /// Profile sayfasında ve header'da görüntülenir
        /// </summary>
        public UserDto User { get; set; } = new();

        /// <summary>
        /// Authentication işleminin başarılı olup olmadığını belirten flag
        /// Client-side'da response handling için kullanılır
        /// </summary>
        public bool Success { get; set; } = true;

        /// <summary>
        /// Authentication işlemi hakkında mesaj
        /// Başarılı girişlerde "Hoş geldiniz" gibi mesajlar
        /// </summary>
        /// <example>Giriş başarılı, hoş geldiniz Ali Durna!</example>
        public string Message { get; set; } = string.Empty;
    }

    /// <summary>
    /// Kullanıcı profil güncelleme için kullanılan DTO
    /// Password güncellemesi ayrı endpoint'te yapılır
    /// </summary>
    /// <remarks>
    /// Bu DTO sadece profil bilgilerini güncellemek için kullanılır
    /// Şifre değişikliği için ayrı ChangePasswordDto kullanılacak
    /// </remarks>
    public class UpdateProfileDto
    {
        /// <summary>
        /// Güncellenecek ad bilgisi
        /// Boş olamaz
        /// </summary>
        [Required(ErrorMessage = "Ad alanı zorunludur")]
        [StringLength(50, ErrorMessage = "Ad 50 karakterden uzun olamaz")]
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// Güncellenecek soyad bilgisi
        /// Boş olamaz
        /// </summary>
        [Required(ErrorMessage = "Soyad alanı zorunludur")]
        [StringLength(50, ErrorMessage = "Soyad 50 karakterden uzun olamaz")]
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// İsteğe bağlı telefon numarası güncellemesi
        /// Format kontrolü yapılır
        /// </summary>
        [Phone(ErrorMessage = "Geçerli bir telefon numarası giriniz")]
        [StringLength(20, ErrorMessage = "Telefon numarası 20 karakterden uzun olamaz")]
        public string? PhoneNumber { get; set; }
    }

    /// <summary>
    /// Kullanıcı şifre değiştirme işlemi için kullanılan DTO
    /// Güvenlik için mevcut şifre doğrulaması gerektirir
    /// </summary>
    /// <remarks>
    /// Bu DTO sadece şifre değiştirme işlemi için kullanılır
    /// Mevcut şifre, yeni şifre ve onay alanlarını içerir
    /// </remarks>
    public class ChangePasswordDto
    {
        /// <summary>
        /// Kullanıcının mevcut şifresi
        /// Güvenlik için doğrulanması gerekir
        /// </summary>
        [Required(ErrorMessage = "Mevcut şifre alanı zorunludur")]
        [DataType(DataType.Password)]
        public string CurrentPassword { get; set; } = string.Empty;

        /// <summary>
        /// Kullanıcının yeni şifresi
        /// Güvenlik kurallarına uygun olmalı
        /// </summary>
        [Required(ErrorMessage = "Yeni şifre alanı zorunludur")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Şifre en az 6, en fazla 100 karakter olmalıdır")]
        [DataType(DataType.Password)]
        public string NewPassword { get; set; } = string.Empty;

        /// <summary>
        /// Yeni şifre tekrar alanı
        /// NewPassword ile aynı olmalı
        /// </summary>
        [Required(ErrorMessage = "Yeni şifre tekrar alanı zorunludur")]
        [DataType(DataType.Password)]
        [Compare("NewPassword", ErrorMessage = "Yeni şifreler uyuşmuyor")]
        public string ConfirmNewPassword { get; set; } = string.Empty;
    }

    /// <summary>
    /// Kullanıcı istatistikleri için kullanılan DTO
    /// Dashboard ve raporlama için kullanılır
    /// </summary>
    /// <remarks>
    /// Bu DTO kullanıcının görev istatistiklerini içerir
    /// Performance tracking ve analytics için önemli
    /// </remarks>
    public class UserStatsDto
    {
        /// <summary>
        /// Kullanıcının toplam görev sayısı
        /// Aktif ve tamamlanmış görevlerin toplamı
        /// </summary>
        public int TotalTasks { get; set; }

        /// <summary>
        /// Tamamlanmış görev sayısı
        /// Başarı oranı hesaplama için kullanılır
        /// </summary>
        public int CompletedTasks { get; set; }

        /// <summary>
        /// Bekleyen görev sayısı
        /// Aktif iş yükü göstergesi
        /// </summary>
        public int PendingTasks { get; set; }

        /// <summary>
        /// Devam eden görev sayısı
        /// Güncel çalışma durumu
        /// </summary>
        public int InProgressTasks { get; set; }

        /// <summary>
        /// Görev tamamlama oranı (yüzde)
        /// Performance metriği olarak kullanılır
        /// </summary>
        public double TaskCompletionRate { get; set; }

        /// <summary>
        /// Ortalama görev tamamlama süresi (gün)
        /// Efficiency metriği
        /// </summary>
        public double AverageCompletionDays { get; set; }

        /// <summary>
        /// Bu ay tamamlanan görev sayısı
        /// Aylık performans takibi
        /// </summary>
        public int TasksCompletedThisMonth { get; set; }

        /// <summary>
        /// Bu hafta tamamlanan görev sayısı
        /// Haftalık performans takibi
        /// </summary>
        public int TasksCompletedThisWeek { get; set; }
    }

    /// <summary>
    /// Password reset request DTO'su
    /// Kullanıcının şifre sıfırlama isteği için
    /// </summary>
    public class PasswordResetRequestDto
    {
        /// <summary>
        /// Şifre sıfırlama isteği yapılan email adresi
        /// </summary>
        [Required(ErrorMessage = "Email adresi gereklidir")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz")]
        public string Email { get; set; } = string.Empty;
    }

    /// <summary>
    /// Password reset DTO'su
    /// Şifre sıfırlama işlemi için
    /// </summary>
    public class PasswordResetDto
    {
        /// <summary>
        /// Şifre sıfırlama token'ı
        /// </summary>
        [Required(ErrorMessage = "Reset token gereklidir")]
        public string Token { get; set; } = string.Empty;

        /// <summary>
        /// Yeni şifre
        /// </summary>
        [Required(ErrorMessage = "Yeni şifre gereklidir")]
        [MinLength(8, ErrorMessage = "Şifre en az 8 karakter olmalıdır")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]", 
            ErrorMessage = "Şifre en az 1 küçük harf, 1 büyük harf, 1 rakam ve 1 özel karakter içermelidir")]
        public string NewPassword { get; set; } = string.Empty;

        /// <summary>
        /// Yeni şifre tekrarı
        /// </summary>
        [Required(ErrorMessage = "Şifre tekrarı gereklidir")]
        [Compare("NewPassword", ErrorMessage = "Şifreler eşleşmiyor")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    /// <summary>
    /// Email verification request DTO'su
    /// Email doğrulama isteği için
    /// </summary>
    public class EmailVerificationRequestDto
    {
        /// <summary>
        /// Doğrulama isteği yapılan email adresi
        /// </summary>
        [Required(ErrorMessage = "Email adresi gereklidir")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz")]
        public string Email { get; set; } = string.Empty;
    }

    /// <summary>
    /// Email verification DTO'su
    /// Email doğrulama işlemi için
    /// </summary>
    public class EmailVerificationDto
    {
        /// <summary>
        /// Email doğrulama token'ı
        /// </summary>
        [Required(ErrorMessage = "Verification token gereklidir")]
        public string Token { get; set; } = string.Empty;

        /// <summary>
        /// Doğrulanacak email adresi
        /// </summary>
        [Required(ErrorMessage = "Email adresi gereklidir")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz")]
        public string Email { get; set; } = string.Empty;
    }

    /// <summary>
    /// Token refresh request DTO'su
    /// Access token yenileme isteği için
    /// </summary>
    public class TokenRefreshRequestDto
    {
        /// <summary>
        /// Yenilenecek access token
        /// </summary>
        [Required(ErrorMessage = "Access token gereklidir")]
        public string AccessToken { get; set; } = string.Empty;

        /// <summary>
        /// Refresh token
        /// </summary>
        [Required(ErrorMessage = "Refresh token gereklidir")]
        public string RefreshToken { get; set; } = string.Empty;
    }

    /// <summary>
    /// Token refresh response DTO'su
    /// Yenilenmiş token bilgileri için
    /// </summary>
    public class TokenRefreshResponseDto
    {
        /// <summary>
        /// Yeni access token
        /// </summary>
        public string AccessToken { get; set; } = string.Empty;

        /// <summary>
        /// Yeni refresh token
        /// </summary>
        public string RefreshToken { get; set; } = string.Empty;

        /// <summary>
        /// Token geçerlilik süresi (dakika)
        /// </summary>
        public int ExpiresInMinutes { get; set; }

        /// <summary>
        /// Token son geçerlilik tarihi
        /// </summary>
        public DateTime ExpiresAt { get; set; }
    }
} 