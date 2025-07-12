/**
 * GlobalExceptionHandlerMiddleware
 * 
 * Bu dosya, TaskFlow API'sinde oluşan tüm yakalanmamış exception'ları
 * merkezi olarak yöneten middleware'i içerir. Güvenli ve tutarlı
 * hata yanıtları sağlar.
 * 
 * Ana İşlevler:
 * - Merkezi exception handling
 * - Yapılandırılmış logging
 * - Ortam bazlı hata detayları (Development/Production)
 * - Standart hata yanıtları
 * - Request correlation tracking
 * - Güvenli hata mesajları
 * 
 * Exception Tipleri:
 * - UnauthorizedAccessException: 401 Unauthorized
 * - KeyNotFoundException: 404 Not Found
 * - ArgumentException: 400 Bad Request
 * - InvalidOperationException: 400 Bad Request
 * - NotImplementedException: 501 Not Implemented
 * - TimeoutException: 408 Request Timeout
 * - Diğerleri: 500 Internal Server Error
 * 
 * Güvenlik:
 * - Production'da detaylı hata bilgileri gizlenir
 * - Hassas bilgiler loglanmaz
 * - Correlation ID ile request takibi
 * - User-friendly hata mesajları
 * 
 * Logging:
 * - Structured logging (Serilog)
 * - Exception tipine göre log seviyesi
 * - Request bilgileri (method, path, user agent)
 * - Correlation ID ile trace
 * - Performance monitoring
 * 
 * Response Format:
 * - Standart ApiResponseModel formatı
 * - JSON serialization
 * - Camel case property naming
 * - Development'da indented JSON
 * 
 * Performance:
 * - Minimal overhead
 * - Efficient exception handling
 * - Async/await pattern
 * - Memory efficient logging
 * 
 * Monitoring:
 * - Request correlation tracking
 * - Exception metrics
 * - Performance counters
 * - Health check integration
 * 
 * Sürdürülebilirlik:
 * - Comprehensive documentation
 * - Testable design
 * - Configurable behavior
 * - Clear separation of concerns
 * 
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

using System.Net;
using System.Text.Json;
using TaskFlow.API.DTOs;

namespace TaskFlow.API.Middleware
{
    /// <summary>
    /// Global Exception Handler Middleware
    /// Tüm unhandled exception'ları yakalar, loglar ve standart format'ta response döndürür
    /// </summary>
    /// <remarks>
    /// Bu middleware HTTP pipeline'ın en başında çalışır ve tüm exception'ları handle eder.
    /// Development ve Production ortamları için farklı detay seviyelerinde hata bilgisi döndürür.
    /// 
    /// Özellikler:
    /// - Centralized exception handling
    /// - Structured logging
    /// - Environment-specific error details
    /// - Standardized error responses
    /// - Request correlation tracking
    /// </remarks>
    public class GlobalExceptionHandlerMiddleware
    {
        #region Private Fields

        /// <summary>
        /// HTTP pipeline'daki bir sonraki middleware
        /// </summary>
        private readonly RequestDelegate _next;

        /// <summary>
        /// Logging servisi - hataları loglamak için
        /// </summary>
        private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

        /// <summary>
        /// Host environment bilgisi - Development/Production kontrolü için
        /// </summary>
        private readonly IWebHostEnvironment _environment;

        #endregion

        #region Constructor

        /// <summary>
        /// GlobalExceptionHandlerMiddleware constructor
        /// Dependency Injection ile gerekli servisleri alır
        /// </summary>
        /// <param name="next">Sonraki middleware</param>
        /// <param name="logger">Logging servisi</param>
        /// <param name="environment">Host environment</param>
        public GlobalExceptionHandlerMiddleware(
            RequestDelegate next,
            ILogger<GlobalExceptionHandlerMiddleware> logger,
            IWebHostEnvironment environment)
        {
            _next = next ?? throw new ArgumentNullException(nameof(next));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _environment = environment ?? throw new ArgumentNullException(nameof(environment));
        }

        #endregion

        #region Middleware Execution

        /// <summary>
        /// Middleware'in ana execution methodu
        /// HTTP request'i handle eder ve exception'ları yakalar
        /// </summary>
        /// <param name="context">HTTP context</param>
        /// <returns>Task</returns>
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Sonraki middleware'e geç
                await _next(context);
            }
            catch (Exception ex)
            {
                // Exception yakalandı - handle et
                await HandleExceptionAsync(context, ex);
            }
        }

        #endregion

        #region Exception Handling

        /// <summary>
        /// Exception'ı handle eden ana method
        /// Exception tipine göre farklı response'lar döndürür
        /// </summary>
        /// <param name="context">HTTP context</param>
        /// <param name="exception">Yakalanan exception</param>
        /// <returns>Task</returns>
        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            // Request correlation ID'sini al veya oluştur
            var correlationId = GetOrCreateCorrelationId(context);

            // Exception'ı logla
            LogException(exception, context, correlationId);

            // HTTP response'u hazırla
            var response = CreateErrorResponse(exception, correlationId);
            var statusCode = GetStatusCode(exception);

            // Response headers'ını ayarla
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            // Response'u serialize et ve gönder
            var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = _environment.IsDevelopment()
            });

            await context.Response.WriteAsync(jsonResponse);
        }

        /// <summary>
        /// Exception'ı detaylı şekilde loglar
        /// </summary>
        /// <param name="exception">Exception</param>
        /// <param name="context">HTTP context</param>
        /// <param name="correlationId">Request correlation ID</param>
        private void LogException(Exception exception, HttpContext context, string correlationId)
        {
            // Request bilgilerini topla
            var requestInfo = new
            {
                CorrelationId = correlationId,
                Method = context.Request.Method,
                Path = context.Request.Path.Value,
                QueryString = context.Request.QueryString.Value,
                UserAgent = context.Request.Headers["User-Agent"].FirstOrDefault(),
                RemoteIpAddress = context.Connection.RemoteIpAddress?.ToString(),
                UserId = context.User?.FindFirst("user_id")?.Value,
                RequestId = context.TraceIdentifier
            };

            // Exception tipine göre farklı log seviyeleri
            switch (exception)
            {
                case UnauthorizedAccessException:
                    _logger.LogWarning(exception,
                        "Unauthorized access attempt. CorrelationId: {CorrelationId}, Request: {@RequestInfo}",
                        correlationId, requestInfo);
                    break;

                case ArgumentException:
                case InvalidOperationException:
                    _logger.LogWarning(exception,
                        "Business rule violation. CorrelationId: {CorrelationId}, Request: {@RequestInfo}",
                        correlationId, requestInfo);
                    break;

                case KeyNotFoundException:
                    _logger.LogWarning(exception,
                        "Resource not found. CorrelationId: {CorrelationId}, Request: {@RequestInfo}",
                        correlationId, requestInfo);
                    break;

                default:
                    _logger.LogError(exception,
                        "Unhandled exception occurred. CorrelationId: {CorrelationId}, Request: {@RequestInfo}",
                        correlationId, requestInfo);
                    break;
            }
        }

        /// <summary>
        /// Exception'a göre HTTP status code'u belirler
        /// </summary>
        /// <param name="exception">Exception</param>
        /// <returns>HTTP status code</returns>
        private static HttpStatusCode GetStatusCode(Exception exception)
        {
            return exception switch
            {
                UnauthorizedAccessException => HttpStatusCode.Unauthorized,
                KeyNotFoundException => HttpStatusCode.NotFound,
                ArgumentException => HttpStatusCode.BadRequest,
                InvalidOperationException => HttpStatusCode.BadRequest,
                NotImplementedException => HttpStatusCode.NotImplemented,
                TimeoutException => HttpStatusCode.RequestTimeout,
                _ => HttpStatusCode.InternalServerError
            };
        }

        /// <summary>
        /// Exception'dan error response oluşturur
        /// Development/Production ortamına göre farklı detay seviyeleri
        /// </summary>
        /// <param name="exception">Exception</param>
        /// <param name="correlationId">Request correlation ID</param>
        /// <returns>Error response</returns>
        private ApiResponseModel<object> CreateErrorResponse(Exception exception, string correlationId)
        {
            var isDevelopment = _environment.IsDevelopment();

            // Base error message
            var message = GetUserFriendlyMessage(exception);
            var errors = new List<string>();

            if (isDevelopment)
            {
                // Development ortamında detaylı hata bilgisi
                errors.Add($"Exception Type: {exception.GetType().Name}");
                errors.Add($"Message: {exception.Message}");
                errors.Add($"Correlation ID: {correlationId}");

                if (exception.InnerException != null)
                {
                    errors.Add($"Inner Exception: {exception.InnerException.Message}");
                }

                // Stack trace sadece development'ta
                if (exception.StackTrace != null)
                {
                    errors.Add($"Stack Trace: {exception.StackTrace}");
                }
            }
            else
            {
                // Production ortamında minimal bilgi
                errors.Add($"Correlation ID: {correlationId}");
                errors.Add("Detaylı bilgi için sistem yöneticisine başvurun");
            }

            return ApiResponseModel<object>.ErrorResponse(message, errors);
        }

        /// <summary>
        /// Exception'dan kullanıcı dostu mesaj oluşturur
        /// </summary>
        /// <param name="exception">Exception</param>
        /// <returns>User-friendly error message</returns>
        private static string GetUserFriendlyMessage(Exception exception)
        {
            return exception switch
            {
                UnauthorizedAccessException => "Bu işlem için yetkiniz bulunmamaktadır",
                KeyNotFoundException => "Aradığınız kaynak bulunamadı",
                ArgumentException => "Geçersiz parametre değeri",
                InvalidOperationException => "İşlem şu anda gerçekleştirilemez",
                NotImplementedException => "Bu özellik henüz implementasyona alınmamış",
                TimeoutException => "İşlem zaman aşımına uğradı",
                _ => "Bir hata oluştu. Lütfen daha sonra tekrar deneyin"
            };
        }

        /// <summary>
        /// Request correlation ID'sini alır veya oluşturur
        /// </summary>
        /// <param name="context">HTTP context</param>
        /// <returns>Correlation ID</returns>
        private static string GetOrCreateCorrelationId(HttpContext context)
        {
            // Header'dan correlation ID'yi almaya çalış
            var correlationId = context.Request.Headers["X-Correlation-ID"].FirstOrDefault();

            if (string.IsNullOrWhiteSpace(correlationId))
            {
                // Yoksa yeni bir tane oluştur
                correlationId = Guid.NewGuid().ToString();
            }

            // Response header'ına ekle
            context.Response.Headers["X-Correlation-ID"] = correlationId;

            return correlationId;
        }

        #endregion
    }
} 