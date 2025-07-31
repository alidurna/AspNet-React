// ****************************************************************************************************
//  TODOTASKDTO.CS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının görev yönetimi sisteminin ana DTO (Data Transfer Object) dosyasıdır.
//  Görev oluşturma, güncelleme, filtreleme ve tamamlama işlemleri için gerekli tüm DTO'ları içerir.
//  Validation attribute'ları ile input kontrolü ve business rule enforcement sağlar.
//
//  ANA BAŞLIKLAR:
//  - TodoTaskDto (Ana görev veri modeli)
//  - CreateTodoTaskDto (Görev oluşturma)
//  - UpdateTodoTaskDto (Görev güncelleme)
//  - TodoTaskFilterDto (Görev filtreleme)
//  - CompleteTaskDto (Görev tamamlama)
//  - Validation ve Business Rules
//
//  GÜVENLİK:
//  - Input validation ve sanitization
//  - Business rule enforcement
//  - Data type validation
//  - Range checking
//  - String length limits
//
//  HATA YÖNETİMİ:
//  - Comprehensive validation attributes
//  - Custom validation methods
//  - Business rule validation
//  - Error message localization
//  - Graceful validation failures
//
//  EDGE-CASE'LER:
//  - Null or empty required fields
//  - Invalid date ranges
//  - Circular parent-child relationships
//  - Large text inputs
//  - Invalid priority values
//  - Past due dates
//  - Unicode characters
//
//  YAN ETKİLER:
//  - Validation affects user experience
//  - Business rules enforce data integrity
//  - Filtering impacts performance
//  - Date validation prevents invalid states
//  - String limits prevent overflow
//
//  PERFORMANS:
//  - Efficient validation
//  - Optimized filtering
//  - Minimal memory usage
//  - Fast serialization
//  - Efficient database queries
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Clear separation of concerns
//  - Comprehensive documentation
//  - Extensible validation system
//  - Backward compatibility
//  - Configuration-based rules
// ****************************************************************************************************
using System.ComponentModel.DataAnnotations;
using TaskFlow.API.Models;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    public class TodoTaskDto
    {
        
        public int Id { get; set; }

        [SwaggerSchema("Görev başlığı")]
        public string Title { get; set; } = string.Empty;

        [SwaggerSchema("Görev açıklaması")]
        public string? Description { get; set; }

        
        public bool IsCompleted { get; set; }

        
        public int Progress { get; set; }

        [SwaggerSchema("Oluşturulma tarihi")]
        public DateTime CreatedAt { get; set; }

        [SwaggerSchema("Tamamlanma tarihi")]
        public DateTime? CompletedAt { get; set; }

        [SwaggerSchema("Bitiş tarihi")]
        public DateTime? DueDate { get; set; }

        [SwaggerSchema("Hatırlatma tarihi")]
        public DateTime? ReminderDate { get; set; }

        [SwaggerSchema("Başlangıç tarihi")]
        public DateTime? StartDate { get; set; }

        [SwaggerSchema("Görev önceliği")]
        public Priority Priority { get; set; }

        [SwaggerSchema("Etiketler (virgülle ayrılmış)")] 
        public string? Tags { get; set; }

        [SwaggerSchema("Ek notlar")]
        public string? Notes { get; set; }

        
        public int UserId { get; set; }

        [SwaggerSchema("Kullanıcı adı")]
        public string UserName { get; set; } = string.Empty;

        
        public int? CategoryId { get; set; }

        [SwaggerSchema("Kategori adı")]
        public string CategoryName { get; set; } = string.Empty;

        [SwaggerSchema("Kategori rengi")]
        public string CategoryColor { get; set; } = string.Empty;

        
        public bool IsOverdue { get; set; }

        
        public int? DaysUntilDue { get; set; }

        
        public int CompletionPercentage { get; set; }

        
        public bool IsActive { get; set; } = true;

        [SwaggerSchema("Kategori detayları")]
        public virtual CategoryDto? Category { get; set; }

        
        public int? ParentTaskId { get; set; }

        [SwaggerSchema("Üst görev detayları")]
        public virtual TodoTaskDto? ParentTask { get; set; }

        [SwaggerSchema("Alt görevler listesi")]
        public virtual ICollection<TodoTaskDto> SubTasks { get; set; } = new List<TodoTaskDto>();

        
        public int? AssignedUserId { get; set; }

        [SwaggerSchema("Atanan kullanıcı adı")]
        public string? AssignedUserName { get; set; }

        [SwaggerSchema("Görevin güncellenme tarihi")]
        public DateTime? UpdatedAt { get; set; }
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
        public int Priority { get; set; } = 1; // 0: Low, 1: Normal, 2: High, 3: Critical

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