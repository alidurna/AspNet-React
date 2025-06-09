/*
 * Category.cs - Kategori Model Sınıfı
 * ===================================
 * 
 * Bu sınıf TaskFlow uygulamasındaki görev kategorilerini temsil eder.
 * Kullanıcılar görevlerini kategorilere ayırarak daha düzenli çalışabilir.
 * 
 * ÖRNEK KATEGORİLER:
 * ==================
 * - 🏠 Kişisel (Personal)
 * - 💼 İş (Work) 
 * - 🛒 Alışveriş (Shopping)
 * - 💊 Sağlık (Health)
 * - 📚 Eğitim (Education)
 * - 🎯 Hedefler (Goals)
 * 
 * İLİŞKİLER:
 * ==========
 * - User (1) -> Category (N): Bir kullanıcının birçok kategorisi olabilir
 * - Category (1) -> TodoTask (N): Bir kategorinin birçok görevi olabilir
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskFlow.API.Models;

/// <summary>
/// Görev kategorilerini temsil eden entity sınıfı
/// Bu sınıf veritabanında "Categories" tablosuna karşılık gelir
/// </summary>
public class Category
{
    // ===== PRIMARY KEY =====
    /// <summary>
    /// Kategorinin benzersiz kimliği (Primary Key)
    /// EF Convention: "Id" property'si otomatik olarak PK olur
    /// Identity: Veritabanı tarafından otomatik artan değer
    /// </summary>
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    // ===== FOREIGN KEY =====
    /// <summary>
    /// Bu kategorinin sahibi olan kullanıcının ID'si (Foreign Key)
    /// 
    /// EF Convention: "User" navigation property olduğu için
    /// "UserId" otomatik olarak foreign key olarak algılanır
    /// 
    /// Required: Her kategorinin mutlaka bir sahibi olmalı
    /// </summary>
    [Required(ErrorMessage = "Kategori sahibi zorunludur")]
    [Display(Name = "Kullanıcı ID")]
    public int UserId { get; set; }

    // ===== CATEGORY INFORMATION =====
    
    /// <summary>
    /// Kategorinin adı (örn: "İş", "Kişisel", "Alışveriş")
    /// Required: Zorunlu alan
    /// MaxLength: Kısa ve öz kategori isimleri için 100 karakter yeterli
    /// </summary>
    [Required(ErrorMessage = "Kategori adı zorunludur")]
    [MaxLength(100, ErrorMessage = "Kategori adı en fazla 100 karakter olabilir")]
    [Display(Name = "Kategori Adı")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Kategorinin açıklaması (opsiyonel)
    /// Nullable: Kullanıcı açıklama yazmak zorunda değil
    /// MaxLength: Daha detaylı açıklamalar için 500 karakter
    /// </summary>
    [MaxLength(500, ErrorMessage = "Kategori açıklaması en fazla 500 karakter olabilir")]
    [Display(Name = "Açıklama")]
    public string? Description { get; set; }

    // ===== VISUAL PROPERTIES (GÖRSEL ÖZELLİKLER) =====

    /// <summary>
    /// Kategorinin renk kodu (UI'da kategoriyi ayırt etmek için)
    /// Format: HEX color code (#FF5733, #3498DB vb.)
    /// Default: Mavi renk (#3498DB)
    /// 
    /// Bu özellik frontend'de kategori kartlarının rengini belirlemek için kullanılır
    /// </summary>
    [MaxLength(7, ErrorMessage = "Renk kodu en fazla 7 karakter olabilir (#RRGGBB)")]
    [RegularExpression(@"^#[0-9A-Fa-f]{6}$", ErrorMessage = "Geçerli bir HEX renk kodu giriniz (#RRGGBB)")]
    [Display(Name = "Renk Kodu")]
    public string ColorCode { get; set; } = "#3498DB"; // Varsayılan mavi

    /// <summary>
    /// Kategorinin ikonu (emoji veya ikon adı)
    /// Örnekler: "🏠", "💼", "📝", "work", "home", "shopping"
    /// 
    /// Frontend'de kategoriyi görsel olarak temsil etmek için kullanılır
    /// Emoji veya Font Awesome/Material Icons ikon isimleri olabilir
    /// </summary>
    [MaxLength(50, ErrorMessage = "İkon en fazla 50 karakter olabilir")]
    [Display(Name = "İkon")]
    public string? Icon { get; set; }

    // ===== CATEGORY SETTINGS =====

    /// <summary>
    /// Kategorinin aktif olup olmadığı
    /// False: Kategori arşivlenmiş (yeni görev eklenemez ama mevcut görevler görünür)
    /// True: Aktif kategori (varsayılan)
    /// 
    /// Soft delete alternatifi - kategoriyi silmek yerine deaktif hale getirme
    /// </summary>
    [Display(Name = "Aktif")]
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Kategorinin varsayılan kategori olup olmadığı
    /// True: Kullanıcının varsayılan kategorisi (yeni görevler için)
    /// False: Normal kategori
    /// 
    /// Kullanıcının en az bir varsayılan kategorisi olmalı
    /// Business rule: DbContext'te enforce edilecek
    /// </summary>
    [Display(Name = "Varsayılan Kategori")]
    public bool IsDefault { get; set; } = false;

    // ===== AUDIT FIELDS =====

    /// <summary>
    /// Kategorinin oluşturulma tarihi
    /// UTC timezone kullanıyoruz (tutarlılık için)
    /// DatabaseGenerated: EF Core otomatik set eder
    /// </summary>
    [Display(Name = "Oluşturma Tarihi")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Kategorinin son güncellenme tarihi
    /// Her save işleminde güncellenir
    /// SaveChanges override'ında otomatik set edilecek
    /// </summary>
    [Display(Name = "Güncelleme Tarihi")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // ===== NAVIGATION PROPERTIES =====

    /// <summary>
    /// Bu kategorinin sahibi olan kullanıcı (Foreign Key Navigation)
    /// 
    /// Reference Navigation Property: Tek bir User'a referans
    /// Required: Null olamaz (her kategorinin mutlaka bir sahibi var)
    /// Virtual: Lazy loading için (opsiyonel)
    /// </summary>
    [Required]
    public virtual User User { get; set; } = null!;

    /// <summary>
    /// Bu kategoriye ait görevler (Collection Navigation)
    /// 
    /// One-to-Many ilişki: Bir kategorinin birçok görevi olabilir
    /// ICollection: EF Core için standart collection interface
    /// Virtual: Lazy loading için
    /// </summary>
    public virtual ICollection<TodoTask> Tasks { get; set; } = new List<TodoTask>();

    // ===== COMPUTED PROPERTIES =====

    /// <summary>
    /// Bu kategorideki toplam görev sayısı
    /// NotMapped: Veritabanında saklanmaz, runtime'da hesaplanır
    /// Navigation property'den LINQ ile hesaplanır
    /// </summary>
    [NotMapped]
    [Display(Name = "Toplam Görev")]
    public int TotalTaskCount => Tasks?.Count ?? 0;

    /// <summary>
    /// Bu kategorideki tamamlanan görev sayısı
    /// LINQ Where clause ile filtreleme
    /// Performance: Büyük veri setlerinde dikkatli kullanılmalı
    /// </summary>
    [NotMapped]
    [Display(Name = "Tamamlanan Görev")]
    public int CompletedTaskCount => Tasks?.Count(t => t.IsCompleted) ?? 0;

    /// <summary>
    /// Bu kategorideki bekleyen (tamamlanmamış) görev sayısı
    /// Computed property - diğer özelliklerden hesaplanır
    /// </summary>
    [NotMapped]
    [Display(Name = "Bekleyen Görev")]
    public int PendingTaskCount => TotalTaskCount - CompletedTaskCount;

    /// <summary>
    /// Bu kategorideki görevlerin tamamlanma yüzdesi
    /// 0-100 arası değer döner
    /// Division by zero check yapılır
    /// </summary>
    [NotMapped]
    [Display(Name = "Tamamlanma Yüzdesi")]
    public double CompletionPercentage => TotalTaskCount == 0 ? 0 : (double)CompletedTaskCount / TotalTaskCount * 100;

    // ===== BUSINESS METHODS =====

    /// <summary>
    /// Kategorinin boş olup olmadığını kontrol eder
    /// Business logic method - entity içinde basit iş kuralları
    /// </summary>
    /// <returns>Kategori boşsa true, görev varsa false</returns>
    public bool IsEmpty() => TotalTaskCount == 0;

    /// <summary>
    /// Kategorinin tamamen tamamlanıp tamamlanmadığını kontrol eder
    /// Tüm görevler tamamlandıysa true döner
    /// </summary>
    /// <returns>Tüm görevler tamamlandıysa true</returns>
    public bool IsFullyCompleted() => TotalTaskCount > 0 && CompletedTaskCount == TotalTaskCount;

    /// <summary>
    /// Kategorinin renk kodunu CSS class adına çevirir
    /// Frontend'de kullanmak için utility method
    /// </summary>
    /// <returns>CSS-friendly renk class adı</returns>
    public string GetColorClassName() => $"category-color-{ColorCode.Replace("#", "")}";
}

/*
 * SONRAKI ADIMLAR:
 * ================
 * 1. TodoTask model sınıfını oluşturacağız (en karmaşık model)
 * 2. DbContext oluşturup tüm ilişkileri yapılandıracağız
 * 3. Fluent API ile özel konfigürasyonlar ekleyeceğiz
 * 4. Seed data (varsayılan kategoriler) ekleyeceğiz
 * 
 * BUSINESS RULES:
 * ===============
 * - Her kullanıcının en az bir kategorisi olmalı
 * - Her kullanıcının tam olarak bir varsayılan kategorisi olmalı
 * - Kategori silinirken içindeki görevler başka kategoriye taşınmalı
 * - Kategori isimleri kullanıcı bazında unique olmalı
 * 
 * FRONTEND KULLANIMI:
 * ==================
 * - ColorCode: Kategori kartlarının border/background rengi
 * - Icon: Kategori listesinde görsel temsil
 * - CompletionPercentage: Progress bar için
 * - TotalTaskCount: Badge/counter için
 */ 