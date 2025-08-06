using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskFlow.API.Models
{
    /// <summary>
    /// Görev şablonları için model
    /// </summary>
    public class TaskTemplate
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }

        [Required]
        public int Priority { get; set; } = 1; // 0: Low, 1: Normal, 2: High, 3: Critical

        public int? CategoryId { get; set; }

        [StringLength(500)]
        public string? Tags { get; set; }

        [StringLength(1000)]
        public string? Notes { get; set; }

        public int EstimatedHours { get; set; } = 1;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Foreign Keys
        public int UserId { get; set; }

        // Navigation Properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("CategoryId")]
        public virtual Category? Category { get; set; }
    }
} 