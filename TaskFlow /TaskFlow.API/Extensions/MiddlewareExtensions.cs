/**
 * Middleware Extensions
 * 
 * Bu dosya, TaskFlow API'sinde middleware'lerin kolayca kaydedilmesi
 * için extension method'ları içerir. Program.cs'de fluent interface
 * kullanarak middleware pipeline'ını yapılandırmayı sağlar.
 * 
 * Ana İşlevler:
 * - Global Exception Handler registration
 * - Request/Response Logging registration
 * - Global Validation registration
 * - Fluent interface support
 * - Middleware sıralama yönetimi
 * 
 * Middleware Pipeline Sırası:
 * 1. Global Exception Handler (en başta)
 * 2. Request/Response Logging
 * 3. Global Validation
 * 4. Authentication/Authorization
 * 5. Routing
 * 6. Endpoint execution
 * 
 * Extension Methods:
 * - UseGlobalExceptionHandler: Merkezi hata yönetimi
 * - UseRequestResponseLogging: Request/response logging
 * - UseGlobalValidation: Model validation
 * 
 * Güvenlik:
 * - Middleware sıralama kontrolü
 * - Exception handling
 * - Request validation
 * - Response sanitization
 * 
 * Performance:
 * - Efficient middleware registration
 * - Minimal overhead
 * - Optimized pipeline
 * - Memory efficient
 * 
 * Monitoring:
 * - Request logging
 * - Performance tracking
 * - Error monitoring
 * - Health checks
 * 
 * Validation:
 * - Model validation
 * - Input sanitization
 * - Business rule validation
 * - Error message formatting
 * 
 * Logging:
 * - Structured logging
 * - Request correlation
 * - Performance metrics
 * - Error tracking
 * 
 * Sürdürülebilirlik:
 * - Clean architecture
 * - Separation of concerns
 * - Easy maintenance
 * - Clear documentation
 * 
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

using TaskFlow.API.Middleware;

namespace TaskFlow.API.Extensions
{
    /// <summary>
    /// Middleware registration için extension methods
    /// Program.cs'de middleware'leri kolayca register etmek için kullanılır
    /// </summary>
    public static class MiddlewareExtensions
    {
        /// <summary>
        /// Global Exception Handler middleware'ini pipeline'a ekler
        /// </summary>
        /// <param name="app">WebApplication instance</param>
        /// <returns>WebApplication (fluent interface)</returns>
        /// <remarks>
        /// Bu middleware HTTP pipeline'ın en başında çalışmalıdır.
        /// Tüm unhandled exception'ları yakalar ve standart format'ta response döndürür.
        /// </remarks>
        public static WebApplication UseGlobalExceptionHandler(this WebApplication app)
        {
            app.UseMiddleware<GlobalExceptionHandlerMiddleware>();
            return app;
        }

        /// <summary>
        /// Request/Response Logging middleware'ini pipeline'a ekler
        /// </summary>
        /// <param name="app">WebApplication instance</param>
        /// <returns>WebApplication (fluent interface)</returns>
        /// <remarks>
        /// Bu middleware HTTP request/response detaylarını loglar ve performance monitoring sağlar.
        /// Global Exception Handler'dan sonra çalışmalıdır.
        /// </remarks>
        public static WebApplication UseRequestResponseLogging(this WebApplication app)
        {
            app.UseMiddleware<RequestResponseLoggingMiddleware>();
            return app;
        }



        /// <summary>
        /// Global validation middleware'ini pipeline'a ekler
        /// </summary>
        /// <param name="app">WebApplication instance</param>
        /// <returns>WebApplication (fluent interface)</returns>
        /// <remarks>
        /// Bu middleware model validation'ı centralize eder.
        /// Controller'larda manuel ModelState kontrolü yapmaya gerek kalmaz.
        /// </remarks>
        public static WebApplication UseGlobalValidation(this WebApplication app)
        {
            // Bu method daha sonra GlobalValidationMiddleware implement edildiğinde kullanılacak
            // app.UseMiddleware<GlobalValidationMiddleware>();
            return app;
        }
    }
} 