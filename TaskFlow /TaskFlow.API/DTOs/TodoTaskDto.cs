using System.ComponentModel.DataAnnotations;
using TaskFlow.API.Models;

namespace TaskFlow.API.DTOs
{
    /// <summary>
    /// TodoTask bilgilerini client'a güvenli şekilde döndürmek için kullanılan DTO
    /// Database entity'sinden farklı olarak sadece gerekli bilgileri içerir
    /// </summary>
    /// <remarks>
    /// Bu DTO, task listelerinde ve detay sayfalarında kullanılır.
    /// Navigation property'ler dahil edilmiş ve computed property'ler hesaplanmıştır.
    /// Client-side'da task management UI'ı için optimize edilmiştir.
    /// </remarks>
    public class TodoTaskDto
    {
        /// <summary>
        /// Task'in benzersiz ID'si
        /// Database'deki primary key
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Task'in ait olduğu kullanıcının ID'si
        /// Authorization kontrolü için kullanılır
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Task'in ait olduğu kategorinin ID'si
        /// Kategori bazlı filtreleme için kullanılır
        /// </summary>
        public int CategoryId { get; set; }

        /// <summary>
        /// Üst task'in ID'si (hierarchical tasks için)
        /// Null ise ana task, değer varsa alt task
        /// </summary>
        public int? ParentTaskId { get; set; }

        /// <summary>
        /// Task'in başlığı
        /// Kısa ve öz açıklama
        /// </summary>
        /// <example>API dokümantasyonu yaz</example>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Task'in detaylı açıklaması
        /// İsteğe bağlı ek bilgiler
        /// </summary>
        /// <example>Swagger ve Postman collection'ı hazırla</example>
        public string? Description { get; set; }

        /// <summary>
        /// Task'in öncelik seviyesi
        /// Enum değeri string olarak döndürülür
        /// </summary>
        /// <example>High</example>
        public string Priority { get; set; } = "Normal";

        /// <summary>
        /// Task'in tamamlanma yüzdesi
        /// 0-100 arası değer
        /// </summary>
        /// <example>75</example>
        public int CompletionPercentage { get; set; } = 0;

        /// <summary>
        /// Task'in bitiş tarihi
        /// İsteğe bağlı deadline
        /// </summary>
        public DateTime? DueDate { get; set; }

        /// <summary>
        /// Task için hatırlatma tarihi
        /// İsteğe bağlı notification zamanı
        /// </summary>
        public DateTime? ReminderDate { get; set; }

        /// <summary>
        /// Task'in başlangıç tarihi
        /// İsteğe bağlı planlama için
        /// </summary>
        public DateTime? StartDate { get; set; }

        /// <summary>
        /// Task'in tamamlanıp tamamlanmadığı
        /// Boolean flag
        /// </summary>
        public bool IsCompleted { get; set; } = false;

        /// <summary>
        /// Task'in tamamlanma tarihi
        /// IsCompleted true ise otomatik set edilir
        /// </summary>
        public DateTime? CompletedAt { get; set; }

        /// <summary>
        /// Task'in aktif olup olmadığı
        /// Soft delete için kullanılır
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Task ile ilgili etiketler
        /// Comma-separated string
        /// </summary>
        /// <example>urgent,frontend,api</example>
        public string? Tags { get; set; }

        /// <summary>
        /// Task ile ilgili ek notlar
        /// Uzun açıklamalar için
        /// </summary>
        public string? Notes { get; set; }

        /// <summary>
        /// Task'in oluşturulma tarihi
        /// Audit trail için
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Task'in son güncellenme tarihi
        /// Audit trail için
        /// </summary>
        public DateTime UpdatedAt { get; set; }

        // ===== AUTOMAPPER COMPUTED PROPERTIES =====

        /// <summary>
        /// Kategori adı (AutoMapper tarafından hesaplanır)
        /// Category navigation property'sinden alınır
        /// </summary>
        public string CategoryName { get; set; } = string.Empty;

        /// <summary>
        /// Kategori rengi (AutoMapper tarafından hesaplanır)
        /// Category navigation property'sinden alınır
        /// </summary>
        public string CategoryColor { get; set; } = "#6B7280";

        /// <summary>
        /// Kullanıcı adı (AutoMapper tarafından hesaplanır)
        /// User navigation property'sinden alınır
        /// </summary>
        public string UserName { get; set; } = string.Empty;

        /// <summary>
        /// Bitiş tarihine kalan gün sayısı (AutoMapper tarafından hesaplanır)
        /// Due date'e göre hesaplanır
        /// </summary>
        public int? DaysUntilDue { get; set; }

        // ===== NAVIGATION PROPERTIES =====

