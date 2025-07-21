/**
 * PerformanceMetric Model
 *
 * Bu dosya, TaskFlow uygulamasında performans metriklerini
 * temsil eden model sınıfını içerir. Web Vitals, Core Web Vitals
 * ve custom performans metriklerini takip eder.
 *
 * Ana Özellikler:
 * - Performance tracking
 * - Web Vitals monitoring
 * - Performance scoring
 * - Alert management
 * - Trend analysis
 *
 * Performance Metrics:
 * - Largest Contentful Paint (LCP)
 * - First Input Delay (FID)
 * - Cumulative Layout Shift (CLS)
 * - First Contentful Paint (FCP)
 * - Time to Interactive (TTI)
 * - Total Blocking Time (TBT)
 *
 * Database Features:
 * - Indexed fields for performance
 * - JSON properties for flexibility
 * - Audit fields for tracking
 * - Soft delete support
 * - Partitioning support
 *
 * Security:
 * - Data validation
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
/// Performance Metric Model - Performans metriklerini takip eden model
/// </summary>
[Table("PerformanceMetrics")]
public class PerformanceMetric
{
    /// <summary>
    /// Unique identifier for the performance metric
    /// </summary>
    [Key]
    public Guid Id { get; set; }

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
    /// URL where the metric was measured
    /// </summary>
    [Required]
    [MaxLength(500)]
    public string Url { get; set; } = string.Empty;

    /// <summary>
    /// Metric type (lcp, fid, cls, fcp, tti, tbt, custom)
    /// </summary>
    [Required]
    [MaxLength(20)]
    public string MetricType { get; set; } = string.Empty;

    /// <summary>
    /// Metric value in milliseconds or appropriate unit
    /// </summary>
    [Required]
    public decimal Value { get; set; }

    /// <summary>
    /// Metric unit (ms, score, percentage)
    /// </summary>
    [Required]
    [MaxLength(10)]
    public string Unit { get; set; } = "ms";

    /// <summary>
    /// Performance score (0-100)
    /// </summary>
    public int? Score { get; set; }

    /// <summary>
    /// Whether the metric meets the threshold
    /// </summary>
    public bool MeetsThreshold { get; set; } = true;

    /// <summary>
    /// Threshold value for this metric
    /// </summary>
    public decimal? Threshold { get; set; }

    /// <summary>
    /// User agent string
    /// </summary>
    [MaxLength(500)]
    public string? UserAgent { get; set; }

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
    /// Network connection type
    /// </summary>
    [MaxLength(20)]
    public string? ConnectionType { get; set; }

    /// <summary>
    /// Network effective type
    /// </summary>
    [MaxLength(20)]
    public string? EffectiveType { get; set; }

    /// <summary>
    /// Screen resolution
    /// </summary>
    [MaxLength(20)]
    public string? ScreenResolution { get; set; }

    /// <summary>
    /// Memory usage information
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string? MemoryInfo { get; set; }

    /// <summary>
    /// Navigation timing information
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string? NavigationTiming { get; set; }

    /// <summary>
    /// Resource timing information
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string? ResourceTiming { get; set; }

    /// <summary>
    /// Paint timing information
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string? PaintTiming { get; set; }

    /// <summary>
    /// Custom performance data
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string? CustomData { get; set; }

    /// <summary>
    /// Performance alerts triggered
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string? Alerts { get; set; }

    /// <summary>
    /// Performance tags for categorization
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string? Tags { get; set; }

    /// <summary>
    /// Performance properties as JSON
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string? Properties { get; set; }

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
    /// Performance priority (low, medium, high, critical)
    /// </summary>
    [MaxLength(20)]
    public string Priority { get; set; } = "medium";

    /// <summary>
    /// Whether the metric is being monitored
    /// </summary>
    public bool IsMonitored { get; set; } = true;

    /// <summary>
    /// Performance trend (improving, degrading, stable)
    /// </summary>
    [MaxLength(20)]
    public string Trend { get; set; } = "stable";

    /// <summary>
    /// Performance trend percentage
    /// </summary>
    public decimal? TrendPercentage { get; set; }

    /// <summary>
    /// Timestamp when the metric was measured
    /// </summary>
    [Required]
    public DateTime Timestamp { get; set; }

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