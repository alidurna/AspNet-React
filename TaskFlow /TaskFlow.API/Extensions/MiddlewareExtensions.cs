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
        /// Request/Response logging middleware'ini pipeline'a ekler
        /// </summary>
        /// <param name="app">WebApplication instance</param>
        /// <returns>WebApplication (fluent interface)</returns>
        /// <remarks>
        /// Bu middleware HTTP request/response detaylarını loglar.
        /// Performance monitoring ve debugging için kullanılır.
        /// </remarks>
        public static WebApplication UseRequestResponseLogging(this WebApplication app)
        {
            // Bu method daha sonra RequestResponseLoggingMiddleware implement edildiğinde kullanılacak
            // app.UseMiddleware<RequestResponseLoggingMiddleware>();
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