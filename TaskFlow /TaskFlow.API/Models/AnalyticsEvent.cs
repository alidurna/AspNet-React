/**
 * AnalyticsEvent Model
 *
 * Bu dosya, TaskFlow uygulamasında analytics event'lerini
 * temsil eden model sınıfını içerir. Kullanıcı davranışlarını,
 * sayfa görüntülemelerini ve etkileşimleri takip eder.
 *
 * Ana Özellikler:
 * - Event tracking
 * - User behavior analysis
 * - Session management
 * - Performance monitoring
 * - Error tracking
 *
 * Event Types:
 * - Page views
 * - User interactions
 * - Form submissions
 * - Navigation events
 * - Error occurrences
 * - Performance metrics
 *
 * Database Features:
 * - Indexed fields for performance
 * - JSON properties for flexibility
 * - Audit fields for tracking
 * - Soft delete support
 * - Partitioning support
 *
 * Security:
 * - Data anonymization
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
/// Analytics Event Model - Kullanıcı davranışlarını takip eden model
/// </summary>
[Table("AnalyticsEvents")]
public class AnalyticsEvent
{
    /// <summary>
    /// Unique identifier for the analytics event
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Type of the analytics event
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string EventType { get; set; } = string.Empty;

    /// <summary>
    /// Name of the event
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string EventName { get; set; } = string.Empty;

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
    /// Page where the event occurred
    /// </summary>
    [Required]
    [MaxLength(200)]
    public string Page { get; set; } = string.Empty;

    /// <summary>
    /// User agent string
    /// </summary>
    [MaxLength(500)]
    public string? UserAgent { get; set; }

    /// <summary>
    /// Screen resolution
    /// </summary>
    [MaxLength(20)]
    public string? ScreenResolution { get; set; }

    /// <summary>
    /// User language
    /// </summary>
    [MaxLength(10)]
    public string? Language { get; set; }

    /// <summary>
    /// Event properties as JSON
    /// </summary>
    [Column(TypeName = "jsonb")]
    public JsonDocument? Properties { get; set; }

    /// <summary>
    /// Timestamp when the event occurred
    /// </summary>
    [Required]
    public DateTime Timestamp { get; set; }

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
    /// Referrer URL
    /// </summary>
    [MaxLength(500)]
    public string? Referrer { get; set; }

    /// <summary>
    /// UTM parameters
    /// </summary>
    [Column(TypeName = "jsonb")]
    public JsonDocument? UtmParameters { get; set; }

    /// <summary>
    /// Event duration in milliseconds
    /// </summary>
    public int? Duration { get; set; }

    /// <summary>
    /// Whether the event was successful
    /// </summary>
    public bool IsSuccessful { get; set; } = true;

    /// <summary>
    /// Error message if the event failed
    /// </summary>
    [MaxLength(500)]
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Event fingerprint for deduplication
    /// </summary>
    [MaxLength(100)]
    public string? Fingerprint { get; set; }

    /// <summary>
    /// Event priority (low, medium, high, critical)
    /// </summary>
    [MaxLength(20)]
    public string Priority { get; set; } = "medium";

    /// <summary>
    /// Tags for categorization
    /// </summary>
    [Column(TypeName = "jsonb")]
    public JsonDocument? Tags { get; set; }

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
    /// Associated session
    /// </summary>
    [ForeignKey("SessionId")]
    public virtual UserSession? Session { get; set; }
} 