        /// <summary>
        /// Task'in ait olduğu kategori bilgileri
        /// Nested object olarak döndürülür
        /// </summary>
        public CategoryDto? Category { get; set; }

        /// <summary>
        /// Üst task bilgileri (eğer alt task ise)
        /// Hierarchy navigation için
        /// </summary>
        public TodoTaskDto? ParentTask { get; set; }

        /// <summary>
        /// Alt task'ların listesi
        /// Hierarchy expansion için
        /// </summary>
        public List<TodoTaskDto>? SubTasks { get; set; }

        // ===== COMPUTED PROPERTIES =====

        /// <summary>
        /// Task'in gecikip gecikmediği
        /// DueDate ile şu anki tarih karşılaştırması
        /// </summary>
        public bool IsOverdue => DueDate.HasValue && DueDate.Value < DateTime.UtcNow && !IsCompleted;

        /// <summary>
        /// Task'in tamamlanmasına kalan gün sayısı
        /// Negatif değer gecikmeyi gösterir
        /// </summary>
        public int? DaysRemaining => DueDate?.Subtract(DateTime.UtcNow).Days;

        /// <summary>
        /// Task'in kalan zamanını human-readable format
        /// </summary>
        /// <example>3 gün kaldı, 2 gün geçti</example>
        public string TimeRemainingText
        {
            get
            {
                if (!DueDate.HasValue) return "Tarih belirlenmemiş";
                if (IsCompleted) return "Tamamlandı";

                var days = DaysRemaining ?? 0;
                if (days > 0) return $"{days} gün kaldı";
                if (days == 0) return "Bugün bitiyor";
                return $"{Math.Abs(days)} gün geçti";
            }
        }

        /// <summary>
        /// Alt task sayısı
        /// Hierarchy için istatistik
        /// </summary>
        public int SubTaskCount => SubTasks?.Count ?? 0;

        /// <summary>
        /// Tamamlanan alt task sayısı
        /// Progress tracking için
        /// </summary>
        public int CompletedSubTaskCount => SubTasks?.Count(st => st.IsCompleted) ?? 0;

        /// <summary>
        /// Tag'leri array olarak döndürür
        /// Frontend'de kolay kullanım için
        /// </summary>
        public string[] TagArray => string.IsNullOrWhiteSpace(Tags) 
            ? Array.Empty<string>() 
            : Tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
                  .Select(tag => tag.Trim())
                  .ToArray();

        /// <summary>
        /// Task'in priority'sine göre renk kodu
        /// UI'da kullanım için
        /// </summary>
        public string PriorityColor => Priority switch
        {
            "Low" => "#28a745",      // Green
            "Normal" => "#007bff",   // Blue  
            "High" => "#fd7e14",     // Orange
            "Critical" => "#dc3545", // Red
            _ => "#6c757d"           // Gray (default)
        };

        /// <summary>
        /// Task'in status'una göre renk kodu
        /// UI'da kullanım için
        /// </summary>
        public string StatusColor => IsCompleted 
            ? "#28a745"              // Green (completed)
            : IsOverdue 
                ? "#dc3545"          // Red (overdue)
                : "#007bff";         // Blue (active)
    }

