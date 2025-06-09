/*
 * TodoTask.cs - Görev Model Sınıfı (Ana Entity)
 * =============================================
 * 
 * Bu sınıf TaskFlow uygulamasının kalbi olan görevleri (tasks) temsil eder.
 * En karmaşık model sınıfımız - birden fazla ilişki, business logic ve özellik içerir.
 * 
 * Model adı "TodoTask" çünkü "Task" C#'da reserved keyword'dür (System.Threading.Tasks.Task)
 * 
 * GÖREV ÖZELLİKLERİ:
 * ==================
 * - Başlık ve açıklama
 * - Öncelik seviyesi (Priority enum)
 * - Bitiş tarihi ve hatırlatma
 * - Tamamlanma durumu ve tarihi
 * - Kategori ve kullanıcı ilişkileri
 * - Alt görev (subtask) desteği
 * - Etiketleme (tagging) sistemi
 * 
 * VERİTABANI İLİŞKİLERİ:
 * ======================
 * - User (1) -> TodoTask (N): Bir kullanıcının birçok görevi
 * - Category (1) -> TodoTask (N): Bir kategorinin birçok görevi  
 * - TodoTask (1) -> TodoTask (N): Ana görev -> Alt görevler (Self-Reference)
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskFlow.API.Models;

/// <summary>
/// Görev (Task) entity sınıfı - TaskFlow uygulamasının ana entity'si
/// Bu sınıf veritabanında "TodoTasks" tablosuna karşılık gelir
/// </summary>
public class TodoTask
{
    // ===== PRIMARY KEY =====
    /// <summary>
    /// Görevin benzersiz kimliği (Primary Key)
    /// EF Convention: "Id" property'si otomatik Primary Key
    /// Identity: Veritabanında auto-increment
    /// </summary>
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    // ===== FOREIGN KEYS =====
    
    /// <summary>
    /// Bu görevi oluşturan kullanıcının ID'si (Required Foreign Key)
    /// Her görevin mutlaka bir sahibi olmalı
    /// </summary>
    [Required(ErrorMessage = "Görev sahibi zorunludur")]
    [Display(Name = "Kullanıcı ID")]
    public int UserId { get; set; }

    /// <summary>
    /// Bu görevin ait olduğu kategorinin ID'si (Required Foreign Key)
    /// Her görev mutlaka bir kategoriye ait olmalı
    /// </summary>
    [Required(ErrorMessage = "Kategori zorunludur")]
    [Display(Name = "Kategori ID")]
    public int CategoryId { get; set; }

    /// <summary>
    /// Ana görevin ID'si (Optional Foreign Key - Self Reference)
    /// Null: Bu görev ana görevdir
    /// Değer var: Bu görev bir alt görevdir (subtask)
    /// 
    /// Bu özellik hierarchical görev yapısı sağlar:
    /// Ana Görev: "Website Yenileme Projesi"
    ///   - Alt Görev 1: "UI/UX Tasarım"
    ///   - Alt Görev 2: "Backend Geliştirme"
    ///   - Alt Görev 3: "Test ve Deploy"
    /// </summary>
    [Display(Name = "Ana Görev ID")]
    public int? ParentTaskId { get; set; }

    // ===== TASK CORE INFORMATION =====

    /// <summary>
    /// Görevin başlığı/adı
    /// Required: Zorunlu alan, boş görev olamaz
    /// MaxLength: Kısa ve net başlıklar için 200 karakter
    /// </summary>
    [Required(ErrorMessage = "Görev başlığı zorunludur")]
    [MaxLength(200, ErrorMessage = "Görev başlığı en fazla 200 karakter olabilir")]
    [Display(Name = "Başlık")]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Görevin detaylı açıklaması (opsiyonel)
    /// Nullable: Kullanıcı açıklama yazmayabilir
    /// MaxLength: Uzun açıklamalar için 2000 karakter
    /// 
    /// Markdown formatında yazılabilir (frontend'de render edilecek)
    /// </summary>
    [MaxLength(2000, ErrorMessage = "Görev açıklaması en fazla 2000 karakter olabilir")]
    [Display(Name = "Açıklama")]
    public string? Description { get; set; }

    /// <summary>
    /// Görevin öncelik seviyesi
    /// Enum: Priority.Low, Normal, High, Critical
    /// Default: Normal priority
    /// Veritabanında integer olarak saklanır (0,1,2,3)
    /// </summary>
    [Display(Name = "Öncelik")]
    public Priority Priority { get; set; } = Priority.Normal;

    // ===== DATE & TIME MANAGEMENT =====

    /// <summary>
    /// Görevin bitiş tarihi (opsiyonel)
    /// Nullable: Tüm görevlerin deadline'ı olmayabilir
    /// UTC: Timezone bağımsız çalışma için
    /// 
    /// Bu tarih geçtikten sonra görev "overdue" kabul edilir
    /// </summary>
    [Display(Name = "Bitiş Tarihi")]
    public DateTime? DueDate { get; set; }

    /// <summary>
    /// Hatırlatma tarihi ve saati (opsiyonel)
    /// Nullable: Kullanıcı hatırlatma istemeyebilir
    /// 
    /// Bu tarihte push notification/email gönderilecek
    /// DueDate'den önce olmalı (validation gerekli)
    /// </summary>
    [Display(Name = "Hatırlatma")]
    public DateTime? ReminderDate { get; set; }

    /// <summary>
    /// Görevin başlangıç tarihi (opsiyonel)
    /// Nullable: Görev hemen başlayabilir veya gelecekteki bir tarihte
    /// 
    /// Proje planlama için kullanışlı
    /// StartDate >= DateTime.Now olmalı (yeni görevler için)
    /// </summary>
    [Display(Name = "Başlangıç Tarihi")]
    public DateTime? StartDate { get; set; }

    // ===== COMPLETION STATUS =====

    /// <summary>
    /// Görevin tamamlanıp tamamlanmadığı
    /// False: Görev devam ediyor/beklemede
    /// True: Görev tamamlandı
    /// 
    /// Bu değer değiştiğinde CompletedAt otomatik set edilir
    /// </summary>
    [Display(Name = "Tamamlandı")]
    public bool IsCompleted { get; set; } = false;

    /// <summary>
    /// Görevin tamamlanma tarihi (otomatik set edilen)
    /// Null: Görev henüz tamamlanmamış
    /// Değer: IsCompleted = true yapıldığında set edilir
    /// 
    /// UTC timezone kullanılır
    /// ReadOnly: Manuel set edilmez, business logic ile güncellenir
    /// </summary>
    [Display(Name = "Tamamlanma Tarihi")]
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// Görevin tamamlanma yüzdesi (0-100)
    /// Alt görevler olan ana görevler için hesaplanır
    /// Manuel görevler için kullanıcı tarafından set edilebilir
    /// 
    /// 0: Başlanmamış
    /// 1-99: Devam ediyor
    /// 100: Tamamlanmış (IsCompleted = true ile eş zamanlı)
    /// </summary>
    [Range(0, 100, ErrorMessage = "Tamamlanma yüzdesi 0-100 arasında olmalıdır")]
    [Display(Name = "Tamamlanma Yüzdesi")]
    public int CompletionPercentage { get; set; } = 0;

    // ===== ADDITIONAL FEATURES =====

    /// <summary>
    /// Görev etiketleri (virgülle ayrılmış)
    /// Örnek: "urgent, work, meeting, client"
    /// 
    /// Frontend'de chip/badge olarak gösterilir
    /// Arama ve filtreleme için kullanılır
    /// Gelecekte ayrı Tags tablosu yapılabilir (Many-to-Many)
    /// </summary>
    [MaxLength(500, ErrorMessage = "Etiketler en fazla 500 karakter olabilir")]
    [Display(Name = "Etiketler")]
    public string? Tags { get; set; }

    /// <summary>
    /// Görevle ilgili notlar/yorumlar
    /// Kullanıcının görev hakkında aldığı notlar
    /// Toplantı notları, fikir geliştirme vb. için
    /// </summary>
    [MaxLength(1000, ErrorMessage = "Notlar en fazla 1000 karakter olabilir")]
    [Display(Name = "Notlar")]
    public string? Notes { get; set; }

    /// <summary>
    /// Tahmini süre (dakika cinsinden)
    /// Görevin ne kadar süreceğinin tahmini
    /// Zaman yönetimi ve planlama için kullanılır
    /// 
    /// Örnek: 30 = 30 dakika, 120 = 2 saat
    /// </summary>
    [Range(1, 10080, ErrorMessage = "Tahmini süre 1 dakika ile 1 hafta (10080 dk) arasında olmalıdır")]
    [Display(Name = "Tahmini Süre (dakika)")]
    public int? EstimatedMinutes { get; set; }

    /// <summary>
    /// Gerçek geçen süre (dakika cinsinden)
    /// Görevde gerçekte harcanan zaman
    /// Time tracking özelliği için
    /// 
    /// Timer ile otomatik hesaplanabilir veya manuel girilebilir
    /// </summary>
    [Range(0, 100000, ErrorMessage = "Geçen süre negatif olamaz")]
    [Display(Name = "Geçen Süre (dakika)")]
    public int? ActualMinutes { get; set; }

    // ===== SYSTEM/AUDIT FIELDS =====

    /// <summary>
    /// Görevin oluşturulma tarihi
    /// UTC timezone kullanılır
    /// DatabaseGenerated: EF Core otomatik set eder
    /// </summary>
    [Display(Name = "Oluşturma Tarihi")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Görevin son güncellenme tarihi
    /// Her SaveChanges'te otomatik güncellenir
    /// UTC timezone kullanılır
    /// </summary>
    [Display(Name = "Güncelleme Tarihi")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Görevin aktif/pasif durumu
    /// False: Görev arşivlenmiş (görünmez ama silinmez)
    /// True: Aktif görev (varsayılan)
    /// 
    /// Soft delete pattern - veri kaybını önler
    /// </summary>
    [Display(Name = "Aktif")]
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Görevin favorilere eklenip eklenmediği
    /// True: Favori görev (özel listeleme için)
    /// False: Normal görev
    /// 
    /// Kullanıcı deneyimi için - önemli görevleri ayırt etme
    /// </summary>
    [Display(Name = "Favori")]
    public bool IsFavorite { get; set; } = false;

    // ===== NAVIGATION PROPERTIES =====

    /// <summary>
    /// Bu görevi oluşturan kullanıcı (Required Reference Navigation)
    /// Foreign Key: UserId
    /// Her görevin mutlaka bir sahibi var
    /// </summary>
    [Required]
    public virtual User User { get; set; } = null!;

    /// <summary>
    /// Bu görevin ait olduğu kategori (Required Reference Navigation)
    /// Foreign Key: CategoryId
    /// Her görev mutlaka bir kategoriye ait
    /// </summary>
    [Required]
    public virtual Category Category { get; set; } = null!;

    /// <summary>
    /// Ana görev (Optional Reference Navigation - Self Reference)
    /// Foreign Key: ParentTaskId
    /// Null: Bu görev ana görev
    /// Değer: Bu görev alt görev
    /// </summary>
    public virtual TodoTask? ParentTask { get; set; }

    /// <summary>
    /// Alt görevler (Collection Navigation - Self Reference)
    /// Bu görevin altındaki görevler
    /// 
    /// Hierarchical yapı için:
    /// Ana Görev -> Alt Görevler -> Alt görevlerin alt görevleri (unlimited depth)
    /// </summary>
    public virtual ICollection<TodoTask> SubTasks { get; set; } = new List<TodoTask>();

    // ===== COMPUTED PROPERTIES =====

    /// <summary>
    /// Görevin gecikmeli olup olmadığı
    /// NotMapped: Veritabanında saklanmaz
    /// 
    /// Logic: DueDate geçmiş VE görev tamamlanmamış
    /// </summary>
    [NotMapped]
    [Display(Name = "Gecikmiş")]
    public bool IsOverdue => DueDate.HasValue && DueDate < DateTime.UtcNow && !IsCompleted;

    /// <summary>
    /// Görevin bugüne kadar olan güncelleme sayısı
    /// UpdatedAt - CreatedAt farkından hesaplanır
    /// Görev ne kadar aktif olarak düzenlendiğinin göstergesi
    /// </summary>
    [NotMapped]
    [Display(Name = "Güncelleme Sayısı")]
    public int DaysSinceCreated => (DateTime.UtcNow - CreatedAt).Days;

    /// <summary>
    /// Kalan süre (bitiş tarihine kadar)
    /// Null: Bitiş tarihi belirlenmemiş
    /// Pozitif: Henüz süre var
    /// Negatif: Süre geçmiş
    /// </summary>
    [NotMapped]
    [Display(Name = "Kalan Süre")]
    public TimeSpan? TimeRemaining => DueDate?.Subtract(DateTime.UtcNow);

    /// <summary>
    /// Alt görev sayısı
    /// NotMapped: Navigation property'den hesaplanır
    /// </summary>
    [NotMapped]
    [Display(Name = "Alt Görev Sayısı")]
    public int SubTaskCount => SubTasks?.Count ?? 0;

    /// <summary>
    /// Tamamlanan alt görev sayısı
    /// LINQ ile filtreleme
    /// </summary>
    [NotMapped]
    [Display(Name = "Tamamlanan Alt Görev")]
    public int CompletedSubTaskCount => SubTasks?.Count(st => st.IsCompleted) ?? 0;

    /// <summary>
    /// Alt görevlere göre otomatik tamamlanma yüzdesi
    /// Alt görev varsa onların durumuna göre hesaplanır
    /// Alt görev yoksa manuel CompletionPercentage kullanılır
    /// </summary>
    [NotMapped]
    [Display(Name = "Gerçek Tamamlanma Yüzdesi")]
    public int ActualCompletionPercentage
    {
        get
        {
            if (SubTaskCount == 0)
                return CompletionPercentage; // Manuel yüzde
            
            return SubTaskCount == 0 ? 0 : (CompletedSubTaskCount * 100) / SubTaskCount;
        }
    }

    /// <summary>
    /// Etiket listesi (string'den array'e çevirme)
    /// Frontend'de kullanım kolaylığı için
    /// Null-safe ve trim işlemi yapar
    /// </summary>
    [NotMapped]
    public string[] TagList => Tags?.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                   .Select(tag => tag.Trim())
                                   .Where(tag => !string.IsNullOrEmpty(tag))
                                   .ToArray() ?? Array.Empty<string>();

    // ===== BUSINESS METHODS =====

    /// <summary>
    /// Görevi tamamlandı olarak işaretler
    /// Business logic: IsCompleted = true, CompletedAt = now, CompletionPercentage = 100
    /// </summary>
    public void MarkAsCompleted()
    {
        IsCompleted = true;
        CompletedAt = DateTime.UtcNow;
        CompletionPercentage = 100;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Görevi tamamlanmamış olarak işaretler
    /// Business logic: IsCompleted = false, CompletedAt = null
    /// </summary>
    public void MarkAsIncomplete()
    {
        IsCompleted = false;
        CompletedAt = null;
        // CompletionPercentage değiştirilmez - kullanıcı kararı
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Etiket ekler (mevcut etiketlere)
    /// Duplicate kontrolü yapar
    /// </summary>
    /// <param name="newTag">Eklenecek etiket</param>
    public void AddTag(string newTag)
    {
        if (string.IsNullOrWhiteSpace(newTag)) return;
        
        var existingTags = TagList.ToList();
        if (!existingTags.Contains(newTag.Trim(), StringComparer.OrdinalIgnoreCase))
        {
            existingTags.Add(newTag.Trim());
            Tags = string.Join(", ", existingTags);
            UpdatedAt = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Etiket kaldırır
    /// </summary>
    /// <param name="tagToRemove">Kaldırılacak etiket</param>
    public void RemoveTag(string tagToRemove)
    {
        if (string.IsNullOrWhiteSpace(tagToRemove)) return;
        
        var existingTags = TagList.ToList();
        existingTags.RemoveAll(tag => tag.Equals(tagToRemove.Trim(), StringComparison.OrdinalIgnoreCase));
        Tags = existingTags.Any() ? string.Join(", ", existingTags) : null;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Görevin yüksek öncelikli olup olmadığını kontrol eder
    /// </summary>
    /// <returns>High veya Critical ise true</returns>
    public bool IsHighPriority() => Priority >= Priority.High;

    /// <summary>
    /// Görevin bu hafta içinde bitiyor olup olmadığını kontrol eder
    /// </summary>
    /// <returns>Bu hafta bitiş tarihi varsa true</returns>
    public bool IsDueThisWeek()
    {
        if (!DueDate.HasValue) return false;
        
        var weekStart = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek);
        var weekEnd = weekStart.AddDays(7);
        
        return DueDate.Value.Date >= weekStart && DueDate.Value.Date < weekEnd;
    }
}

/*
 * SONRAKI ADIMLAR:
 * ================
 * 1. DbContext oluşturacağız (TaskFlowDbContext)
 * 2. Fluent API ile ilişkileri konfigüre edeceğiz
 * 3. Seed data ekleyeceğiz
 * 4. İlk migration'ı oluşturacağız
 * 5. Database'i güncelleyeceğiz
 * 
 * BUSINESS RULES:
 * ===============
 * - Alt görevlerin ana görevi ile aynı kullanıcıya ait olması gerekir
 * - ReminderDate < DueDate olmalı
 * - StartDate < DueDate olmalı  
 * - Tamamlanan görevlerin alt görevleri de tamamlanmış sayılır
 * - Ana görev silinirse alt görevler bağımsız görev olur
 * 
 * PERFORMANCE CONSIDERATIONS:
 * ===========================
 * - SubTasks navigation property lazy loading
 * - Computed properties database'e kayıt edilmez
 * - Tags arama için index düşünülebilir
 * - Deep hierarchy performans sorunları yaratabilir
 * 
 * FRONTEND FEATURES:
 * ==================
 * - Drag & drop sıralama (order by Priority, DueDate)
 * - Kanban board (category bazlı)
 * - Calendar view (DueDate bazlı)
 * - Timer özelliği (ActualMinutes tracking)
 * - Progress tracking (CompletionPercentage)
 * - Tag-based filtreleme ve arama
 */ 