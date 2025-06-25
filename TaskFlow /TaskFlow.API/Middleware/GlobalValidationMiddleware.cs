using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using TaskFlow.API.DTOs;

namespace TaskFlow.API.Middleware
{
    /// <summary>
    /// Global Validation Action Filter
    /// Model validation'ı centralize eder ve controller'larda tekrarlanan validation kodunu kaldırır
    /// </summary>
    /// <remarks>
    /// Bu filter controller action'larından önce çalışır ve ModelState validation yapar.
    /// Validation hatası varsa BadRequest response döndürür.
    /// 
    /// AVANTAJLARI:
    /// - Controller'larda tekrarlanan validation kodu kaldırılır
    /// - Standart validation error response formatı
    /// - Centralized validation logic
    /// - Consistent error handling
    /// - Action Filter olarak daha uygun yaklaşım
    /// 
    /// ÇALIŞMA PRENSİBİ:
    /// 1. HTTP request controller'a gelir
    /// 2. Model binding ve validation yapılır
    /// 3. OnActionExecuting çalışır ve ModelState kontrol edilir
    /// 4. Validation hatası varsa BadRequest response döndürülür
    /// 5. Validation başarılıysa controller action çalışır
    /// </remarks>
    public class GlobalValidationActionFilter : IActionFilter
    {
        #region Private Fields

        /// <summary>
        /// Logging servisi
        /// Validation hatalarını loglamak için kullanılır
        /// </summary>
        private readonly ILogger<GlobalValidationActionFilter> _logger;

        #endregion

        #region Constructor

        /// <summary>
        /// GlobalValidationActionFilter constructor
        /// </summary>
        /// <param name="logger">Logging servisi</param>
        public GlobalValidationActionFilter(ILogger<GlobalValidationActionFilter> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        #endregion

        #region IActionFilter Implementation

        /// <summary>
        /// Action çalışmadan önce validation kontrolü yapar
        /// </summary>
        /// <param name="context">Action executing context</param>
        public void OnActionExecuting(ActionExecutingContext context)
        {
            try
            {
                // ModelState geçerli mi kontrol et
                if (context.ModelState.IsValid)
                {
                    // Validation başarılı, normal akışa devam et
                    return;
                }

                // Validation hatalarını topla
                var validationErrors = ExtractValidationErrors(context.ModelState);

                if (!validationErrors.Any())
                {
                    // Hata listesi boşsa normal akışa devam et
                    return;
                }

                // Correlation ID'yi al veya oluştur
                var correlationId = context.HttpContext.Response.Headers["X-Correlation-ID"].FirstOrDefault()
                                  ?? Guid.NewGuid().ToString();

                // Validation error response oluştur
                var errorResponse = ApiResponseModel<object>.ValidationErrorResponse(validationErrors);

                // Log validation errors
                _logger.LogWarning("Validation failed for {Controller}.{Action}. Errors: {Errors}. CorrelationId: {CorrelationId}",
                    context.ActionDescriptor.RouteValues["controller"],
                    context.ActionDescriptor.RouteValues["action"],
                    string.Join(", ", validationErrors),
                    correlationId);

                // BadRequest response döndür ve action execution'ı durdur
                context.Result = new BadRequestObjectResult(errorResponse);

                // Correlation ID header'ını ekle
                if (!context.HttpContext.Response.Headers.ContainsKey("X-Correlation-ID"))
                {
                    context.HttpContext.Response.Headers.Add("X-Correlation-ID", correlationId);
                }
            }
            catch (Exception ex)
            {
                // Validation filter'inde hata olursa logla ama action'ı durdurmak
                _logger.LogError(ex, "Error in GlobalValidationActionFilter");
                
                // Hata durumunda normal akışa devam et
                // Global Exception Handler bu hatayı yakalayacak
            }
        }

        /// <summary>
        /// Action çalıştıktan sonra - bu implementasyonda kullanılmıyor
        /// </summary>
        /// <param name="context">Action executed context</param>
        public void OnActionExecuted(ActionExecutedContext context)
        {
            // Bu method'da özel bir işlem yapmıyoruz
            // Validation sadece action öncesinde yapılır
        }

        #endregion

        #region Private Methods

        /// <summary>
        /// ModelState'ten validation error mesajlarını çıkarır
        /// </summary>
        /// <param name="modelState">ModelState dictionary</param>
        /// <returns>Validation error mesajları listesi</returns>
        private static List<string> ExtractValidationErrors(Microsoft.AspNetCore.Mvc.ModelBinding.ModelStateDictionary modelState)
        {
            var errors = new List<string>();

            try
            {
                foreach (var kvp in modelState)
                {
                    var fieldName = kvp.Key;
                    var fieldState = kvp.Value;

                    if (fieldState?.Errors?.Count > 0)
                    {
                        foreach (var error in fieldState.Errors)
                        {
                            var errorMessage = !string.IsNullOrEmpty(error.ErrorMessage)
                                ? error.ErrorMessage
                                : error.Exception?.Message ?? "Bilinmeyen validation hatası";

                            // Sadece error message'ı ekle, field name'i ekleme
                            // Çünkü ASP.NET Core zaten field name'i error message'a dahil ediyor
                            errors.Add(errorMessage);
                        }
                    }
                }

                // Duplicate error'ları kaldır ve sırala
                return errors.Distinct().OrderBy(e => e).ToList();
            }
            catch (Exception)
            {
                // Hata çıkarma işleminde sorun olursa genel mesaj döndür
                return new List<string> { "Model validation hatası oluştu" };
            }
        }

        #endregion
    }

    /// <summary>
    /// Global Validation Middleware - Action Filter'ı middleware olarak kullanmak için wrapper
    /// </summary>
    /// <remarks>
    /// Bu sınıf GlobalValidationActionFilter'ı middleware gibi kullanmak için wrapper görevi görür.
    /// Gerçek validation logic'i GlobalValidationActionFilter'da yapılır.
    /// </remarks>
    public class GlobalValidationMiddleware
    {
        #region Private Fields

        /// <summary>
        /// HTTP request pipeline'daki bir sonraki middleware
        /// </summary>
        private readonly RequestDelegate _next;

        /// <summary>
        /// Logging servisi
        /// </summary>
        private readonly ILogger<GlobalValidationMiddleware> _logger;

        #endregion

        #region Constructor

        /// <summary>
        /// GlobalValidationMiddleware constructor
        /// </summary>
        /// <param name="next">Bir sonraki middleware</param>
        /// <param name="logger">Logging servisi</param>
        public GlobalValidationMiddleware(
            RequestDelegate next,
            ILogger<GlobalValidationMiddleware> logger)
        {
            _next = next ?? throw new ArgumentNullException(nameof(next));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Middleware'in ana method'u
        /// Bu implementasyonda sadece bir sonraki middleware'e geçer
        /// Gerçek validation GlobalValidationActionFilter'da yapılır
        /// </summary>
        /// <param name="context">HTTP context</param>
        /// <returns>Task</returns>
        public async Task InvokeAsync(HttpContext context)
        {
            // Global validation Action Filter tarafından yapıldığı için
            // bu middleware sadece bir sonraki middleware'e geçer
            await _next(context);
        }

        #endregion
    }
} 