    /// <summary>
    /// Yeni TodoTask oluşturmak için kullanılan DTO
    /// Validation attribute'ları ile input kontrolü yapar
    /// </summary>
    /// <remarks>
    /// Bu DTO sadece task oluşturma işlemi için kullanılır.
    /// Required field'lar ve business rule validation'ları içerir.
    /// </remarks>
    public class CreateTodoTaskDto
    {
        /// <summary>
        /// Task'in ait olacağı kategori ID'si
        /// Zorunlu alan - her task bir kategoriye ait olmalı
        /// </summary>
        [Required(ErrorMessage = "Kategori seçimi zorunludur")]
        [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir kategori seçiniz")]
        public int CategoryId { get; set; }

        /// <summary>
        /// Üst task ID'si (opsiyonel)
        /// Alt task oluşturmak için kullanılır
        /// </summary>
        [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir üst task seçiniz")]
        public int? ParentTaskId { get; set; }

        /// <summary>
        /// Task başlığı
        /// Zorunlu alan, kısa ve açıklayıcı olmalı
        /// </summary>
        [Required(ErrorMessage = "Task başlığı zorunludur")]
        [StringLength(200, MinimumLength = 3, ErrorMessage = "Task başlığı 3-200 karakter arasında olmalıdır")]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Task açıklaması
        /// İsteğe bağlı detaylı bilgi
        /// </summary>
        [StringLength(2000, ErrorMessage = "Açıklama en fazla 2000 karakter olabilir")]
        public string? Description { get; set; }

        /// <summary>
        /// Task önceliği
        /// Enum değerlerinden biri olmalı
        /// </summary>
        [Required(ErrorMessage = "Öncelik seviyesi seçimi zorunludur")]
        [RegularExpression("^(Low|Normal|High|Critical)$", ErrorMessage = "Geçerli öncelik seviyesi seçiniz")]
        public string Priority { get; set; } = "Normal";

        /// <summary>
        /// Task tamamlanma yüzdesi
        /// Başlangıçta genellikle 0
        /// </summary>
        [Range(0, 100, ErrorMessage = "Tamamlanma yüzdesi 0-100 arasında olmalıdır")]
        public int CompletionPercentage { get; set; } = 0;

        /// <summary>
        /// Task bitiş tarihi
        /// İsteğe bağlı deadline
        /// </summary>
        public DateTime? DueDate { get; set; }

        /// <summary>
        /// Hatırlatma tarihi
        /// DueDate'den önce olmalı
        /// </summary>
        public DateTime? ReminderDate { get; set; }

        /// <summary>
        /// Başlangıç tarihi
        /// İsteğe bağlı planlama
        /// </summary>
        public DateTime? StartDate { get; set; }

        /// <summary>
        /// Task etiketleri
        /// Comma-separated format
        /// </summary>
        [StringLength(500, ErrorMessage = "Etiketler en fazla 500 karakter olabilir")]
        public string? Tags { get; set; }

        /// <summary>
        /// Ek notlar
        /// Uzun açıklamalar için
        /// </summary>
        [StringLength(5000, ErrorMessage = "Notlar en fazla 5000 karakter olabilir")]
        public string? Notes { get; set; }

        /// <summary>
        /// Custom validation method
        /// Business rule kontrolü
        /// </summary>
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            var results = new List<ValidationResult>();

            // ReminderDate DueDate'den sonra olamaz
            if (ReminderDate.HasValue && DueDate.HasValue && ReminderDate > DueDate)
            {
                results.Add(new ValidationResult(
                    "Hatırlatma tarihi bitiş tarihinden sonra olamaz",
                    new[] { nameof(ReminderDate) }));
            }

            // StartDate DueDate'den sonra olamaz
            if (StartDate.HasValue && DueDate.HasValue && StartDate > DueDate)
            {
                results.Add(new ValidationResult(
                    "Başlangıç tarihi bitiş tarihinden sonra olamaz",
                    new[] { nameof(StartDate) }));
            }

            // DueDate geçmişte olamaz (yeni task için)
            if (DueDate.HasValue && DueDate < DateTime.UtcNow.Date)
            {
                results.Add(new ValidationResult(
                    "Bitiş tarihi geçmişte bir tarih olamaz",
                    new[] { nameof(DueDate) }));
            }

            return results;
        }
    }

