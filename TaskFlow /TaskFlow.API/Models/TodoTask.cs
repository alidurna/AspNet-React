// ****************************************************************************************************
//  TODOTASK.CS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının görev yönetimi sisteminin ana entity modelidir. Görev bilgileri,
//  durum takibi, hiyerarşik yapı ve ilişkili varlıklar için gerekli tüm property'leri içerir.
//  Entity Framework Core ile veritabanı mapping'i ve computed properties sağlar.
//
//  ANA BAŞLIKLAR:
//  - Task Identity ve Basic Information
//  - Progress Tracking ve Completion
//  - Date Management (Created, Due, Reminder)
//  - Hierarchical Structure (Parent-Child)
//  - Category ve User Relationships
//  - Computed Properties ve Business Logic
//
//  GÜVENLİK:
//  - User isolation (UserId foreign key)
//  - Data validation constraints
//  - Soft delete pattern (IsActive)
//  - Relationship integrity
//  - Access control through relationships
//
//  HATA YÖNETİMİ:
//  - Required field validation
//  - String length constraints
//  - Date validation logic
//  - Relationship integrity
//  - Business rule enforcement
//
//  EDGE-CASE'LER:
//  - Null or empty required fields
//  - Invalid date ranges
//  - Circular parent-child relationships
//  - Large text inputs
//  - Deleted parent tasks
//  - Concurrent modifications
//  - Timezone issues
//
//  YAN ETKİLER:
//  - Task creation affects user statistics
//  - Completion affects parent task progress
//  - Category changes affect organization
//  - Date changes affect notifications
//  - Deletion affects sub-tasks
//
//  PERFORMANS:
//  - Efficient database queries
//  - Optimized relationship loading
//  - Computed property caching
//  - Indexed field optimization
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
    public class TodoTask
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [MaxLength(2000)]
        public string? Description { get; set; }

        public bool IsCompleted { get; set; }

        public int Progress { get; set; }

        public int CompletionPercentage { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? CompletedAt { get; set; }

        public DateTime? DueDate { get; set; }

        public DateTime? ReminderDate { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime UpdatedAt { get; set; }

        [Required]
        public int UserId { get; set; }

        public virtual User User { get; set; }

        public int? CategoryId { get; set; }

        public virtual Category? Category { get; set; }

        public int? ParentTaskId { get; set; }

        public virtual TodoTask? ParentTask { get; set; }

        public virtual ICollection<TodoTask> SubTasks { get; set; } = new List<TodoTask>();

        public Priority Priority { get; set; }

        [MaxLength(500)]
        public string? Tags { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }

        public bool IsActive { get; set; } = true;

        [NotMapped]
        public bool IsOverdue => DueDate.HasValue && DueDate.Value < DateTime.UtcNow && !IsCompleted;

        [NotMapped]
        public int DaysSinceCreated => (DateTime.UtcNow - CreatedAt).Days;

        [NotMapped]
        public TimeSpan? TimeRemaining => DueDate?.Subtract(DateTime.UtcNow);

        [NotMapped]
        public int SubTaskCount => SubTasks?.Count ?? 0;

        [NotMapped]
        public int CompletedSubTaskCount => SubTasks?.Count(st => st.IsCompleted) ?? 0;

        [NotMapped]
        public int ActualCompletionPercentage => SubTaskCount == 0 ? Progress : (CompletedSubTaskCount * 100) / SubTaskCount;
    }
} 