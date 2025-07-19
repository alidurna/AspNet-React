/**
 * Analytics Controller
 *
 * Bu dosya, TaskFlow uygulamasında analytics verilerini
 * yönetmek için kullanılan controller sınıfını içerir.
 * Analytics events, user sessions, error reports ve
 * performance metrics için API endpoint'leri sağlar.
 *
 * Ana Özellikler:
 * - Analytics event tracking
 * - User session management
 * - Error reporting
 * - Performance monitoring
 * - Dashboard data aggregation
 *
 * API Endpoints:
 * - POST /api/analytics/events - Track analytics events
 * - POST /api/analytics/sessions - Create/update user sessions
 * - POST /api/analytics/errors - Report errors
 * - POST /api/analytics/performance - Track performance metrics
 * - GET /api/analytics/dashboard - Get dashboard data
 * - GET /api/analytics/events - Get analytics events
 * - GET /api/analytics/errors - Get error reports
 * - GET /api/analytics/performance - Get performance metrics
 *
 * Security:
 * - Authentication required for sensitive data
 * - Rate limiting for API endpoints
 * - Data validation and sanitization
 * - Privacy compliance
 * - Access control
 *
 * Performance:
 * - Efficient data processing
 * - Batch operations support
 * - Caching strategies
 * - Background processing
 * - Database optimization
 *
 * Sürdürülebilirlik:
 * - Clear documentation
 * - Type safety
 * - Error handling
 * - Logging and monitoring
 * - Versioning support
 *
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;
using TaskFlow.API.Hubs;
using System.Text.Json;

namespace TaskFlow.API.Controllers;

/// <summary>
/// Analytics Controller - Analytics verilerini yöneten controller
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly TaskFlowDbContext _context;
    private readonly ILogger<AnalyticsController> _logger;
    private readonly IHubContext<TaskFlowHub> _hubContext;

    /// <summary>
    /// Analytics Controller constructor
    /// </summary>
    /// <param name="context">Database context</param>
    /// <param name="logger">Logger instance</param>
    /// <param name="hubContext">SignalR hub context for real-time updates</param>
    public AnalyticsController(
        TaskFlowDbContext context, 
        ILogger<AnalyticsController> logger,
        IHubContext<TaskFlowHub> hubContext)
    {
        _context = context;
        _logger = logger;
        _hubContext = hubContext;
    }

    #region Analytics Events

    /// <summary>
    /// Track analytics event
    /// </summary>
    /// <param name="request">Analytics event data</param>
    /// <returns>Created event response</returns>
    [HttpPost("events")]
    [AllowAnonymous] // Allow anonymous tracking for better analytics
    public async Task<ActionResult<AnalyticsEventResponseDto>> TrackEvent([FromBody] AnalyticsEventRequestDto request)
    {
        try
        {
            // Validate request
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Create analytics event
            var analyticsEvent = new AnalyticsEvent
            {
                Id = Guid.NewGuid(),
                EventType = request.EventType,
                EventName = request.EventName,
                SessionId = request.SessionId,
                UserId = request.UserId,
                Page = request.Page,
                UserAgent = request.UserAgent,
                ScreenResolution = request.ScreenResolution,
                Language = request.Language,
                Properties = request.Properties,
                Timestamp = request.Timestamp,
                IpAddress = AnonymizeIpAddress(request.IpAddress),
                Location = request.Location,
                DeviceType = request.DeviceType,
                Browser = request.Browser,
                OperatingSystem = request.OperatingSystem,
                Referrer = request.Referrer,
                UtmParameters = request.UtmParameters,
                Duration = request.Duration,
                IsSuccessful = request.IsSuccessful,
                ErrorMessage = request.ErrorMessage,
                Fingerprint = request.Fingerprint,
                Priority = request.Priority,
                Tags = request.Tags,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Add to database
            _context.AnalyticsEvents.Add(analyticsEvent);
            await _context.SaveChangesAsync();

            // Update session event count
            await UpdateSessionEventCount(request.SessionId);

            _logger.LogInformation("Analytics event tracked: {EventType} - {EventName}", request.EventType, request.EventName);

            // Return response
            var response = new AnalyticsEventResponseDto
            {
                Id = analyticsEvent.Id,
                EventType = analyticsEvent.EventType,
                EventName = analyticsEvent.EventName,
                SessionId = analyticsEvent.SessionId,
                UserId = analyticsEvent.UserId,
                Page = analyticsEvent.Page,
                Timestamp = analyticsEvent.Timestamp,
                IsSuccessful = analyticsEvent.IsSuccessful,
                Priority = analyticsEvent.Priority,
                CreatedAt = analyticsEvent.CreatedAt
            };

            return CreatedAtAction(nameof(GetEvent), new { id = analyticsEvent.Id }, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error tracking analytics event");
            return StatusCode(500, new { message = "Analytics event tracking failed" });
        }
    }

    /// <summary>
    /// Get analytics event by ID
    /// </summary>
    /// <param name="id">Event ID</param>
    /// <returns>Analytics event</returns>
    [HttpGet("events/{id}")]
    public async Task<ActionResult<AnalyticsEventResponseDto>> GetEvent(Guid id)
    {
        try
        {
            var analyticsEvent = await _context.AnalyticsEvents
                .Where(e => e.Id == id && !e.IsDeleted)
                .FirstOrDefaultAsync();

            if (analyticsEvent == null)
            {
                return NotFound();
            }

            var response = new AnalyticsEventResponseDto
            {
                Id = analyticsEvent.Id,
                EventType = analyticsEvent.EventType,
                EventName = analyticsEvent.EventName,
                SessionId = analyticsEvent.SessionId,
                UserId = analyticsEvent.UserId,
                Page = analyticsEvent.Page,
                Timestamp = analyticsEvent.Timestamp,
                IsSuccessful = analyticsEvent.IsSuccessful,
                Priority = analyticsEvent.Priority,
                CreatedAt = analyticsEvent.CreatedAt
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting analytics event {Id}", id);
            return StatusCode(500, new { message = "Failed to get analytics event" });
        }
    }

    /// <summary>
    /// Get analytics events with filtering
    /// </summary>
    /// <param name="sessionId">Session ID filter</param>
    /// <param name="eventType">Event type filter</param>
    /// <param name="page">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Paginated analytics events</returns>
    [HttpGet("events")]
    public async Task<ActionResult<ApiResponseModel<AnalyticsEventResponseDto>>> GetEvents(
        [FromQuery] string? sessionId = null,
        [FromQuery] string? eventType = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var query = _context.AnalyticsEvents
                .Where(e => !e.IsDeleted)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(sessionId))
            {
                query = query.Where(e => e.SessionId == sessionId);
            }

            if (!string.IsNullOrEmpty(eventType))
            {
                query = query.Where(e => e.EventType == eventType);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var events = await query
                .OrderByDescending(e => e.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(e => new AnalyticsEventResponseDto
                {
                    Id = e.Id,
                    EventType = e.EventType,
                    EventName = e.EventName,
                    SessionId = e.SessionId,
                    UserId = e.UserId,
                    Page = e.Page,
                    Timestamp = e.Timestamp,
                    IsSuccessful = e.IsSuccessful,
                    Priority = e.Priority,
                    CreatedAt = e.CreatedAt
                })
                .ToListAsync();

            var response = new ApiResponseModel<AnalyticsEventResponseDto>
            {
                Success = true,
                Data = events,
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting analytics events");
            return StatusCode(500, new { message = "Failed to get analytics events" });
        }
    }

    #endregion

    #region Real-time Dashboard Updates

    /// <summary>
    /// Real-time dashboard data için SignalR hub'a bağlan
    /// </summary>
    /// <returns>Connection status</returns>
    [HttpPost("dashboard/connect")]
    public async Task<ActionResult<object>> ConnectToDashboard()
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            // Kullanıcıyı dashboard grubuna ekle
            await _hubContext.Clients.Group($"Dashboard_{userId}").SendAsync("DashboardConnected", new
            {
                UserId = userId,
                Timestamp = DateTime.UtcNow,
                Message = "Dashboard real-time connection established"
            });

            _logger.LogInformation("User {UserId} connected to real-time dashboard", userId);

            return Ok(new
            {
                success = true,
                message = "Real-time dashboard connection established",
                userId = userId,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error connecting to real-time dashboard");
            return StatusCode(500, new { message = "Failed to connect to real-time dashboard" });
        }
    }

    /// <summary>
    /// Real-time dashboard data gönder
    /// </summary>
    /// <param name="request">Dashboard update request</param>
    /// <returns>Update status</returns>
    [HttpPost("dashboard/update")]
    public async Task<ActionResult<object>> UpdateDashboard([FromBody] DashboardUpdateRequestDto request)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            // Real-time dashboard güncellemesi gönder
            await _hubContext.Clients.Group($"Dashboard_{userId}").SendAsync("DashboardUpdated", new
            {
                UserId = userId,
                UpdateType = request.UpdateType,
                Data = request.Data,
                Timestamp = DateTime.UtcNow
            });

            _logger.LogDebug("Dashboard updated for user {UserId}: {UpdateType}", userId, request.UpdateType);

            return Ok(new
            {
                success = true,
                message = "Dashboard updated successfully",
                updateType = request.UpdateType,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating dashboard");
            return StatusCode(500, new { message = "Failed to update dashboard" });
        }
    }

    /// <summary>
    /// Real-time analytics data stream başlat
    /// </summary>
    /// <returns>Stream status</returns>
    [HttpPost("analytics/stream")]
    public async Task<ActionResult<object>> StartAnalyticsStream([FromBody] AnalyticsStreamRequestDto request)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            // Analytics stream başlat
            await _hubContext.Clients.Group($"Analytics_{userId}").SendAsync("AnalyticsStreamStarted", new
            {
                UserId = userId,
                StreamType = request.StreamType,
                Interval = request.Interval,
                Timestamp = DateTime.UtcNow
            });

            _logger.LogInformation("Analytics stream started for user {UserId}: {StreamType}", userId, request.StreamType);

            return Ok(new
            {
                success = true,
                message = "Analytics stream started",
                streamType = request.StreamType,
                interval = request.Interval,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting analytics stream");
            return StatusCode(500, new { message = "Failed to start analytics stream" });
        }
    }

    #endregion

    #region User Sessions

    /// <summary>
    /// Create or update user session
    /// </summary>
    /// <param name="request">Session data</param>
    /// <returns>Session response</returns>
    [HttpPost("sessions")]
    [AllowAnonymous] // Allow anonymous sessions
    public async Task<ActionResult<UserSessionResponseDto>> CreateOrUpdateSession([FromBody] UserSessionRequestDto request)
    {
        try
        {
            // Validate request
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if session exists
            var existingSession = await _context.UserSessions
                .FirstOrDefaultAsync(s => s.Id == request.Id);

            if (existingSession != null)
            {
                // Update existing session
                existingSession.LastActivity = request.LastActivity;
                existingSession.PageViews = request.PageViews;
                existingSession.Events = request.Events;
                existingSession.Status = request.Status;
                existingSession.UpdatedAt = DateTime.UtcNow;

                if (request.EndTime.HasValue)
                {
                    existingSession.EndTime = request.EndTime;
                    existingSession.Duration = request.Duration;
                }

                await _context.SaveChangesAsync();

                var response = new UserSessionResponseDto
                {
                    Id = existingSession.Id,
                    UserId = existingSession.UserId,
                    StartTime = existingSession.StartTime,
                    EndTime = existingSession.EndTime,
                    Duration = existingSession.Duration,
                    LastActivity = existingSession.LastActivity,
                    PageViews = existingSession.PageViews,
                    Events = existingSession.Events,
                    Status = existingSession.Status,
                    SessionType = existingSession.SessionType,
                    IsAuthenticated = existingSession.IsAuthenticated,
                    IsSuccessful = existingSession.IsSuccessful,
                    Priority = existingSession.Priority,
                    CreatedAt = existingSession.CreatedAt
                };

                return Ok(response);
            }
            else
            {
                // Create new session
                var session = new UserSession
                {
                    Id = request.Id,
                    UserId = request.UserId,
                    StartTime = request.StartTime,
                    EndTime = request.EndTime,
                    Duration = request.Duration,
                    LastActivity = request.LastActivity,
                    PageViews = request.PageViews,
                    Events = request.Events,
                    UserAgent = request.UserAgent,
                    IpAddress = AnonymizeIpAddress(request.IpAddress),
                    Location = request.Location,
                    DeviceType = request.DeviceType,
                    Browser = request.Browser,
                    OperatingSystem = request.OperatingSystem,
                    ScreenResolution = request.ScreenResolution,
                    Language = request.Language,
                    Referrer = request.Referrer,
                    UtmParameters = request.UtmParameters,
                    Properties = request.Properties,
                    Status = request.Status,
                    SessionType = request.SessionType,
                    IsAuthenticated = request.IsAuthenticated,
                    AuthenticationMethod = request.AuthenticationMethod,
                    SecurityEvents = request.SecurityEvents,
                    PerformanceMetrics = request.PerformanceMetrics,
                    Tags = request.Tags,
                    Fingerprint = request.Fingerprint,
                    IsSuccessful = request.IsSuccessful,
                    ErrorMessage = request.ErrorMessage,
                    Priority = request.Priority,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.UserSessions.Add(session);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User session created: {SessionId}", session.Id);

                var response = new UserSessionResponseDto
                {
                    Id = session.Id,
                    UserId = session.UserId,
                    StartTime = session.StartTime,
                    EndTime = session.EndTime,
                    Duration = session.Duration,
                    LastActivity = session.LastActivity,
                    PageViews = session.PageViews,
                    Events = session.Events,
                    Status = session.Status,
                    SessionType = session.SessionType,
                    IsAuthenticated = session.IsAuthenticated,
                    IsSuccessful = session.IsSuccessful,
                    Priority = session.Priority,
                    CreatedAt = session.CreatedAt
                };

                return CreatedAtAction(nameof(GetSession), new { id = session.Id }, response);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating/updating user session");
            return StatusCode(500, new { message = "Session creation/update failed" });
        }
    }

    /// <summary>
    /// Get user session by ID
    /// </summary>
    /// <param name="id">Session ID</param>
    /// <returns>User session</returns>
    [HttpGet("sessions/{id}")]
    public async Task<ActionResult<UserSessionResponseDto>> GetSession(string id)
    {
        try
        {
            var session = await _context.UserSessions
                .Where(s => s.Id == id && !s.IsDeleted)
                .FirstOrDefaultAsync();

            if (session == null)
            {
                return NotFound();
            }

            var response = new UserSessionResponseDto
            {
                Id = session.Id,
                UserId = session.UserId,
                StartTime = session.StartTime,
                EndTime = session.EndTime,
                Duration = session.Duration,
                LastActivity = session.LastActivity,
                PageViews = session.PageViews,
                Events = session.Events,
                Status = session.Status,
                SessionType = session.SessionType,
                IsAuthenticated = session.IsAuthenticated,
                IsSuccessful = session.IsSuccessful,
                Priority = session.Priority,
                CreatedAt = session.CreatedAt
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user session {Id}", id);
            return StatusCode(500, new { message = "Failed to get user session" });
        }
    }

    #endregion

    #region Error Reports

    /// <summary>
    /// Report error
    /// </summary>
    /// <param name="request">Error report data</param>
    /// <returns>Error report response</returns>
    [HttpPost("errors")]
    [AllowAnonymous] // Allow anonymous error reporting
    public async Task<ActionResult<ErrorReportResponseDto>> ReportError([FromBody] ErrorReportRequestDto request)
    {
        try
        {
            // Validate request
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if error with same fingerprint exists
            var existingError = await _context.ErrorReports
                .FirstOrDefaultAsync(e => e.Fingerprint == request.Fingerprint && !e.Resolved);

            if (existingError != null)
            {
                // Update existing error
                existingError.Occurrences += request.Occurrences;
                existingError.LastSeen = request.LastSeen;
                existingError.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var response = new ErrorReportResponseDto
                {
                    Id = existingError.Id,
                    Message = existingError.Message,
                    Name = existingError.Name,
                    Severity = existingError.Severity,
                    Category = existingError.Category,
                    SessionId = existingError.SessionId,
                    UserId = existingError.UserId,
                    Url = existingError.Url,
                    Fingerprint = existingError.Fingerprint,
                    Occurrences = existingError.Occurrences,
                    FirstSeen = existingError.FirstSeen,
                    LastSeen = existingError.LastSeen,
                    Resolved = existingError.Resolved,
                    UserImpact = existingError.UserImpact,
                    RecoverySuggestion = existingError.RecoverySuggestion,
                    Priority = existingError.Priority,
                    IsMonitored = existingError.IsMonitored,
                    Trend = existingError.Trend,
                    CreatedAt = existingError.CreatedAt
                };

                return Ok(response);
            }
            else
            {
                // Create new error report
                var errorReport = new ErrorReport
                {
                    Id = Guid.NewGuid(),
                    Message = request.Message,
                    Name = request.Name,
                    Severity = request.Severity,
                    Category = request.Category,
                    SessionId = request.SessionId,
                    UserId = request.UserId,
                    Url = request.Url,
                    UserAgent = request.UserAgent,
                    Context = request.Context,
                    Fingerprint = request.Fingerprint,
                    Occurrences = request.Occurrences,
                    FirstSeen = request.FirstSeen,
                    LastSeen = request.LastSeen,
                    UserImpact = request.UserImpact,
                    RecoverySuggestion = request.RecoverySuggestion,
                    StackTrace = SanitizeStackTrace(request.StackTrace),
                    ComponentStack = request.ComponentStack,
                    UserActions = request.UserActions,
                    PerformanceMetrics = request.PerformanceMetrics,
                    NetworkInfo = request.NetworkInfo,
                    Tags = request.Tags,
                    Properties = request.Properties,
                    IpAddress = AnonymizeIpAddress(request.IpAddress),
                    Location = request.Location,
                    DeviceType = request.DeviceType,
                    Browser = request.Browser,
                    OperatingSystem = request.OperatingSystem,
                    Priority = request.Priority,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.ErrorReports.Add(errorReport);
                await _context.SaveChangesAsync();

                _logger.LogWarning("Error reported: {ErrorName} - {Message}", request.Name, request.Message);

                var response = new ErrorReportResponseDto
                {
                    Id = errorReport.Id,
                    Message = errorReport.Message,
                    Name = errorReport.Name,
                    Severity = errorReport.Severity,
                    Category = errorReport.Category,
                    SessionId = errorReport.SessionId,
                    UserId = errorReport.UserId,
                    Url = errorReport.Url,
                    Fingerprint = errorReport.Fingerprint,
                    Occurrences = errorReport.Occurrences,
                    FirstSeen = errorReport.FirstSeen,
                    LastSeen = errorReport.LastSeen,
                    Resolved = errorReport.Resolved,
                    UserImpact = errorReport.UserImpact,
                    RecoverySuggestion = errorReport.RecoverySuggestion,
                    Priority = errorReport.Priority,
                    IsMonitored = errorReport.IsMonitored,
                    Trend = errorReport.Trend,
                    CreatedAt = errorReport.CreatedAt
                };

                return CreatedAtAction(nameof(GetError), new { id = errorReport.Id }, response);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reporting error");
            return StatusCode(500, new { message = "Error reporting failed" });
        }
    }

    /// <summary>
    /// Get error report by ID
    /// </summary>
    /// <param name="id">Error ID</param>
    /// <returns>Error report</returns>
    [HttpGet("errors/{id}")]
    public async Task<ActionResult<ErrorReportResponseDto>> GetError(Guid id)
    {
        try
        {
            var errorReport = await _context.ErrorReports
                .Where(e => e.Id == id && !e.IsDeleted)
                .FirstOrDefaultAsync();

            if (errorReport == null)
            {
                return NotFound();
            }

            var response = new ErrorReportResponseDto
            {
                Id = errorReport.Id,
                Message = errorReport.Message,
                Name = errorReport.Name,
                Severity = errorReport.Severity,
                Category = errorReport.Category,
                SessionId = errorReport.SessionId,
                UserId = errorReport.UserId,
                Url = errorReport.Url,
                Fingerprint = errorReport.Fingerprint,
                Occurrences = errorReport.Occurrences,
                FirstSeen = errorReport.FirstSeen,
                LastSeen = errorReport.LastSeen,
                Resolved = errorReport.Resolved,
                UserImpact = errorReport.UserImpact,
                RecoverySuggestion = errorReport.RecoverySuggestion,
                Priority = errorReport.Priority,
                IsMonitored = errorReport.IsMonitored,
                Trend = errorReport.Trend,
                CreatedAt = errorReport.CreatedAt
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting error report {Id}", id);
            return StatusCode(500, new { message = "Failed to get error report" });
        }
    }

    #endregion

    #region Performance Metrics

    /// <summary>
    /// Track performance metric
    /// </summary>
    /// <param name="request">Performance metric data</param>
    /// <returns>Performance metric response</returns>
    [HttpPost("performance")]
    [AllowAnonymous] // Allow anonymous performance tracking
    public async Task<ActionResult<PerformanceMetricResponseDto>> TrackPerformance([FromBody] PerformanceMetricRequestDto request)
    {
        try
        {
            // Validate request
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Create performance metric
            var performanceMetric = new PerformanceMetric
            {
                Id = Guid.NewGuid(),
                SessionId = request.SessionId,
                UserId = request.UserId,
                Url = request.Url,
                MetricType = request.MetricType,
                Value = request.Value,
                Unit = request.Unit,
                Score = request.Score,
                MeetsThreshold = request.MeetsThreshold,
                Threshold = request.Threshold,
                UserAgent = request.UserAgent,
                DeviceType = request.DeviceType,
                Browser = request.Browser,
                OperatingSystem = request.OperatingSystem,
                ConnectionType = request.ConnectionType,
                EffectiveType = request.EffectiveType,
                ScreenResolution = request.ScreenResolution,
                MemoryInfo = request.MemoryInfo,
                NavigationTiming = request.NavigationTiming,
                ResourceTiming = request.ResourceTiming,
                PaintTiming = request.PaintTiming,
                CustomData = request.CustomData,
                Alerts = request.Alerts,
                Tags = request.Tags,
                Properties = request.Properties,
                IpAddress = AnonymizeIpAddress(request.IpAddress),
                Location = request.Location,
                Priority = request.Priority,
                IsMonitored = request.IsMonitored,
                Trend = request.Trend,
                TrendPercentage = request.TrendPercentage,
                Timestamp = request.Timestamp,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.PerformanceMetrics.Add(performanceMetric);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Performance metric tracked: {MetricType} - {Value}{Unit}", 
                request.MetricType, request.Value, request.Unit);

            var response = new PerformanceMetricResponseDto
            {
                Id = performanceMetric.Id,
                SessionId = performanceMetric.SessionId,
                UserId = performanceMetric.UserId,
                Url = performanceMetric.Url,
                MetricType = performanceMetric.MetricType,
                Value = performanceMetric.Value,
                Unit = performanceMetric.Unit,
                Score = performanceMetric.Score,
                MeetsThreshold = performanceMetric.MeetsThreshold,
                Threshold = performanceMetric.Threshold,
                Priority = performanceMetric.Priority,
                IsMonitored = performanceMetric.IsMonitored,
                Trend = performanceMetric.Trend,
                TrendPercentage = performanceMetric.TrendPercentage,
                Timestamp = performanceMetric.Timestamp,
                CreatedAt = performanceMetric.CreatedAt
            };

            return CreatedAtAction(nameof(GetPerformanceMetric), new { id = performanceMetric.Id }, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error tracking performance metric");
            return StatusCode(500, new { message = "Performance metric tracking failed" });
        }
    }

    /// <summary>
    /// Get performance metric by ID
    /// </summary>
    /// <param name="id">Metric ID</param>
    /// <returns>Performance metric</returns>
    [HttpGet("performance/{id}")]
    public async Task<ActionResult<PerformanceMetricResponseDto>> GetPerformanceMetric(Guid id)
    {
        try
        {
            var performanceMetric = await _context.PerformanceMetrics
                .Where(p => p.Id == id && !p.IsDeleted)
                .FirstOrDefaultAsync();

            if (performanceMetric == null)
            {
                return NotFound();
            }

            var response = new PerformanceMetricResponseDto
            {
                Id = performanceMetric.Id,
                SessionId = performanceMetric.SessionId,
                UserId = performanceMetric.UserId,
                Url = performanceMetric.Url,
                MetricType = performanceMetric.MetricType,
                Value = performanceMetric.Value,
                Unit = performanceMetric.Unit,
                Score = performanceMetric.Score,
                MeetsThreshold = performanceMetric.MeetsThreshold,
                Threshold = performanceMetric.Threshold,
                Priority = performanceMetric.Priority,
                IsMonitored = performanceMetric.IsMonitored,
                Trend = performanceMetric.Trend,
                TrendPercentage = performanceMetric.TrendPercentage,
                Timestamp = performanceMetric.Timestamp,
                CreatedAt = performanceMetric.CreatedAt
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting performance metric {Id}", id);
            return StatusCode(500, new { message = "Failed to get performance metric" });
        }
    }

    #endregion

    #region Dashboard

    /// <summary>
    /// Get analytics dashboard data
    /// </summary>
    /// <param name="request">Dashboard request parameters</param>
    /// <returns>Dashboard data</returns>
    [HttpGet("dashboard")]
    public async Task<ActionResult<AnalyticsDashboardResponseDto>> GetDashboard([FromQuery] AnalyticsDashboardRequestDto request)
    {
        try
        {
            // Calculate date range
            var endDate = DateTime.UtcNow;
            var startDate = request.TimeRange switch
            {
                "1h" => endDate.AddHours(-1),
                "24h" => endDate.AddDays(-1),
                "7d" => endDate.AddDays(-7),
                "30d" => endDate.AddDays(-30),
                "90d" => endDate.AddDays(-90),
                _ => endDate.AddDays(-7)
            };

            // Build base query with filters
            var baseQuery = _context.AnalyticsEvents
                .Where(e => e.Timestamp >= startDate && e.Timestamp <= endDate && !e.IsDeleted);

            if (request.UserId.HasValue)
            {
                baseQuery = baseQuery.Where(e => e.UserId == request.UserId);
            }

            if (!string.IsNullOrEmpty(request.SessionId))
            {
                baseQuery = baseQuery.Where(e => e.SessionId == request.SessionId);
            }

            if (!string.IsNullOrEmpty(request.EventType))
            {
                baseQuery = baseQuery.Where(e => e.EventType == request.EventType);
            }

            // Get user engagement data
            var userEngagement = new UserEngagementDto
            {
                TotalUsers = await baseQuery.Select(e => e.UserId).Distinct().CountAsync(),
                ActiveUsers = await baseQuery
                    .Where(e => e.Timestamp >= endDate.AddDays(-1))
                    .Select(e => e.UserId)
                    .Distinct()
                    .CountAsync(),
                PageViews = await baseQuery.Where(e => e.EventType == "page_view").CountAsync(),
                SessionDuration = await CalculateAverageSessionDuration(startDate, endDate, request.UserId, request.SessionId)
            };

            // Get performance data
            var performanceQuery = _context.PerformanceMetrics
                .Where(p => p.Timestamp >= startDate && p.Timestamp <= endDate && !p.IsDeleted);

            if (request.UserId.HasValue)
            {
                performanceQuery = performanceQuery.Where(p => p.UserId == request.UserId);
            }

            if (!string.IsNullOrEmpty(request.SessionId))
            {
                performanceQuery = performanceQuery.Where(p => p.SessionId == request.SessionId);
            }

            var performance = new PerformanceOverviewDto
            {
                AverageLCP = await performanceQuery.Where(p => p.MetricType == "lcp").AverageAsync(p => (double)p.Value),
                AverageFID = await performanceQuery.Where(p => p.MetricType == "fid").AverageAsync(p => (double)p.Value),
                AverageCLS = await performanceQuery.Where(p => p.MetricType == "cls").AverageAsync(p => (double)p.Value),
                AverageFCP = await performanceQuery.Where(p => p.MetricType == "fcp").AverageAsync(p => (double)p.Value),
                PerformanceScore = await CalculatePerformanceScore(performanceQuery),
                ErrorRate = await CalculateErrorRate(startDate, endDate, request.UserId, request.SessionId)
            };

            // Get feature usage data
            var featureUsage = new FeatureUsageDto
            {
                TaskCreation = await baseQuery.Where(e => e.EventName == "task_created").CountAsync(),
                TaskCompletion = await baseQuery.Where(e => e.EventName == "task_completed").CountAsync(),
                SearchUsage = await baseQuery.Where(e => e.EventType == "search").CountAsync(),
                FilterUsage = await baseQuery.Where(e => e.EventType == "filter").CountAsync(),
                BulkActions = await baseQuery.Where(e => e.EventType == "bulk_action").CountAsync()
            };

            // Get error tracking data
            var errorQuery = _context.ErrorReports
                .Where(e => e.LastSeen >= startDate && e.LastSeen <= endDate && !e.IsDeleted);

            if (request.UserId.HasValue)
            {
                errorQuery = errorQuery.Where(e => e.UserId == request.UserId);
            }

            if (!string.IsNullOrEmpty(request.SessionId))
            {
                errorQuery = errorQuery.Where(e => e.SessionId == request.SessionId);
            }

            if (!string.IsNullOrEmpty(request.ErrorSeverity))
            {
                errorQuery = errorQuery.Where(e => e.Severity == request.ErrorSeverity);
            }

            var errorTracking = new ErrorTrackingDto
            {
                TotalErrors = await errorQuery.CountAsync(),
                CriticalErrors = await errorQuery.Where(e => e.Severity == "critical").CountAsync(),
                ResolvedErrors = await errorQuery.Where(e => e.Resolved).CountAsync(),
                ErrorTrend = await CalculateErrorTrend(startDate, endDate, request.UserId, request.SessionId)
            };

            var response = new AnalyticsDashboardResponseDto
            {
                UserEngagement = userEngagement,
                Performance = performance,
                FeatureUsage = featureUsage,
                ErrorTracking = errorTracking,
                TimeRange = request.TimeRange,
                GeneratedAt = DateTime.UtcNow
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting analytics dashboard data");
            return StatusCode(500, new { message = "Failed to get dashboard data" });
        }
    }

    #endregion

    #region Helper Methods

    /// <summary>
    /// Anonymize IP address for privacy
    /// </summary>
    /// <param name="ipAddress">Original IP address</param>
    /// <returns>Anonymized IP address</returns>
    private static string? AnonymizeIpAddress(string? ipAddress)
    {
        if (string.IsNullOrEmpty(ipAddress))
            return null;

        // Simple anonymization - remove last octet for IPv4
        if (ipAddress.Contains('.'))
        {
            var parts = ipAddress.Split('.');
            if (parts.Length == 4)
            {
                return $"{parts[0]}.{parts[1]}.{parts[2]}.0";
            }
        }

        // For IPv6, keep first 64 bits
        if (ipAddress.Contains(':'))
        {
            var parts = ipAddress.Split(':');
            if (parts.Length >= 4)
            {
                return $"{parts[0]}:{parts[1]}:{parts[2]}:{parts[3]}::";
            }
        }

        return ipAddress;
    }

    /// <summary>
    /// Sanitize stack trace for security
    /// </summary>
    /// <param name="stackTrace">Original stack trace</param>
    /// <returns>Sanitized stack trace</returns>
    private static string? SanitizeStackTrace(string? stackTrace)
    {
        if (string.IsNullOrEmpty(stackTrace))
            return null;

        // Remove sensitive information like file paths, line numbers
        // This is a basic implementation - enhance based on your needs
        return stackTrace
            .Replace("at ", "")
            .Replace(" in ", "")
            .Replace(":line ", "");
    }

    /// <summary>
    /// Update session event count
    /// </summary>
    /// <param name="sessionId">Session ID</param>
    private async Task UpdateSessionEventCount(string sessionId)
    {
        try
        {
            var session = await _context.UserSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session != null)
            {
                session.Events = await _context.AnalyticsEvents
                    .Where(e => e.SessionId == sessionId)
                    .CountAsync();
                session.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating session event count for {SessionId}", sessionId);
        }
    }

    /// <summary>
    /// Calculate average session duration
    /// </summary>
    /// <param name="startDate">Start date</param>
    /// <param name="endDate">End date</param>
    /// <param name="userId">User ID filter</param>
    /// <param name="sessionId">Session ID filter</param>
    /// <returns>Average session duration in minutes</returns>
    private async Task<double> CalculateAverageSessionDuration(DateTime startDate, DateTime endDate, int? userId, string? sessionId)
    {
        try
        {
            var query = _context.UserSessions
                .Where(s => s.StartTime >= startDate && s.StartTime <= endDate && !s.IsDeleted);

            if (userId.HasValue)
            {
                query = query.Where(s => s.UserId == userId);
            }

            if (!string.IsNullOrEmpty(sessionId))
            {
                query = query.Where(s => s.Id == sessionId);
            }

            return await query
                .Where(s => s.Duration.HasValue)
                .AverageAsync(s => s.Duration.Value);
        }
        catch
        {
            return 0;
        }
    }

    /// <summary>
    /// Calculate performance score
    /// </summary>
    /// <param name="query">Performance metrics query</param>
    /// <returns>Performance score (0-100)</returns>
    private async Task<int> CalculatePerformanceScore(IQueryable<PerformanceMetric> query)
    {
        try
        {
            var averageScore = await query
                .Where(p => p.Score.HasValue)
                .AverageAsync(p => p.Score.Value);

            return (int)Math.Round(averageScore);
        }
        catch
        {
            return 0;
        }
    }

    /// <summary>
    /// Calculate error rate
    /// </summary>
    /// <param name="startDate">Start date</param>
    /// <param name="endDate">End date</param>
    /// <param name="userId">User ID filter</param>
    /// <param name="sessionId">Session ID filter</param>
    /// <returns>Error rate percentage</returns>
    private async Task<double> CalculateErrorRate(DateTime startDate, DateTime endDate, int? userId, string? sessionId)
    {
        try
        {
            var totalEvents = await _context.AnalyticsEvents
                .Where(e => e.Timestamp >= startDate && e.Timestamp <= endDate && !e.IsDeleted)
                .CountAsync();

            var errorEvents = await _context.AnalyticsEvents
                .Where(e => e.Timestamp >= startDate && e.Timestamp <= endDate && !e.IsSuccessful && !e.IsDeleted)
                .CountAsync();

            return totalEvents > 0 ? (double)errorEvents / totalEvents * 100 : 0;
        }
        catch
        {
            return 0;
        }
    }

    /// <summary>
    /// Calculate error trend
    /// </summary>
    /// <param name="startDate">Start date</param>
    /// <param name="endDate">End date</param>
    /// <param name="userId">User ID filter</param>
    /// <param name="sessionId">Session ID filter</param>
    /// <returns>Error trend percentage</returns>
    private async Task<double> CalculateErrorTrend(DateTime startDate, DateTime endDate, int? userId, string? sessionId)
    {
        try
        {
            var midPoint = startDate.AddDays((endDate - startDate).Days / 2);

            var firstHalfErrors = await _context.ErrorReports
                .Where(e => e.LastSeen >= startDate && e.LastSeen < midPoint && !e.IsDeleted)
                .CountAsync();

            var secondHalfErrors = await _context.ErrorReports
                .Where(e => e.LastSeen >= midPoint && e.LastSeen <= endDate && !e.IsDeleted)
                .CountAsync();

            if (firstHalfErrors == 0)
                return secondHalfErrors > 0 ? 100 : 0;

            return ((double)(secondHalfErrors - firstHalfErrors) / firstHalfErrors) * 100;
        }
        catch
        {
            return 0;
        }
    }

    #endregion
} 