    /// <summary>
    /// TodoTask güncellemek için kullanılan DTO
    /// Mevcut task'in özelliklerini günceller
    /// </summary>
    /// <remarks>
    /// Bu DTO task güncelleme işlemi için kullanılır.
    /// Partial update desteği için tüm field'lar optional olmayabilir.
    /// </remarks>
    public class UpdateTodoTaskDto
    {
        /// <summary>
        /// Güncellenecek kategori ID'si
        /// Task'i farklı kategoriye taşımak için
        /// </summary>
        [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir kategori seçiniz")]
        public int? CategoryId { get; set; }

        /// <summary>
        /// Güncellenecek üst task ID'si
        /// Task hierarchy'sini değiştirmek için
        /// </summary>
        [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir üst task seçiniz")]
        public int? ParentTaskId { get; set; }

        /// <summary>
        /// Güncellenecek başlık
        /// </summary>
        [StringLength(200, MinimumLength = 3, ErrorMessage = "Task başlığı 3-200 karakter arasında olmalıdır")]
        public string? Title { get; set; }

        /// <summary>
        /// Güncellenecek açıklama
        /// </summary>
        [StringLength(2000, ErrorMessage = "Açıklama en fazla 2000 karakter olabilir")]
        public string? Description { get; set; }

        /// <summary>
        /// Güncellenecek öncelik
        /// </summary>
        [RegularExpression("^(Low|Normal|High|Critical)$", ErrorMessage = "Geçerli öncelik seviyesi seçiniz")]
        public string? Priority { get; set; }

        /// <summary>
        /// Güncellenecek tamamlanma yüzdesi
        /// </summary>
        [Range(0, 100, ErrorMessage = "Tamamlanma yüzdesi 0-100 arasında olmalıdır")]
        public int? CompletionPercentage { get; set; }

        /// <summary>
        /// Güncellenecek bitiş tarihi
        /// </summary>
        public DateTime? DueDate { get; set; }

        /// <summary>
        /// Güncellenecek hatırlatma tarihi
        /// </summary>
        public DateTime? ReminderDate { get; set; }

        /// <summary>
        /// Güncellenecek başlangıç tarihi
        /// </summary>
        public DateTime? StartDate { get; set; }

        /// <summary>
        /// Güncellenecek etiketler
        /// </summary>
        [StringLength(500, ErrorMessage = "Etiketler en fazla 500 karakter olabilir")]
        public string? Tags { get; set; }

        /// <summary>
        /// Güncellenecek notlar
        /// </summary>
        [StringLength(5000, ErrorMessage = "Notlar en fazla 5000 karakter olabilir")]
        public string? Notes { get; set; }
    }

    /// <summary>
    /// TodoTask filtreleme ve arama için kullanılan DTO
    /// List endpoint'inde query parameter olarak kullanılır
    /// </summary>
    /// <remarks>
    /// Bu DTO, task listesini filtrelemek ve aramak için kullanılır.
    /// Pagination, sorting ve filtering desteği sağlar.
    /// </remarks>
    public class TodoTaskFilterDto
    {
        /// <summary>
        /// Kategori ID'sine göre filtreleme
        /// Belirli kategorideki task'ları getirmek için
        /// </summary>
        public int? CategoryId { get; set; }

        /// <summary>
        /// Üst task ID'sine göre filtreleme
        /// Alt task'ları getirmek için
        /// </summary>
        public int? ParentTaskId { get; set; }

        /// <summary>
        /// Tamamlanma durumuna göre filtreleme
        /// null: tümü, true: tamamlanan, false: tamamlanmayan
        /// </summary>
        public bool? IsCompleted { get; set; }

        /// <summary>
        /// Öncelik seviyesine göre filtreleme
        /// </summary>
        public string? Priority { get; set; }

        /// <summary>
        /// Metin bazlı arama
        /// Title ve Description alanlarında arama yapar
        /// </summary>
        public string? SearchText { get; set; }

        /// <summary>
        /// Etikete göre arama
        /// Belirli etiketli task'ları bulmak için
        /// </summary>
        public string? Tag { get; set; }

        /// <summary>
        /// Bitiş tarihi aralığı - başlangıç
        /// </summary>
        public DateTime? DueDateFrom { get; set; }

        /// <summary>
        /// Bitiş tarihi aralığı - bitiş
        /// </summary>
        public DateTime? DueDateTo { get; set; }

        /// <summary>
        /// Sadece süresi geçmiş task'ları getir
        /// </summary>
        public bool? IsOverdue { get; set; }

        /// <summary>
        /// Sıralama alanı
        /// </summary>
        /// <example>CreatedAt, DueDate, Priority, Title</example>
        public string? SortBy { get; set; } = "CreatedAt";

        /// <summary>
        /// Sıralama yönü
        /// true: ascending, false: descending
        /// </summary>
        public bool SortAscending { get; set; } = false;

        /// <summary>
        /// Sayfa numarası (pagination)
        /// </summary>
        [Range(1, int.MaxValue, ErrorMessage = "Sayfa numarası 1'den büyük olmalıdır")]
        public int Page { get; set; } = 1;

        /// <summary>
        /// Sayfa başına kayıt sayısı
        /// </summary>
        [Range(1, 100, ErrorMessage = "Sayfa boyutu 1-100 arasında olmalıdır")]
        public int PageSize { get; set; } = 20;

        /// <summary>
        /// Alt task'ları da dahil et
        /// Hierarchy expansion için
        /// </summary>
        public bool IncludeSubTasks { get; set; } = false;

        /// <summary>
        /// Sadece ana task'ları getir (alt task'ları hariç tut)
        /// </summary>
        public bool OnlyParentTasks { get; set; } = false;
    }

    /// <summary>
    /// Task completion işlemi için kullanılan DTO
    /// Task'i tamamlama/tamamlamayı geri alma için
    /// </summary>
    public class CompleteTaskDto
    {
        /// <summary>
        /// Task tamamlandı mı?
        /// true: tamamla, false: tamamlamayı geri al
        /// </summary>
        public bool IsCompleted { get; set; }

        /// <summary>
        /// Tamamlanma yüzdesi
        /// Tamamlandıysa genellikle 100, değilse önceki değer
        /// </summary>
        [Range(0, 100, ErrorMessage = "Tamamlanma yüzdesi 0-100 arasında olmalıdır")]
        public int? CompletionPercentage { get; set; }

        /// <summary>
        /// Tamamlama ile ilgili not
        /// İsteğe bağlı açıklama
        /// </summary>
        [StringLength(1000, ErrorMessage = "Not en fazla 1000 karakter olabilir")]
        public string? CompletionNote { get; set; }
    }
} 