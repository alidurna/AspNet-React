/*
 * User.cs - Kullanıcı Model Sınıfı
 * ================================
 * 
 * Bu sınıf TaskFlow uygulamasındaki kullanıcıları temsil eder.
 * Entity Framework Core tarafından veritabanında 'Users' tablosuna çevrilecektir.
 * 
 * ÖNEMLİ KAVRAMLAR:
 * ================
 * - Entity: Veritabanındaki bir tabloyu temsil eden C# sınıfı
 * - Primary Key: Her kayıdı benzersiz tanımlayan alan (burada Id)
 * - Navigation Properties: İlişkili tablolara referanslar (burada Tasks)
 * - Data Annotations: Veritabanı kısıtlamalarını tanımlayan özellikler
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskFlow.API.Models;

/// <summary>
/// Kullanıcı entity sınıfı - Authentication ve Task ownership için
/// Bu sınıf veritabanında "Users" tablosuna karşılık gelir
/// </summary>
public class User
{
    // ===== PRIMARY KEY =====
    /// <summary>
    /// Kullanıcının benzersiz kimliği (Primary Key)
    /// Convention: "Id" isimli property otomatik olarak PK olur
    /// Identity: Veritabanı tarafından otomatik artan değer
    /// </summary>
    [Key] // Açık olarak Primary Key belirtiyoruz (opsiyonel - convention yeterli)
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // Auto-increment
    public int Id { get; set; }

    // ===== REQUIRED FIELDS (ZORUNLU ALANLAR) =====
    
    /// <summary>
    /// Kullanıcının adı
    /// Required: Null olamaz, boş string olamaz
    /// MaxLength: Maksimum 100 karakter (veritabanı optimizasyonu)
    /// </summary>
    [Required(ErrorMessage = "Kullanıcı adı zorunludur")]
    [MaxLength(100, ErrorMessage = "Kullanıcı adı en fazla 100 karakter olabilir")]
    [Display(Name = "Ad")]
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Kullanıcının soyadı
    /// Required: Zorunlu alan
    /// MaxLength: Performans ve tutarlılık için sınırlı
    /// </summary>
    [Required(ErrorMessage = "Kullanıcı soyadı zorunludur")]
    [MaxLength(100, ErrorMessage = "Kullanıcı soyadı en fazla 100 karakter olabilir")]
    [Display(Name = "Soyad")]
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Kullanıcının e-posta adresi (Login için kullanılacak)
    /// Required: Authentication için zorunlu
    /// EmailAddress: Geçerli e-posta formatı kontrolü
    /// Unique: Veritabanında benzersiz olmalı (DbContext'te yapılandırılacak)
    /// </summary>
    [Required(ErrorMessage = "E-posta adresi zorunludur")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz")]
    [MaxLength(256, ErrorMessage = "E-posta adresi en fazla 256 karakter olabilir")]
    [Display(Name = "E-posta")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Kullanıcının şifre hash'i
    /// Required: Authentication için zorunlu
    /// ÖNEMLİ: Asla plain text şifre saklamayız!
    /// Bu alan bcrypt, scrypt veya benzer hash algoritması sonucunu tutar
    /// </summary>
    [Required(ErrorMessage = "Şifre zorunludur")]
    [MaxLength(256, ErrorMessage = "Şifre hash'i en fazla 256 karakter olabilir")]
    public string PasswordHash { get; set; } = string.Empty;

    // ===== OPTIONAL FIELDS (OPSİYONEL ALANLAR) =====

    /// <summary>
    /// Kullanıcının profil resmi URL'si
    /// Nullable: İsteğe bağlı alan
    /// Kullanıcı profil resmi yüklemezse null kalabilir
    /// </summary>
    [MaxLength(500, ErrorMessage = "Profil resmi URL'si en fazla 500 karakter olabilir")]
    [Display(Name = "Profil Resmi")]
    public string? ProfileImageUrl { get; set; }

    /// <summary>
    /// Kullanıcının telefon numarası
    /// Nullable: İsteğe bağlı alan
    /// Phone: Telefon numarası format kontrolü
    /// </summary>
    [Phone(ErrorMessage = "Geçerli bir telefon numarası giriniz")]
    [MaxLength(20, ErrorMessage = "Telefon numarası en fazla 20 karakter olabilir")]
    [Display(Name = "Telefon Numarası")]
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Kullanıcının kendi hakkında yazdığı açıklama
    /// Nullable: İsteğe bağlı
    /// MaxLength: Uzun açıklamalara izin veriyoruz
    /// </summary>
    [MaxLength(1000, ErrorMessage = "Açıklama en fazla 1000 karakter olabilir")]
    [Display(Name = "Hakkımda")]
    public string? Bio { get; set; }

    // ===== AUDIT FIELDS (DENETİM ALANLARI) =====

    /// <summary>
    /// Kullanıcı hesabının oluşturulma tarihi
    /// Default: DateTime.UtcNow (UTC timezone kullanıyoruz)
    /// DatabaseGenerated: Veritabanı tarafından otomatik set edilir
    /// </summary>
    [Display(Name = "Kayıt Tarihi")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Kullanıcı bilgilerinin son güncellenme tarihi
    /// Her update'te bu alan güncellenir
    /// SaveChanges'de otomatik güncellenecek (DbContext'te yapılandırılacak)
    /// </summary>
    [Display(Name = "Son Güncelleme")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Kullanıcının hesabının aktif olup olmadığı
    /// False: Kullanıcı hesabı deaktif (giriş yapamaz)
    /// True: Aktif hesap (varsayılan)
    /// Soft delete için de kullanılabilir
    /// </summary>
    [Display(Name = "Aktif")]
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Kullanıcının e-posta adresini doğrulayıp doğrulamadığı
    /// False: E-posta doğrulanmamış
    /// True: E-posta doğrulanmış
    /// Registration flow'da kullanılacak
    /// </summary>
    [Display(Name = "E-posta Doğrulandı")]
    public bool IsEmailVerified { get; set; } = false;

    /// <summary>
    /// E-posta doğrulama token'ı
    /// E-posta doğrulama için kullanılır
    /// </summary>
    [MaxLength(500, ErrorMessage = "E-posta doğrulama token'ı en fazla 500 karakter olabilir")]
    [Display(Name = "E-posta Doğrulama Token")]
    public string? EmailVerificationToken { get; set; }

    /// <summary>
    /// E-posta doğrulama token'ının son geçerlilik tarihi
    /// Token expire olması için
    /// </summary>
    [Display(Name = "E-posta Doğrulama Token Bitiş Tarihi")]
    public DateTime? EmailVerificationTokenExpiry { get; set; }

    /// <summary>
    /// Şifre sıfırlama token'ı
    /// Şifre sıfırlama için kullanılır
    /// </summary>
    [MaxLength(500, ErrorMessage = "Şifre sıfırlama token'ı en fazla 500 karakter olabilir")]
    [Display(Name = "Şifre Sıfırlama Token")]
    public string? PasswordResetToken { get; set; }

    /// <summary>
    /// Şifre sıfırlama token'ının son geçerlilik tarihi
    /// Token expire olması için
    /// </summary>
    [Display(Name = "Şifre Sıfırlama Token Bitiş Tarihi")]
    public DateTime? PasswordResetTokenExpiry { get; set; }

    /// <summary>
    /// Kullanıcının aktif refresh token'ı
    /// JWT token yenileme için kullanılır
    /// </summary>
    [MaxLength(500, ErrorMessage = "Refresh token en fazla 500 karakter olabilir")]
    [Display(Name = "Refresh Token")]
    public string? RefreshToken { get; set; }

    /// <summary>
    /// Refresh token'ın son geçerlilik tarihi
    /// Token expire olması için
    /// </summary>
    [Display(Name = "Refresh Token Bitiş Tarihi")]
    public DateTime? RefreshTokenExpiry { get; set; }

    /// <summary>
    /// Kullanıcının son giriş yapma tarihi
    /// Aktivite tracking için
    /// </summary>
    [Display(Name = "Son Giriş Tarihi")]
    public DateTime? LastLoginDate { get; set; }

    // ===== NAVIGATION PROPERTIES (İLİŞKİLER) =====

    /// <summary>
    /// Bu kullanıcının oluşturduğu görevler
    /// One-to-Many ilişki: Bir kullanıcının birçok görevi olabilir
    /// 
    /// Navigation Property: EF Core bu property'i otomatik olarak doldurur
    /// Lazy Loading: İhtiyaç halinde veritabanından yüklenir
    /// Collection Navigation Property: ICollection<T> kullanıyoruz
    /// </summary>
    public virtual ICollection<TodoTask> Tasks { get; set; } = new List<TodoTask>();

    /// <summary>
    /// Bu kullanıcının oluşturduğu kategoriler
    /// One-to-Many ilişki: Bir kullanıcının birçok kategorisi olabilir
    /// 
    /// Virtual: Lazy loading için gerekli (opsiyonel - configure edilebilir)
    /// ICollection: Entity Framework için standart collection interface
    /// </summary>
    public virtual ICollection<Category> Categories { get; set; } = new List<Category>();

    // ===== COMPUTED PROPERTIES (HESAPLANAN ÖZELLİKLER) =====

    /// <summary>
    /// Kullanıcının tam adı (Ad + Soyad)
    /// NotMapped: Bu property veritabanında saklanmaz
    /// Computed: Diğer property'lerden hesaplanır
    /// Read-only: Sadece get accessor'ü var
    /// </summary>
    [NotMapped] // Veritabanına mapping'i engelle
    [Display(Name = "Tam Ad")]
    public string FullName => $"{FirstName} {LastName}".Trim();

    /// <summary>
    /// Kullanıcının toplam görev sayısı
    /// NotMapped: Veritabanında saklanmaz
    /// Navigation property'den hesaplanır
    /// Null-safe: Tasks null ise 0 döner
    /// </summary>
    [NotMapped]
    [Display(Name = "Toplam Görev Sayısı")]
    public int TotalTaskCount => Tasks?.Count ?? 0;

    /// <summary>
    /// Kullanıcının tamamlanan görev sayısı
    /// LINQ kullanarak hesaplanır
    /// Null-safe ve performance açısından dikkatli olunmalı
    /// </summary>
    [NotMapped]
    [Display(Name = "Tamamlanan Görev Sayısı")]
    public int CompletedTaskCount => Tasks?.Count(t => t.IsCompleted) ?? 0;
}

/*
 * SONRAKI ADIMLAR:
 * ================
 * 1. Category model sınıfını oluşturacağız
 * 2. TodoTask model sınıfını oluşturacağız
 * 3. DbContext'te bu modeller arası ilişkileri yapılandıracağız
 * 4. İlk migration'ı oluşturacağız
 * 
 * EF CORE CONVENTION'LAR:
 * ======================
 * - "Id" property'si otomatik Primary Key
 * - "ClassNameId" foreign key convention
 * - Collection navigation properties için ICollection<T>
 * - Virtual keyword lazy loading için
 * - Required property'ler nullable olmayan türler
 */ 