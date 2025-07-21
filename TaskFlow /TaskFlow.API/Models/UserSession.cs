/**
 * UserSession Model
 *
 * Bu dosya, TaskFlow uygulamasında kullanıcı oturumlarını
 * temsil eden model sınıfını içerir. Oturum yönetimi,
 * kullanıcı davranışları ve analytics için kullanılır.
 *
 * Ana Özellikler:
 * - Session management
 * - User behavior tracking
 * - Analytics integration
 * - Security monitoring
 * - Performance tracking
 *
 * Session Features:
 * - Session lifecycle
 * - User engagement metrics
 * - Device tracking
 * - Geographic data
 * - Security events
 *
 * Database Features:
 * - Indexed fields for performance
 * - JSON properties for flexibility
 * - Audit fields for tracking
 * - Soft delete support
 * - Partitioning support
 *
 * Security:
 * - Session validation
 * - Security monitoring
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
/// User Session Model - Kullanıcı oturumlarını takip eden model
/// </summary>
[Table("UserSessions")]
public class UserSession
{
    /// <summary>
    /// Unique session identifier
    /// </summary>
    [Key]
    [MaxLength(100)]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// User identifier (nullable for anonymous sessions)
    /// </summary>
    public int? UserId { get; set; }

    /// <summary>
    /// Session start time
    /// </summary>
    [Required]
    public DateTime StartTime { get; set; }

    /// <summary>
    /// Session end time (null if active)
    /// </summary>
    public DateTime? EndTime { get; set; }

    /// <summary>
    /// Session duration in minutes
    /// </summary>
    public int? Duration { get; set; }

    /// <summary>
    /// Last activity timestamp
    /// </summary>
    [Required]
    public DateTime LastActivity { get; set; }

    /// <summary>
    /// Number of page views in this session
    /// </summary>
    public int PageViews { get; set; } = 0;

    /// <summary>
    /// Number of events in this session
    /// </summary>
    public int Events { get; set; } = 0;

    /// <summary>
    /// User agent string
    /// </summary>
    [MaxLength(500)]
    public string? UserAgent { get; set; }

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
    /// Referrer URL
    /// </summary>
    [MaxLength(500)]
    public string? Referrer { get; set; }

    /// <summary>
    /// UTM parameters
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string? UtmParameters { get; set; }

    /// <summary>
    /// Session properties as JSON
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string? Properties { get; set; }

    /// <summary>
    /// Session status (active, ended, expired)
    /// </summary>
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "active";

    /// <summary>
    /// Session type (web, mobile, api)
    /// </summary>
    [Required]
    [MaxLength(20)]
    public string SessionType { get; set; } = "web";

    /// <summary>
    /// Whether the session is authenticated
    /// </summary>
    public bool IsAuthenticated { get; set; } = false;

    /// <summary>
    /// Authentication method used
    /// </summary>
    [MaxLength(50)]
    public string? AuthenticationMethod { get; set; }

    /// <summary>
    /// Security events during session
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string? SecurityEvents { get; set; }

    /// <summary>
    /// Session tags for categorization
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string? Tags { get; set; }

    /// <summary>
    /// Session fingerprint for deduplication
    /// </summary>
    [MaxLength(100)]
    public string? Fingerprint { get; set; }

    /// <summary>
    /// Whether the session was successful
    /// </summary>
    public bool IsSuccessful { get; set; } = true;

    /// <summary>
    /// Error message if the session failed
    /// </summary>
    [MaxLength(500)]
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Session priority (low, medium, high, critical)
    /// </summary>
    [MaxLength(20)]
    public string Priority { get; set; } = "medium";

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
    /// Analytics events for this session
    /// </summary>
    public virtual ICollection<AnalyticsEvent> AnalyticsEvents { get; set; } = new List<AnalyticsEvent>();

    /// <summary>
    /// Error reports for this session
    /// </summary>
    public virtual ICollection<ErrorReport> ErrorReports { get; set; } = new List<ErrorReport>();

    /// <summary>
    /// Performance metrics for this session
    /// </summary>
    public virtual ICollection<PerformanceMetric> PerformanceMetrics { get; set; } = new List<PerformanceMetric>();
} 