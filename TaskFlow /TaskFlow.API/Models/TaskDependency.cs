// ****************************************************************************************************
//  TASKDEPENDENCY.CS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının görev bağımlılıkları sisteminin ana entity modelidir.
//  Görevler arası bağımlılık ilişkilerini tanımlar ve yönetir.
//
//  ANA BAŞLIKLAR:
//  - Task Dependency Relationships
//  - Dependency Types (Finish-to-Start, Start-to-Start, etc.)
//  - Dependency Validation
//  - Circular Dependency Prevention
//
//  GÜVENLİK:
//  - User isolation (UserId foreign key)
//  - Circular dependency detection
//  - Data validation constraints
//  - Relationship integrity
//
//  HATA YÖNETİMİ:
//  - Circular dependency validation
//  - Self-dependency prevention
//  - Invalid task reference handling
//  - Business rule enforcement
//
//  EDGE-CASE'LER:
//  - Circular dependencies
//  - Self-dependencies
//  - Deleted dependent tasks
//  - Concurrent modifications
//  - Deep dependency chains
//
//  YAN ETKİLER:
//  - Dependency affects task scheduling
//  - Completion affects dependent tasks
//  - Deletion affects dependency chains
//  - Progress updates affect dependencies
//
//  PERFORMANS:
//  - Efficient dependency queries
//  - Optimized relationship loading
//  - Indexed foreign keys
//  - Lazy loading support
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Clear entity design
//  - Comprehensive documentation
//  - Extensible model structure
//  - Backward compatibility
//  - Migration-friendly design
// ****************************************************************************************************

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskFlow.API.Models
{
    /// <summary>
    /// Görev bağımlılıkları için entity model
    /// Bir görevin başka bir göreve olan bağımlılığını tanımlar
    /// </summary>
    public class TaskDependency
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        /// <summary>
        /// Bağımlı olan görev (dependent task)
        /// Bu görev, prerequisite task tamamlanmadan başlayamaz
        /// </summary>
        [Required]
        public int DependentTaskId { get; set; }

        /// <summary>
        /// Ön koşul görev (prerequisite task)
        /// Bu görev tamamlanmadan dependent task başlayamaz
        /// </summary>
        [Required]
        public int PrerequisiteTaskId { get; set; }

        /// <summary>
        /// Bağımlılık türü
        /// </summary>
        [Required]
        public DependencyType DependencyType { get; set; } = DependencyType.FinishToStart;

        /// <summary>
        /// Bağımlılık açıklaması (opsiyonel)
        /// </summary>
        [MaxLength(500)]
        public string? Description { get; set; }

        /// <summary>
        /// Bağımlılığın oluşturulma tarihi
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Bağımlılığın güncellenme tarihi
        /// </summary>
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Bağımlılığın aktif olup olmadığı
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Bağımlılığı oluşturan kullanıcı
        /// </summary>
        [Required]
        public int UserId { get; set; }

        // Navigation Properties
        public virtual TodoTask DependentTask { get; set; } = null!;
        public virtual TodoTask PrerequisiteTask { get; set; } = null!;
        public virtual User User { get; set; } = null!;

        // Computed Properties
        [NotMapped]
        public bool IsBlocked => !PrerequisiteTask.IsCompleted;

        [NotMapped]
        public bool CanStart => PrerequisiteTask.IsCompleted;
    }

    /// <summary>
    /// Bağımlılık türleri
    /// </summary>
    public enum DependencyType
    {
        /// <summary>
        /// Finish-to-Start: Ön koşul görev bitmeden bağımlı görev başlayamaz
        /// En yaygın bağımlılık türü
        /// </summary>
        FinishToStart = 0,

        /// <summary>
        /// Start-to-Start: Ön koşul görev başlamadan bağımlı görev başlayamaz
        /// </summary>
        StartToStart = 1,

        /// <summary>
        /// Finish-to-Finish: Ön koşul görev bitmeden bağımlı görev bitemez
        /// </summary>
        FinishToFinish = 2,

        /// <summary>
        /// Start-to-Finish: Ön koşul görev başlamadan bağımlı görev bitemez
        /// </summary>
        StartToFinish = 3
    }
} 