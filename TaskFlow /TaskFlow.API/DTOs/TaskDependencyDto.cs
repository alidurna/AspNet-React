// ****************************************************************************************************
//  TASKDEPENDENCYDTO.CS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının görev bağımlılıkları sistemi için DTO'ları içerir.
//  Bağımlılık oluşturma, güncelleme ve listeleme işlemleri için gerekli tüm DTO'ları sağlar.
//
//  ANA BAŞLIKLAR:
//  - TaskDependencyDto (Ana bağımlılık veri modeli)
//  - CreateTaskDependencyDto (Bağımlılık oluşturma)
//  - UpdateTaskDependencyDto (Bağımlılık güncelleme)
//  - TaskDependencyFilterDto (Bağımlılık filtreleme)
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
//  - Circular dependencies
//  - Self-dependencies
//  - Invalid task references
//  - Large text inputs
//
//  YAN ETKİLER:
//  - Validation affects user experience
//  - Business rules enforce data integrity
//  - Filtering impacts performance
//  - Date validation prevents invalid states
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
using Swashbuckle.AspNetCore.Annotations;
using TaskFlow.API.Models;

namespace TaskFlow.API.DTOs
{
    /// <summary>
    /// Görev bağımlılığı DTO'su
    /// </summary>
    public class TaskDependencyDto
    {
        [SwaggerSchema("Bağımlılık ID'si")]
        public int Id { get; set; }

        [SwaggerSchema("Bağımlı olan görev ID'si")]
        public int DependentTaskId { get; set; }

        [SwaggerSchema("Bağımlı olan görev başlığı")]
        public string DependentTaskTitle { get; set; } = string.Empty;

        [SwaggerSchema("Ön koşul görev ID'si")]
        public int PrerequisiteTaskId { get; set; }

        [SwaggerSchema("Ön koşul görev başlığı")]
        public string PrerequisiteTaskTitle { get; set; } = string.Empty;

        [SwaggerSchema("Bağımlılık türü")]
        public DependencyType DependencyType { get; set; }

        [SwaggerSchema("Bağımlılık açıklaması")]
        public string? Description { get; set; }

        [SwaggerSchema("Oluşturulma tarihi")]
        public DateTime CreatedAt { get; set; }

        [SwaggerSchema("Güncellenme tarihi")]
        public DateTime UpdatedAt { get; set; }

        [SwaggerSchema("Aktif olup olmadığı")]
        public bool IsActive { get; set; }

        [SwaggerSchema("Kullanıcı ID'si")]
        public int UserId { get; set; }

        [SwaggerSchema("Kullanıcı adı")]
        public string UserName { get; set; } = string.Empty;

        // Computed Properties
        [SwaggerSchema("Bağımlılık nedeniyle bloke olup olmadığı")]
        public bool IsBlocked { get; set; }

        [SwaggerSchema("Başlayabilir olup olmadığı")]
        public bool CanStart { get; set; }

        [SwaggerSchema("Ön koşul görev tamamlanmış mı")]
        public bool IsPrerequisiteCompleted { get; set; }
    }

    /// <summary>
    /// Yeni bağımlılık oluşturmak için kullanılan DTO
    /// </summary>
    public class CreateTaskDependencyDto
    {
        /// <summary>
        /// Bağımlı olan görev ID'si
        /// </summary>
        [Required(ErrorMessage = "Bağımlı görev ID'si gereklidir")]
        [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir bağımlı görev ID'si giriniz")]
        public int DependentTaskId { get; set; }

        /// <summary>
        /// Ön koşul görev ID'si
        /// </summary>
        [Required(ErrorMessage = "Ön koşul görev ID'si gereklidir")]
        [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir ön koşul görev ID'si giriniz")]
        public int PrerequisiteTaskId { get; set; }

        /// <summary>
        /// Bağımlılık türü
        /// </summary>
        public DependencyType DependencyType { get; set; } = DependencyType.FinishToStart;

        /// <summary>
        /// Bağımlılık açıklaması
        /// </summary>
        [StringLength(500, ErrorMessage = "Açıklama en fazla 500 karakter olabilir")]
        public string? Description { get; set; }
    }

    /// <summary>
    /// Bağımlılık güncellemek için kullanılan DTO
    /// </summary>
    public class UpdateTaskDependencyDto
    {
        /// <summary>
        /// Bağımlılık türü
        /// </summary>
        public DependencyType? DependencyType { get; set; }

        /// <summary>
        /// Bağımlılık açıklaması
        /// </summary>
        [StringLength(500, ErrorMessage = "Açıklama en fazla 500 karakter olabilir")]
        public string? Description { get; set; }

        /// <summary>
        /// Aktif olup olmadığı
        /// </summary>
        public bool? IsActive { get; set; }
    }

    /// <summary>
    /// Bağımlılık filtreleme için kullanılan DTO
    /// </summary>
    public class TaskDependencyFilterDto
    {
        /// <summary>
        /// Bağımlı görev ID'si
        /// </summary>
        public int? DependentTaskId { get; set; }

        /// <summary>
        /// Ön koşul görev ID'si
        /// </summary>
        public int? PrerequisiteTaskId { get; set; }

        /// <summary>
        /// Bağımlılık türü
        /// </summary>
        public DependencyType? DependencyType { get; set; }

        /// <summary>
        /// Aktif olup olmadığı
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// Sayfa numarası
        /// </summary>
        [Range(1, int.MaxValue, ErrorMessage = "Sayfa numarası 1'den büyük olmalıdır")]
        public int Page { get; set; } = 1;

        /// <summary>
        /// Sayfa boyutu
        /// </summary>
        [Range(1, 100, ErrorMessage = "Sayfa boyutu 1-100 arasında olmalıdır")]
        public int PageSize { get; set; } = 20;

        /// <summary>
        /// Sıralama alanı
        /// </summary>
        public string SortBy { get; set; } = "CreatedAt";

        /// <summary>
        /// Artan sıralama
        /// </summary>
        public bool SortAscending { get; set; } = false;
    }
} 