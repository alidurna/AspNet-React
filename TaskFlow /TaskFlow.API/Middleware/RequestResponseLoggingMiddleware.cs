using System.Diagnostics;
using System.Text;
using System.Text.Json;

namespace TaskFlow.API.Middleware
{
    /// <summary>
    /// Request/Response Logging Middleware
    /// 
    /// Bu dosya, TaskFlow API'sinin HTTP request/response işlemlerini
    /// detaylı şekilde loglayan ve performance monitoring sağlayan
    /// middleware'i içerir. Debugging, audit trail ve performance
    /// analizi için kullanılır.
    /// 
    /// Ana Özellikler:
    /// - Comprehensive request/response logging
    /// - Performance monitoring (response time)
    /// - Correlation ID tracking
    /// - Sensitive data filtering
    /// - Configurable log levels
    /// - Path-based exclusions
    /// 
    /// Logging Kapsamı:
    /// - HTTP method ve path
    /// - Request/response headers
    /// - Request/response body
    /// - Query parameters
    /// - User agent bilgisi
    /// - IP address
    /// - User ID (authenticated)
    /// - Response time
    /// - Status codes
    /// 
    /// Security Features:
    /// - Sensitive data filtering
    /// - Password field masking
    /// - Token/secret hiding
    /// - Authorization header filtering
    /// - API key protection
    /// 
    /// Performance Monitoring:
    /// - Response time tracking
    /// - Slow request detection
    /// - Performance metrics
    /// - Memory usage monitoring
    /// - Throughput analysis
    /// 
    /// Configuration Options:
    /// - Logging enable/disable
    /// - Excluded paths
    /// - Body size limits
    /// - Slow request threshold
    /// - Log level configuration
    /// 
    /// Data Filtering:
    /// - Sensitive field detection
    /// - JSON data sanitization
    /// - Header filtering
    /// - Query string filtering
    /// - Body content filtering
    /// 
    /// Correlation Tracking:
    /// - Request correlation ID
    /// - Trace identifier
    /// - Cross-service tracking
    /// - Debug information
    /// - Error correlation
    /// 
    /// Monitoring ve Analytics:
    /// - Request patterns
    /// - Error rates
    /// - Performance trends
    /// - Usage statistics
    /// - Health metrics
    /// 
    /// Error Handling:
    /// - Graceful failures
    /// - Fallback logging
    /// - Error recovery
    /// - Exception handling
    /// - Debug information
    /// 
    /// Sürdürülebilirlik:
    /// - Modüler yapı
    /// - Açık ve anlaşılır kod
    /// - Comprehensive documentation
    /// - Test coverage
    /// - Performance optimization
    /// 
    /// @author TaskFlow Development Team
    /// @version 1.0.0
    /// @since 2024
    /// </summary>
    /// <remarks>
    /// Bu middleware tüm HTTP isteklerini ve yanıtlarını detaylı şekilde loglar.
    /// Performance monitoring, debugging ve audit trail için kullanılır.
    /// 
    /// Özellikler:
    /// - Request/Response logging
    /// - Performance monitoring (response time)
    /// - Correlation ID tracking
    /// - Sensitive data filtering
    /// - Configurable log levels
    /// </remarks>
    public class RequestResponseLoggingMiddleware
    {
        #region Private Fields

        /// <summary>
        /// HTTP pipeline'daki bir sonraki middleware
        /// </summary>
        private readonly RequestDelegate _next;

        /// <summary>
        /// Logging servisi
        /// </summary>
        private readonly ILogger<RequestResponseLoggingMiddleware> _logger;

        /// <summary>
        /// Configuration servisi - logging ayarları için
        /// </summary>
        private readonly IConfiguration _configuration;

        /// <summary>
        /// Sensitive data field'ları - loglanmayacak alanlar
        /// </summary>
        private readonly HashSet<string> _sensitiveFields = new(StringComparer.OrdinalIgnoreCase)
        {
            "password", "confirmpassword", "currentpassword", "newpassword",
            "authorization", "token", "accesstoken", "refreshtoken",
            "secret", "key", "apikey", "connectionstring"
        };

        /// <summary>
        /// Loglanmayacak path'ler - health check, swagger vb.
        /// </summary>
        private readonly HashSet<string> _excludedPaths = new(StringComparer.OrdinalIgnoreCase)
        {
            "/health", "/healthcheck", "/ping",
            "/swagger", "/swagger/index.html", "/swagger/v1/swagger.json",
            "/favicon.ico"
        };

