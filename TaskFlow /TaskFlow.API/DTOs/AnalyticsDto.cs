/**
 * Analytics DTOs
 *
 * Bu dosya, TaskFlow uygulamasında analytics verilerini
 * API'de kullanmak için DTO (Data Transfer Object) sınıflarını içerir.
 * Frontend ile backend arasında veri transferi için kullanılır.
 *
 * Ana Özellikler:
 * - Request/Response DTOs
 * - Validation attributes
 * - Type safety
 * - Documentation
 * - Performance optimization
 *
 * DTO Types:
 * - Analytics Event DTOs
 * - User Session DTOs
 * - Error Report DTOs
 * - Performance Metric DTOs
 * - Dashboard DTOs
 *
 * Validation:
 * - Required fields
 * - String length limits
 * - Data type validation
 * - Custom validation rules
 * - Error messages
 *
 * Performance:
 * - Efficient serialization
 * - Minimal data transfer
 * - Caching support
 * - Compression ready
 * - Batch processing
 *
 * Sürdürülebilirlik:
 * - Clear documentation
 * - Type safety
 * - Validation rules
 * - Versioning support
 * - Migration friendly
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace TaskFlow.API.DTOs;

#region Analytics Event DTOs

/// <summary>
/// Analytics Event Request DTO
/// </summary>
public class AnalyticsEventRequestDto
{
    /// <summary>
    /// Event type
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string EventType { get; set; } = string.Empty;

    /// <summary>
    /// Event name
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string EventName { get; set; } = string.Empty;

    /// <summary>
    /// Session ID
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string SessionId { get; set; } = string.Empty;

    /// <summary>
    /// User ID (optional for anonymous users)
    /// </summary>
    public int? UserId { get; set; }

    /// <summary>
    /// Page where event occurred
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
    /// Event properties
    /// </summary>
    public JsonDocument? Properties { get; set; }

    /// <summary>
    /// Event timestamp
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// IP address (anonymized)
    /// </summary>
    [MaxLength(45)]
    public string? IpAddress { get; set; }

    /// <summary>
    /// Geographic location
    /// </summary>
    [MaxLength(100)]
    public string? Location { get; set; }

    /// <summary>
    /// Device type
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
    public JsonDocument? UtmParameters { get; set; }

    /// <summary>
    /// Event duration in milliseconds
    /// </summary>
    public int? Duration { get; set; }

    /// <summary>
    /// Whether event was successful
    /// </summary>
    public bool IsSuccessful { get; set; } = true;

    /// <summary>
    /// Error message if event failed
    /// </summary>
    [MaxLength(500)]
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Event fingerprint for deduplication
    /// </summary>
    [MaxLength(100)]
    public string? Fingerprint { get; set; }

    /// <summary>
    /// Event priority
    /// </summary>
    [MaxLength(20)]
    public string Priority { get; set; } = "medium";

    /// <summary>
    /// Event tags
    /// </summary>
    public JsonDocument? Tags { get; set; }
}

/// <summary>
/// Analytics Event Response DTO
/// </summary>
public class AnalyticsEventResponseDto
{
    /// <summary>
    /// Event ID
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Event type
    /// </summary>
    public string EventType { get; set; } = string.Empty;

    /// <summary>
    /// Event name
    /// </summary>
    public string EventName { get; set; } = string.Empty;

    /// <summary>
    /// Session ID
    /// </summary>
    public string SessionId { get; set; } = string.Empty;

    /// <summary>
    /// User ID
    /// </summary>
    public int? UserId { get; set; }

    /// <summary>
    /// Page where event occurred
    /// </summary>
    public string Page { get; set; } = string.Empty;

    /// <summary>
    /// Event timestamp
    /// </summary>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// Whether event was successful
    /// </summary>
    public bool IsSuccessful { get; set; }

    /// <summary>
    /// Event priority
    /// </summary>
    public string Priority { get; set; } = string.Empty;

    /// <summary>
    /// Created timestamp
    /// </summary>
    public DateTime CreatedAt { get; set; }
}

#endregion

#region User Session DTOs

/// <summary>
/// User Session Request DTO
/// </summary>
public class UserSessionRequestDto
{
    /// <summary>
    /// Session ID
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// User ID (optional for anonymous sessions)
    /// </summary>
    public int? UserId { get; set; }

    /// <summary>
    /// Session start time
    /// </summary>
    public DateTime StartTime { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Session end time
    /// </summary>
    public DateTime? EndTime { get; set; }

    /// <summary>
    /// Session duration in minutes
    /// </summary>
    public int? Duration { get; set; }

    /// <summary>
    /// Last activity timestamp
    /// </summary>
    public DateTime LastActivity { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Number of page views
    /// </summary>
    public int PageViews { get; set; } = 0;

    /// <summary>
    /// Number of events
    /// </summary>
    public int Events { get; set; } = 0;

    /// <summary>
    /// User agent string
    /// </summary>
    [MaxLength(500)]
    public string? UserAgent { get; set; }

    /// <summary>
    /// IP address (anonymized)
    /// </summary>
    [MaxLength(45)]
    public string? IpAddress { get; set; }

    /// <summary>
    /// Geographic location
    /// </summary>
    [MaxLength(100)]
    public string? Location { get; set; }

    /// <summary>
    /// Device type
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
    public JsonDocument? UtmParameters { get; set; }

    /// <summary>
    /// Session properties
    /// </summary>
    public JsonDocument? Properties { get; set; }

    /// <summary>
    /// Session status
    /// </summary>
    [MaxLength(20)]
    public string Status { get; set; } = "active";

    /// <summary>
    /// Session type
    /// </summary>
    [MaxLength(20)]
    public string SessionType { get; set; } = "web";

    /// <summary>
    /// Whether session is authenticated
    /// </summary>
    public bool IsAuthenticated { get; set; } = false;

    /// <summary>
    /// Authentication method
    /// </summary>
    [MaxLength(50)]
    public string? AuthenticationMethod { get; set; }

    /// <summary>
    /// Security events
    /// </summary>
    public JsonDocument? SecurityEvents { get; set; }

    /// <summary>
    /// Performance metrics
    /// </summary>
    public JsonDocument? PerformanceMetrics { get; set; }

    /// <summary>
    /// Session tags
    /// </summary>
    public JsonDocument? Tags { get; set; }

    /// <summary>
    /// Session fingerprint
    /// </summary>
    [MaxLength(100)]
    public string? Fingerprint { get; set; }

    /// <summary>
    /// Whether session was successful
    /// </summary>
    public bool IsSuccessful { get; set; } = true;

    /// <summary>
    /// Error message if session failed
    /// </summary>
    [MaxLength(500)]
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Session priority
    /// </summary>
    [MaxLength(20)]
    public string Priority { get; set; } = "medium";
}

/// <summary>
/// User Session Response DTO
/// </summary>
public class UserSessionResponseDto
{
    /// <summary>
    /// Session ID
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// User ID
    /// </summary>
    public int? UserId { get; set; }

    /// <summary>
    /// Session start time
    /// </summary>
    public DateTime StartTime { get; set; }

    /// <summary>
    /// Session end time
    /// </summary>
    public DateTime? EndTime { get; set; }

    /// <summary>
    /// Session duration in minutes
    /// </summary>
    public int? Duration { get; set; }

    /// <summary>
    /// Last activity timestamp
    /// </summary>
    public DateTime LastActivity { get; set; }

    /// <summary>
    /// Number of page views
    /// </summary>
    public int PageViews { get; set; }

    /// <summary>
    /// Number of events
    /// </summary>
    public int Events { get; set; }

    /// <summary>
    /// Session status
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Session type
    /// </summary>
    public string SessionType { get; set; } = string.Empty;

    /// <summary>
    /// Whether session is authenticated
    /// </summary>
    public bool IsAuthenticated { get; set; }

    /// <summary>
    /// Whether session was successful
    /// </summary>
    public bool IsSuccessful { get; set; }

    /// <summary>
    /// Session priority
    /// </summary>
    public string Priority { get; set; } = string.Empty;

    /// <summary>
    /// Created timestamp
    /// </summary>
    public DateTime CreatedAt { get; set; }
}

#endregion

#region Error Report DTOs

/// <summary>
/// Error Report Request DTO
/// </summary>
public class ErrorReportRequestDto
{
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
    /// Session ID
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string SessionId { get; set; } = string.Empty;

    /// <summary>
    /// User ID (optional for anonymous users)
    /// </summary>
    public int? UserId { get; set; }

    /// <summary>
    /// URL where error occurred
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
    /// Error context
    /// </summary>
    public JsonDocument? Context { get; set; }

    /// <summary>
    /// Error fingerprint
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string Fingerprint { get; set; } = string.Empty;

    /// <summary>
    /// Number of occurrences
    /// </summary>
    public int Occurrences { get; set; } = 1;

    /// <summary>
    /// First time error was seen
    /// </summary>
    public DateTime FirstSeen { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Last time error was seen
    /// </summary>
    public DateTime LastSeen { get; set; } = DateTime.UtcNow;

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
    public string? StackTrace { get; set; }

    /// <summary>
    /// Component stack (for React errors)
    /// </summary>
    public string? ComponentStack { get; set; }

    /// <summary>
    /// User actions leading to error
    /// </summary>
    public JsonDocument? UserActions { get; set; }

    /// <summary>
    /// Performance metrics at error time
    /// </summary>
    public JsonDocument? PerformanceMetrics { get; set; }

    /// <summary>
    /// Network information at error time
    /// </summary>
    public JsonDocument? NetworkInfo { get; set; }

    /// <summary>
    /// Error tags
    /// </summary>
    public JsonDocument? Tags { get; set; }

    /// <summary>
    /// Error properties
    /// </summary>
    public JsonDocument? Properties { get; set; }

    /// <summary>
    /// IP address (anonymized)
    /// </summary>
    [MaxLength(45)]
    public string? IpAddress { get; set; }

    /// <summary>
    /// Geographic location
    /// </summary>
    [MaxLength(100)]
    public string? Location { get; set; }

    /// <summary>
    /// Device type
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
    /// Error priority
    /// </summary>
    [MaxLength(20)]
    public string Priority { get; set; } = "medium";
}

/// <summary>
/// Error Report Response DTO
/// </summary>
public class ErrorReportResponseDto
{
    /// <summary>
    /// Error ID
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Error message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Error name/type
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Error severity level
    /// </summary>
    public string Severity { get; set; } = string.Empty;

    /// <summary>
    /// Error category
    /// </summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Session ID
    /// </summary>
    public string SessionId { get; set; } = string.Empty;

    /// <summary>
    /// User ID
    /// </summary>
    public int? UserId { get; set; }

    /// <summary>
    /// URL where error occurred
    /// </summary>
    public string Url { get; set; } = string.Empty;

    /// <summary>
    /// Error fingerprint
    /// </summary>
    public string Fingerprint { get; set; } = string.Empty;

    /// <summary>
    /// Number of occurrences
    /// </summary>
    public int Occurrences { get; set; }

    /// <summary>
    /// First time error was seen
    /// </summary>
    public DateTime FirstSeen { get; set; }

    /// <summary>
    /// Last time error was seen
    /// </summary>
    public DateTime LastSeen { get; set; }

    /// <summary>
    /// Whether error has been resolved
    /// </summary>
    public bool Resolved { get; set; }

    /// <summary>
    /// User impact assessment
    /// </summary>
    public string UserImpact { get; set; } = string.Empty;

    /// <summary>
    /// Recovery suggestion
    /// </summary>
    public string? RecoverySuggestion { get; set; }

    /// <summary>
    /// Error priority
    /// </summary>
    public string Priority { get; set; } = string.Empty;

    /// <summary>
    /// Whether error is being monitored
    /// </summary>
    public bool IsMonitored { get; set; }

    /// <summary>
    /// Error trend
    /// </summary>
    public string Trend { get; set; } = string.Empty;

    /// <summary>
    /// Created timestamp
    /// </summary>
    public DateTime CreatedAt { get; set; }
}

#endregion

#region Performance Metric DTOs

/// <summary>
/// Performance Metric Request DTO
/// </summary>
public class PerformanceMetricRequestDto
{
    /// <summary>
    /// Session ID
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string SessionId { get; set; } = string.Empty;

    /// <summary>
    /// User ID (optional for anonymous users)
    /// </summary>
    public int? UserId { get; set; }

    /// <summary>
    /// URL where metric was measured
    /// </summary>
    [Required]
    [MaxLength(500)]
    public string Url { get; set; } = string.Empty;

    /// <summary>
    /// Metric type
    /// </summary>
    [Required]
    [MaxLength(20)]
    public string MetricType { get; set; } = string.Empty;

    /// <summary>
    /// Metric value
    /// </summary>
    [Required]
    public decimal Value { get; set; }

    /// <summary>
    /// Metric unit
    /// </summary>
    [Required]
    [MaxLength(10)]
    public string Unit { get; set; } = "ms";

    /// <summary>
    /// Performance score (0-100)
    /// </summary>
    public int? Score { get; set; }

    /// <summary>
    /// Whether metric meets threshold
    /// </summary>
    public bool MeetsThreshold { get; set; } = true;

    /// <summary>
    /// Threshold value
    /// </summary>
    public decimal? Threshold { get; set; }

    /// <summary>
    /// User agent string
    /// </summary>
    [MaxLength(500)]
    public string? UserAgent { get; set; }

    /// <summary>
    /// Device type
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
    public JsonDocument? MemoryInfo { get; set; }

    /// <summary>
    /// Navigation timing information
    /// </summary>
    public JsonDocument? NavigationTiming { get; set; }

    /// <summary>
    /// Resource timing information
    /// </summary>
    public JsonDocument? ResourceTiming { get; set; }

    /// <summary>
    /// Paint timing information
    /// </summary>
    public JsonDocument? PaintTiming { get; set; }

    /// <summary>
    /// Custom performance data
    /// </summary>
    public JsonDocument? CustomData { get; set; }

    /// <summary>
    /// Performance alerts triggered
    /// </summary>
    public JsonDocument? Alerts { get; set; }

    /// <summary>
    /// Performance tags
    /// </summary>
    public JsonDocument? Tags { get; set; }

    /// <summary>
    /// Performance properties
    /// </summary>
    public JsonDocument? Properties { get; set; }

    /// <summary>
    /// IP address (anonymized)
    /// </summary>
    [MaxLength(45)]
    public string? IpAddress { get; set; }

    /// <summary>
    /// Geographic location
    /// </summary>
    [MaxLength(100)]
    public string? Location { get; set; }

    /// <summary>
    /// Performance priority
    /// </summary>
    [MaxLength(20)]
    public string Priority { get; set; } = "medium";

    /// <summary>
    /// Whether metric is being monitored
    /// </summary>
    public bool IsMonitored { get; set; } = true;

    /// <summary>
    /// Performance trend
    /// </summary>
    [MaxLength(20)]
    public string Trend { get; set; } = "stable";

    /// <summary>
    /// Performance trend percentage
    /// </summary>
    public decimal? TrendPercentage { get; set; }

    /// <summary>
    /// Timestamp when metric was measured
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Performance Metric Response DTO
/// </summary>
public class PerformanceMetricResponseDto
{
    /// <summary>
    /// Metric ID
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Session ID
    /// </summary>
    public string SessionId { get; set; } = string.Empty;

    /// <summary>
    /// User ID
    /// </summary>
    public int? UserId { get; set; }

    /// <summary>
    /// URL where metric was measured
    /// </summary>
    public string Url { get; set; } = string.Empty;

    /// <summary>
    /// Metric type
    /// </summary>
    public string MetricType { get; set; } = string.Empty;

    /// <summary>
    /// Metric value
    /// </summary>
    public decimal Value { get; set; }

    /// <summary>
    /// Metric unit
    /// </summary>
    public string Unit { get; set; } = string.Empty;

    /// <summary>
    /// Performance score (0-100)
    /// </summary>
    public int? Score { get; set; }

    /// <summary>
    /// Whether metric meets threshold
    /// </summary>
    public bool MeetsThreshold { get; set; }

    /// <summary>
    /// Threshold value
    /// </summary>
    public decimal? Threshold { get; set; }

    /// <summary>
    /// Performance priority
    /// </summary>
    public string Priority { get; set; } = string.Empty;

    /// <summary>
    /// Whether metric is being monitored
    /// </summary>
    public bool IsMonitored { get; set; }

    /// <summary>
    /// Performance trend
    /// </summary>
    public string Trend { get; set; } = string.Empty;

    /// <summary>
    /// Performance trend percentage
    /// </summary>
    public decimal? TrendPercentage { get; set; }

    /// <summary>
    /// Timestamp when metric was measured
    /// </summary>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// Created timestamp
    /// </summary>
    public DateTime CreatedAt { get; set; }
}

#endregion

#region Dashboard DTOs

/// <summary>
/// Analytics Dashboard Request DTO
/// </summary>
public class AnalyticsDashboardRequestDto
{
    /// <summary>
    /// Time range for analytics data
    /// </summary>
    [Required]
    [MaxLength(10)]
    public string TimeRange { get; set; } = "7d";

    /// <summary>
    /// User ID for filtering (optional)
    /// </summary>
    public int? UserId { get; set; }

    /// <summary>
    /// Session ID for filtering (optional)
    /// </summary>
    [MaxLength(100)]
    public string? SessionId { get; set; }

    /// <summary>
    /// Event type for filtering (optional)
    /// </summary>
    [MaxLength(50)]
    public string? EventType { get; set; }

    /// <summary>
    /// Error severity for filtering (optional)
    /// </summary>
    [MaxLength(20)]
    public string? ErrorSeverity { get; set; }

    /// <summary>
    /// Performance metric type for filtering (optional)
    /// </summary>
    [MaxLength(20)]
    public string? MetricType { get; set; }
}

/// <summary>
/// Analytics Dashboard Response DTO
/// </summary>
public class AnalyticsDashboardResponseDto
{
    /// <summary>
    /// User engagement metrics
    /// </summary>
    public UserEngagementDto UserEngagement { get; set; } = new();

    /// <summary>
    /// Performance metrics
    /// </summary>
    public PerformanceOverviewDto Performance { get; set; } = new();

    /// <summary>
    /// Feature usage metrics
    /// </summary>
    public FeatureUsageDto FeatureUsage { get; set; } = new();

    /// <summary>
    /// Error tracking metrics
    /// </summary>
    public ErrorTrackingDto ErrorTracking { get; set; } = new();

    /// <summary>
    /// Time range used for data
    /// </summary>
    public string TimeRange { get; set; } = string.Empty;

    /// <summary>
    /// Data generation timestamp
    /// </summary>
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// User Engagement DTO
/// </summary>
public class UserEngagementDto
{
    /// <summary>
    /// Total users
    /// </summary>
    public int TotalUsers { get; set; }

    /// <summary>
    /// Active users
    /// </summary>
    public int ActiveUsers { get; set; }

    /// <summary>
    /// New users
    /// </summary>
    public int NewUsers { get; set; }

    /// <summary>
    /// Returning users
    /// </summary>
    public int ReturningUsers { get; set; }

    /// <summary>
    /// Average session duration in minutes
    /// </summary>
    public double SessionDuration { get; set; }

    /// <summary>
    /// Total page views
    /// </summary>
    public int PageViews { get; set; }
}

/// <summary>
/// Performance Overview DTO
/// </summary>
public class PerformanceOverviewDto
{
    /// <summary>
    /// Average Largest Contentful Paint
    /// </summary>
    public double AverageLCP { get; set; }

    /// <summary>
    /// Average First Input Delay
    /// </summary>
    public double AverageFID { get; set; }

    /// <summary>
    /// Average Cumulative Layout Shift
    /// </summary>
    public double AverageCLS { get; set; }

    /// <summary>
    /// Average First Contentful Paint
    /// </summary>
    public double AverageFCP { get; set; }

    /// <summary>
    /// Overall performance score
    /// </summary>
    public int PerformanceScore { get; set; }

    /// <summary>
    /// Error rate percentage
    /// </summary>
    public double ErrorRate { get; set; }
}

/// <summary>
/// Feature Usage DTO
/// </summary>
public class FeatureUsageDto
{
    /// <summary>
    /// Task creation count
    /// </summary>
    public int TaskCreation { get; set; }

    /// <summary>
    /// Task completion count
    /// </summary>
    public int TaskCompletion { get; set; }

    /// <summary>
    /// Search usage count
    /// </summary>
    public int SearchUsage { get; set; }

    /// <summary>
    /// Filter usage count
    /// </summary>
    public int FilterUsage { get; set; }

    /// <summary>
    /// Bulk actions count
    /// </summary>
    public int BulkActions { get; set; }
}

/// <summary>
/// Error Tracking DTO
/// </summary>
public class ErrorTrackingDto
{
    /// <summary>
    /// Total errors
    /// </summary>
    public int TotalErrors { get; set; }

    /// <summary>
    /// Critical errors
    /// </summary>
    public int CriticalErrors { get; set; }

    /// <summary>
    /// Resolved errors
    /// </summary>
    public int ResolvedErrors { get; set; }

    /// <summary>
    /// Error trend percentage
    /// </summary>
    public double ErrorTrend { get; set; }
}

#endregion

#region Real-time Dashboard DTOs

/// <summary>
/// Dashboard Update Request DTO
/// </summary>
public class DashboardUpdateRequestDto
{
    /// <summary>
    /// Update type
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string UpdateType { get; set; } = string.Empty;

    /// <summary>
    /// Update data
    /// </summary>
    public JsonDocument? Data { get; set; }

    /// <summary>
    /// Update priority
    /// </summary>
    [MaxLength(20)]
    public string Priority { get; set; } = "normal";

    /// <summary>
    /// Whether to broadcast to all users
    /// </summary>
    public bool BroadcastToAll { get; set; } = false;

    /// <summary>
    /// Target user IDs (if not broadcast to all)
    /// </summary>
    public List<int>? TargetUserIds { get; set; }

    /// <summary>
    /// Update timestamp
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Analytics Stream Request DTO
/// </summary>
public class AnalyticsStreamRequestDto
{
    /// <summary>
    /// Stream type
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string StreamType { get; set; } = string.Empty;

    /// <summary>
    /// Update interval in seconds
    /// </summary>
    [Range(1, 3600)]
    public int Interval { get; set; } = 30;

    /// <summary>
    /// Stream filters
    /// </summary>
    public JsonDocument? Filters { get; set; }

    /// <summary>
    /// Whether to include real-time data
    /// </summary>
    public bool IncludeRealTime { get; set; } = true;

    /// <summary>
    /// Whether to include historical data
    /// </summary>
    public bool IncludeHistorical { get; set; } = false;

    /// <summary>
    /// Historical data time range in hours
    /// </summary>
    [Range(1, 168)]
    public int HistoricalHours { get; set; } = 24;

    /// <summary>
    /// Stream priority
    /// </summary>
    [MaxLength(20)]
    public string Priority { get; set; } = "normal";

    /// <summary>
    /// Stream tags
    /// </summary>
    public JsonDocument? Tags { get; set; }
}

/// <summary>
/// Real-time Analytics Data DTO
/// </summary>
public class RealTimeAnalyticsDto
{
    /// <summary>
    /// Data type
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string DataType { get; set; } = string.Empty;

    /// <summary>
    /// Data value
    /// </summary>
    public JsonDocument? Value { get; set; }

    /// <summary>
    /// Data timestamp
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Data source
    /// </summary>
    [MaxLength(100)]
    public string? Source { get; set; }

    /// <summary>
    /// Data quality score
    /// </summary>
    [Range(0, 100)]
    public int QualityScore { get; set; } = 100;

    /// <summary>
    /// Whether data is real-time
    /// </summary>
    public bool IsRealTime { get; set; } = true;

    /// <summary>
    /// Data tags
    /// </summary>
    public JsonDocument? Tags { get; set; }
}

/// <summary>
/// Dashboard Connection Status DTO
/// </summary>
public class DashboardConnectionStatusDto
{
    /// <summary>
    /// Connection status
    /// </summary>
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Connection timestamp
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Connection duration in seconds
    /// </summary>
    public int? Duration { get; set; }

    /// <summary>
    /// Connection quality
    /// </summary>
    [MaxLength(20)]
    public string? Quality { get; set; }

    /// <summary>
    /// Connection latency in milliseconds
    /// </summary>
    public int? Latency { get; set; }

    /// <summary>
    /// Connection errors
    /// </summary>
    public List<string>? Errors { get; set; }

    /// <summary>
    /// Connection warnings
    /// </summary>
    public List<string>? Warnings { get; set; }
}

#endregion 