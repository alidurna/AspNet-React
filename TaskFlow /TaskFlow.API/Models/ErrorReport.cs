/**
 * ErrorReport Model
 *
 * Bu dosya, TaskFlow uygulamasında hata raporlarını
 * temsil eden model sınıfını içerir. Hata izleme,
 * raporlama ve analiz için kullanılır.
 *
 * Ana Özellikler:
 * - Error tracking
 * - Error categorization
 * - Severity classification
 * - Context preservation
 * - Recovery tracking
 *
 * Error Types:
 * - JavaScript errors
 * - Network errors
 * - React component errors
 * - API errors
 * - Performance errors
 * - User interaction errors
 *
 * Database Features:
 * - Indexed fields for performance
 * - JSON properties for flexibility
 * - Audit fields for tracking
 * - Soft delete support
 * - Partitioning support
 *
 * Security:
 * - Error sanitization
 * - Privacy compliance
 * - Access control
 * - Audit logging
 * - Data retention
 *
 * Performance:
 * - Efficient querying
 * - Batch processing
 * - Archival strategies
 * - Compression support
 * - Caching integration
 *
 * Sürdürülebilirlik:
 * - Clear documentation
 * - Type safety
 * - Validation rules
 * - Migration support
 * - Versioning strategy
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace TaskFlow.API.Models;

/// <summary>
/// Error Report Model - Hata raporlarını takip eden model
/// </summary>
[Table("ErrorReports")]
public class ErrorReport
{
    /// <summary>
    /// Unique identifier for the error report
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Error message
    /// </summary>
    [Required]
    [MaxLength(500)]
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Error name/type
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Error severity level
    /// </summary>
    [Required]
    [MaxLength(20)]
    public string Severity { get; set; } = "medium";

    /// <summary>
    /// Error category
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = "unknown";

    /// <summary>
    /// User session identifier
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string SessionId { get; set; } = string.Empty;

    /// <summary>
    /// User identifier (nullable for anonymous users)
    /// </summary>
    public int? UserId { get; set; }

    /// <summary>
    /// URL where the error occurred
    /// </summary>
    [Required]
    [MaxLength(500)]
    public string Url { get; set; } = string.Empty;

    /// <summary>
    /// User agent string
    /// </summary>
    [MaxLength(500)]
    public string? UserAgent { get; set; }

    /// <summary>
    /// Error context as JSON
    /// </summary>
    [Column(TypeName = "jsonb")]
    public JsonDocument? Context { get; set; }

    /// <summary>
    /// Error fingerprint for deduplication
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string Fingerprint { get; set; } = string.Empty;

    /// <summary>
    /// Number of occurrences of this error
    /// </summary>
    public int Occurrences { get; set; } = 1;

    /// <summary>
    /// First time this error was seen
    /// </summary>
    [Required]
    public DateTime FirstSeen { get; set; }

    /// <summary>
    /// Last time this error was seen
    /// </summary>
    [Required]
    public DateTime LastSeen { get; set; }

    /// <summary>
    /// Whether the error has been resolved
    /// </summary>
    public bool Resolved { get; set; } = false;

    /// <summary>
    /// Resolution timestamp
    /// </summary>
    public DateTime? ResolvedAt { get; set; }

    /// <summary>
    /// User who resolved the error
    /// </summary>
    public int? ResolvedBy { get; set; }

    /// <summary>
    /// Resolution notes
    /// </summary>
    [MaxLength(1000)]
    public string? ResolutionNotes { get; set; }

    /// <summary>
    /// User impact assessment
    /// </summary>
    [Required]
    [MaxLength(20)]
    public string UserImpact { get; set; } = "low";

    /// <summary>
    /// Recovery suggestion
    /// </summary>
    [MaxLength(500)]
    public string? RecoverySuggestion { get; set; }

    /// <summary>
    /// Stack trace (sanitized)
    /// </summary>
    [Column(TypeName = "text")]
    public string? StackTrace { get; set; }

    /// <summary>
    /// Component stack (for React errors)
    /// </summary>
    [Column(TypeName = "text")]
    public string? ComponentStack { get; set; }

    /// <summary>
    /// User actions leading to the error
    /// </summary>
    [Column(TypeName = "jsonb")]
    public JsonDocument? UserActions { get; set; }

    /// <summary>
    /// Performance metrics at error time
    /// </summary>
    [Column(TypeName = "jsonb")]
    public JsonDocument? PerformanceMetrics { get; set; }

    /// <summary>
    /// Network information at error time
    /// </summary>
    [Column(TypeName = "jsonb")]
    public JsonDocument? NetworkInfo { get; set; }

    /// <summary>
    /// Error tags for categorization
    /// </summary>
    [Column(TypeName = "jsonb")]
    public JsonDocument? Tags { get; set; }

    /// <summary>
    /// Error properties as JSON
    /// </summary>
    [Column(TypeName = "jsonb")]
    public JsonDocument? Properties { get; set; }

    /// <summary>
    /// IP address of the user (anonymized)
    /// </summary>
    [MaxLength(45)]
    public string? IpAddress { get; set; }

    /// <summary>
    /// Geographic location (country/city)
    /// </summary>
    [MaxLength(100)]
    public string? Location { get; set; }

    /// <summary>
    /// Device type (mobile, desktop, tablet)
    /// </summary>
    [MaxLength(20)]
    public string? DeviceType { get; set; }

    /// <summary>
    /// Browser information
    /// </summary>
    [MaxLength(100)]
    public string? Browser { get; set; }

    /// <summary>
    /// Operating system
    /// </summary>
    [MaxLength(50)]
    public string? OperatingSystem { get; set; }

    /// <summary>
    /// Error priority (low, medium, high, critical)
    /// </summary>
    [MaxLength(20)]
    public string Priority { get; set; } = "medium";

    /// <summary>
    /// Whether the error is being monitored
    /// </summary>
    public bool IsMonitored { get; set; } = true;

    /// <summary>
    /// Error trend (increasing, decreasing, stable)
    /// </summary>
    [MaxLength(20)]
    public string Trend { get; set; } = "stable";

    /// <summary>
    /// Error trend percentage
    /// </summary>
    public decimal? TrendPercentage { get; set; }

    /// <summary>
    /// Created timestamp
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Updated timestamp
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Soft delete flag
    /// </summary>
    public bool IsDeleted { get; set; } = false;

    /// <summary>
    /// Deleted timestamp
    /// </summary>
    public DateTime? DeletedAt { get; set; }

    // Navigation Properties
    /// <summary>
    /// Associated user
    /// </summary>
    [ForeignKey("UserId")]
    public virtual User? User { get; set; }

    /// <summary>
    /// User who resolved the error
    /// </summary>
    [ForeignKey("ResolvedBy")]
    public virtual User? ResolvedByUser { get; set; }

    /// <summary>
    /// Associated session
    /// </summary>
    [ForeignKey("SessionId")]
    public virtual UserSession? Session { get; set; }
} 