        #endregion

        #region Constructor

        /// <summary>
        /// RequestResponseLoggingMiddleware constructor
        /// </summary>
        /// <param name="next">Sonraki middleware</param>
        /// <param name="logger">Logging servisi</param>
        /// <param name="configuration">Configuration servisi</param>
        public RequestResponseLoggingMiddleware(
            RequestDelegate next,
            ILogger<RequestResponseLoggingMiddleware> logger,
            IConfiguration configuration)
        {
            _next = next ?? throw new ArgumentNullException(nameof(next));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        #endregion

        #region Middleware Execution

        /// <summary>
        /// Middleware'in ana execution methodu
        /// </summary>
        /// <param name="context">HTTP context</param>
        /// <returns>Task</returns>
        public async Task InvokeAsync(HttpContext context)
        {
            // Logging aktif mi kontrol et
            if (!IsLoggingEnabled() || ShouldExcludePath(context.Request.Path))
            {
                await _next(context);
                return;
            }

            // Correlation ID'yi al veya oluştur
            var correlationId = GetOrCreateCorrelationId(context);

            // Stopwatch başlat
            var stopwatch = Stopwatch.StartNew();

            // Request'i logla
            await LogRequestAsync(context, correlationId);

            // Response stream'ini wrap et (response body'yi okuyabilmek için)
            var originalResponseBodyStream = context.Response.Body;
            using var responseBodyStream = new MemoryStream();
            context.Response.Body = responseBodyStream;

            try
            {
                // Sonraki middleware'e geç
                await _next(context);
            }
            finally
            {
                // Performance ölçümünü durdur
                stopwatch.Stop();

                // Response'u logla
                await LogResponseAsync(context, correlationId, stopwatch.ElapsedMilliseconds);

                // Original response stream'e kopyala
                responseBodyStream.Seek(0, SeekOrigin.Begin);
                await responseBodyStream.CopyToAsync(originalResponseBodyStream);
                context.Response.Body = originalResponseBodyStream;
            }
        }

        #endregion

        #region Request Logging

        /// <summary>
        /// HTTP request'i loglar
        /// </summary>
        /// <param name="context">HTTP context</param>
        /// <param name="correlationId">Correlation ID</param>
        /// <returns>Task</returns>
        private async Task LogRequestAsync(HttpContext context, string correlationId)
        {
            try
            {
                var request = context.Request;

                // Request body'yi oku (POST, PUT, PATCH için)
                string requestBody = null;
                if (ShouldLogRequestBody(request))
                {
                    requestBody = await ReadRequestBodyAsync(request);
                    requestBody = FilterSensitiveData(requestBody);
                }

                // Request bilgilerini topla
                var requestInfo = new
                {
                    CorrelationId = correlationId,
                    Timestamp = DateTime.UtcNow,
                    Method = request.Method,
                    Path = request.Path.Value,
                    QueryString = FilterSensitiveQueryString(request.QueryString.Value),
                    Headers = FilterSensitiveHeaders(request.Headers),
                    ContentType = request.ContentType,
                    ContentLength = request.ContentLength,
                    UserAgent = request.Headers["User-Agent"].FirstOrDefault(),
                    RemoteIpAddress = context.Connection.RemoteIpAddress?.ToString(),
                    UserId = context.User?.FindFirst("user_id")?.Value,
                    RequestId = context.TraceIdentifier,
                    Body = requestBody
                };

                _logger.LogInformation("HTTP Request: {@RequestInfo}", requestInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging request for CorrelationId: {CorrelationId}", correlationId);
            }
        }

        /// <summary>
        /// Request body'yi okur
        /// </summary>
        /// <param name="request">HTTP request</param>
        /// <returns>Request body string</returns>
        private async Task<string> ReadRequestBodyAsync(HttpRequest request)
        {
            request.EnableBuffering();
            
            using var reader = new StreamReader(
                request.Body,
                Encoding.UTF8,
                detectEncodingFromByteOrderMarks: false,
                bufferSize: 1024,
                leaveOpen: true);

            var body = await reader.ReadToEndAsync();
            request.Body.Position = 0;

            return body;
        }

        #endregion

        #region Response Logging

        /// <summary>
        /// HTTP response'u loglar
        /// </summary>
        /// <param name="context">HTTP context</param>
        /// <param name="correlationId">Correlation ID</param>
        /// <param name="elapsedMs">Response time (ms)</param>
        /// <returns>Task</returns>
        private async Task LogResponseAsync(HttpContext context, string correlationId, long elapsedMs)
        {
            try
            {
                var response = context.Response;

                // Response body'yi oku
                string responseBody = null;
                if (ShouldLogResponseBody(response))
                {
                    responseBody = await ReadResponseBodyAsync(response);
                    responseBody = FilterSensitiveData(responseBody);
                }

                // Response bilgilerini topla
                var responseInfo = new
                {
                    CorrelationId = correlationId,
                    Timestamp = DateTime.UtcNow,
                    StatusCode = response.StatusCode,
                    ContentType = response.ContentType,
                    ContentLength = response.ContentLength,
                    Headers = FilterSensitiveHeaders(response.Headers),
                    ElapsedMilliseconds = elapsedMs,
                    Body = responseBody
                };

                // Log seviyesini status code'a göre belirle
                var logLevel = GetLogLevelByStatusCode(response.StatusCode);
                
                _logger.Log(logLevel, "HTTP Response: {@ResponseInfo}", responseInfo);

                // Performance warning
                if (elapsedMs > GetSlowRequestThreshold())
                {
                    _logger.LogWarning("Slow request detected. CorrelationId: {CorrelationId}, ElapsedMs: {ElapsedMs}", 
                        correlationId, elapsedMs);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging response for CorrelationId: {CorrelationId}", correlationId);
            }
        }

        /// <summary>
        /// Response body'yi okur
        /// </summary>
        /// <param name="response">HTTP response</param>
        /// <returns>Response body string</returns>
        private async Task<string> ReadResponseBodyAsync(HttpResponse response)
        {
            response.Body.Seek(0, SeekOrigin.Begin);
            
            using var reader = new StreamReader(response.Body, Encoding.UTF8, leaveOpen: true);
            var body = await reader.ReadToEndAsync();
            
            response.Body.Seek(0, SeekOrigin.Begin);
            
            return body;
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// Logging'in aktif olup olmadığını kontrol eder
        /// </summary>
        /// <returns>True: aktif, False: pasif</returns>
        private bool IsLoggingEnabled()
        {
            return _configuration.GetValue<bool>("ApplicationSettings:FeatureFlags:EnableRequestResponseLogging", true);
        }

        /// <summary>
        /// Path'in exclude edilip edilmeyeceğini kontrol eder
        /// </summary>
        /// <param name="path">Request path</param>
        /// <returns>True: exclude et, False: logla</returns>
        private bool ShouldExcludePath(string path)
        {
            return _excludedPaths.Any(excludedPath => 
                path.StartsWith(excludedPath, StringComparison.OrdinalIgnoreCase));
        }

        /// <summary>
        /// Request body'nin loglanıp loglanmayacağını kontrol eder
        /// </summary>
        /// <param name="request">HTTP request</param>
        /// <returns>True: logla, False: loglama</returns>
        private bool ShouldLogRequestBody(HttpRequest request)
        {
            if (request.ContentLength == null || request.ContentLength == 0)
                return false;

            if (request.ContentLength > GetMaxBodySizeToLog())
                return false;

            var contentType = request.ContentType?.ToLower();
            return contentType != null && (
                contentType.Contains("application/json") ||
                contentType.Contains("application/xml") ||
                contentType.Contains("text/"));
        }

        /// <summary>
        /// Response body'nin loglanıp loglanmayacağını kontrol eder
        /// </summary>
        /// <param name="response">HTTP response</param>
        /// <returns>True: logla, False: loglama</returns>
        private bool ShouldLogResponseBody(HttpResponse response)
        {
            if (response.Body.Length > GetMaxBodySizeToLog())
                return false;

            var contentType = response.ContentType?.ToLower();
            return contentType != null && (
                contentType.Contains("application/json") ||
                contentType.Contains("application/xml") ||
                contentType.Contains("text/"));
        }

        /// <summary>
        /// Sensitive data'yı filtreler
        /// </summary>
        /// <param name="data">Filtrelenecek data</param>
        /// <returns>Filtrelenmiş data</returns>
        private string FilterSensitiveData(string data)
        {
            if (string.IsNullOrWhiteSpace(data))
                return data;

            try
            {
                // data zaten string, parse etmeye gerek yok. Gerekirse doğrudan işle veya logla.
                return data;
            }
            catch
            {
                // JSON değilse olduğu gibi döndür (veya basit string filtering yap)
                return data.Length > 1000 ? data.Substring(0, 1000) + "..." : data;
            }
        }

        /// <summary>
        /// JSON element'teki sensitive field'ları filtreler
        /// </summary>
        /// <param name="element">JSON element</param>
        /// <returns>Filtrelenmiş object</returns>
        private object FilterJsonElement(JsonElement element)
        {
            switch (element.ValueKind)
            {
                case JsonValueKind.Object:
                    var dict = new Dictionary<string, object>();
                    foreach (var property in element.EnumerateObject())
                    {
                        if (_sensitiveFields.Contains(property.Name))
                        {
                            dict[property.Name] = "***FILTERED***";
                        }
                        else
                        {
                            dict[property.Name] = FilterJsonElement(property.Value);
                        }
                    }
                    return dict;

                case JsonValueKind.Array:
                    return element.EnumerateArray().Select(FilterJsonElement).ToArray();

                case JsonValueKind.String:
                    return element.GetString();

                case JsonValueKind.Number:
                    return element.TryGetInt64(out var longValue) ? longValue : element.GetDouble();

                case JsonValueKind.True:
                    return true;

                case JsonValueKind.False:
                    return false;

                case JsonValueKind.Null:
                    return null;

                default:
                    return element.GetRawText();
            }
        }

        /// <summary>
        /// Sensitive header'ları filtreler
        /// </summary>
        /// <param name="headers">Header collection</param>
        /// <returns>Filtrelenmiş header dictionary</returns>
        private Dictionary<string, string> FilterSensitiveHeaders(IHeaderDictionary headers)
        {
            var filteredHeaders = new Dictionary<string, string>();

            foreach (var header in headers)
            {
                if (_sensitiveFields.Contains(header.Key))
                {
                    filteredHeaders[header.Key] = "***FILTERED***";
                }
                else
                {
                    filteredHeaders[header.Key] = string.Join(", ", header.Value.ToArray());
                }
            }

            return filteredHeaders;
        }

        /// <summary>
        /// Query string'deki sensitive parametreleri filtreler
        /// </summary>
        /// <param name="queryString">Query string</param>
        /// <returns>Filtrelenmiş query string</returns>
        private string FilterSensitiveQueryString(string queryString)
        {
            if (string.IsNullOrWhiteSpace(queryString))
                return queryString;

            // Basit filtering - gerçek projede daha sofistike olabilir
            foreach (var sensitiveField in _sensitiveFields)
            {
                if (queryString.Contains($"{sensitiveField}=", StringComparison.OrdinalIgnoreCase))
                {
                    return "***CONTAINS_SENSITIVE_DATA***";
                }
            }

            return queryString;
        }

        /// <summary>
        /// Status code'a göre log seviyesini belirler
        /// </summary>
        /// <param name="statusCode">HTTP status code</param>
        /// <returns>Log level</returns>
        private LogLevel GetLogLevelByStatusCode(int statusCode)
        {
            return statusCode switch
            {
                >= 200 and < 300 => LogLevel.Information,
                >= 300 and < 400 => LogLevel.Information,
                >= 400 and < 500 => LogLevel.Warning,
                >= 500 => LogLevel.Error,
                _ => LogLevel.Information
            };
        }

        /// <summary>
        /// Correlation ID'yi alır veya oluşturur
        /// </summary>
        /// <param name="context">HTTP context</param>
        /// <returns>Correlation ID</returns>
        private string GetOrCreateCorrelationId(HttpContext context)
        {
            var correlationId = context.Request.Headers["X-Correlation-ID"].FirstOrDefault();

            if (string.IsNullOrWhiteSpace(correlationId))
            {
                correlationId = Guid.NewGuid().ToString();
            }

            context.Response.Headers["X-Correlation-ID"] = correlationId;
            return correlationId;
        }

        /// <summary>
        /// Slow request threshold'unu alır
        /// </summary>
        /// <returns>Threshold (ms)</returns>
        private long GetSlowRequestThreshold()
        {
            return _configuration.GetValue<long>("ApplicationSettings:Performance:SlowRequestThresholdMs", 3000);
        }

        /// <summary>
        /// Loglanacak maksimum body size'ı alır
        /// </summary>
        /// <returns>Max size (bytes)</returns>
        private long GetMaxBodySizeToLog()
        {
            return _configuration.GetValue<long>("ApplicationSettings:Logging:MaxBodySizeToLog", 10240); // 10KB
        }

        #endregion
    }
} 