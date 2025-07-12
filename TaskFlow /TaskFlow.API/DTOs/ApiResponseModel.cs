// ****************************************************************************************************
//  APIRESPONSEMODEL.CS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının API response standardizasyon sisteminin ana DTO'sudur. Tüm API
//  endpoint'lerinden dönen response'ları tutarlı ve standart bir formatta sağlar. Frontend tarafında
//  response handling'i kolaylaştırır ve API tutarlılığını garanti eder.
//
//  ANA BAŞLIKLAR:
//  - Standardized API Response Format
//  - Success ve Error Response Factory Methods
//  - Validation Error Handling
//  - HTTP Status Code Mapping
//  - Response Metadata Management
//  - Frontend Integration Support
//
//  GÜVENLİK:
//  - Consistent error message format
//  - No sensitive data exposure
//  - Standardized response structure
//  - Input validation support
//  - Error logging compatibility
//
//  HATA YÖNETİMİ:
//  - Comprehensive error response types
//  - Validation error handling
//  - HTTP status code mapping
//  - Error message localization support
//  - Debug information inclusion
//
//  EDGE-CASE'LER:
//  - Null data responses
//  - Empty error lists
//  - Large response payloads
//  - Unicode message characters
//  - Timezone timestamp issues
//  - Generic type constraints
//
//  YAN ETKİLER:
//  - Consistent API contract
//  - Improved frontend integration
//  - Standardized error handling
//  - Enhanced debugging capabilities
//  - Reduced API documentation needs
//
//  PERFORMANS:
//  - Lightweight response wrapper
//  - Efficient serialization
//  - Minimal memory overhead
//  - Fast factory method execution
//  - Optimized for JSON serialization
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Generic type support
//  - Factory method pattern
//  - Comprehensive documentation
//  - Extensible response system
//  - Backward compatibility
// ****************************************************************************************************

namespace TaskFlow.API.DTOs;

/// <summary>
/// API response'ları için standardize edilmiş wrapper class
/// Tüm API endpoint'lerinden dönen response'ları tutarlı formatta sağlar
/// </summary>
/// <typeparam name="T">Response data'nın tipi</typeparam>
/// <remarks>
/// Bu generic class, API'den dönen tüm response'ları standart bir formata sokar.
/// Frontend tarafında response handling'i kolaylaştırır ve tutarlılık sağlar.
/// 
/// Response format:
/// {
///   "success": true/false,
///   "message": "İşlem başarılı",
///   "data": { actual data },
///   "errors": ["hata1", "hata2"],
///   "timestamp": "2025-01-01T00:00:00Z"
/// }
/// </remarks>
public class ApiResponseModel<T>
{
    /// <summary>
    /// İşlemin başarılı olup olmadığını belirten flag
    /// Frontend'de işlem sonucunu kontrol etmek için kullanılır
    /// </summary>
    /// <example>true</example>
    public bool Success { get; set; }

    /// <summary>
    /// İşlem hakkında kullanıcıya gösterilecek mesaj
    /// Başarılı işlemlerde bilgi, hatalılarda uyarı mesajı içerir
    /// </summary>
    /// <example>Kullanıcı başarıyla oluşturuldu</example>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Response'ın asıl veri içeriği
    /// Generic tip olarak tanımlanır, isteğe göre farklı tipler alabilir
    /// </summary>
    /// <example>{ "id": 1, "name": "Ali", "email": "ali@example.com" }</example>
    public T? Data { get; set; }

    /// <summary>
    /// Hata durumunda dönülecek hata mesajları listesi
    /// Validation hataları veya sistem hataları için kullanılır
    /// </summary>
    /// <example>["Email alanı zorunludur", "Şifre en az 6 karakter olmalıdır"]</example>
    public List<string>? Errors { get; set; }

    /// <summary>
    /// Response'ın oluşturulduğu UTC timestamp
    /// Debug ve logging için kullanışlıdır
    /// </summary>
    /// <example>2025-01-01T12:30:45.123Z</example>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Başarılı işlemler için static factory method
    /// Kolay ve tutarlı success response oluşturmak için kullanılır
    /// </summary>
    /// <param name="message">Başarı mesajı</param>
    /// <param name="data">Döndürülecek data</param>
    /// <returns>Başarılı ApiResponseModel instance'ı</returns>
    /// <example>
    /// return ApiResponseModel&lt;UserDto&gt;.SuccessResponse("Kullanıcı bulundu", userDto);
    /// </example>
    public static ApiResponseModel<T> SuccessResponse(string message, T data)
    {
        return new ApiResponseModel<T>
        {
            Success = true,
            Message = message,
            Data = data,
            Errors = null,
            Timestamp = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Başarılı işlemler için message-only static factory method
    /// Data olmadan sadece başarı mesajı döndürmek için kullanılır
    /// </summary>
    /// <param name="message">Başarı mesajı</param>
    /// <returns>Başarılı ApiResponseModel instance'ı</returns>
    /// <example>
    /// return ApiResponseModel&lt;object&gt;.SuccessResponse("İşlem başarılı");
    /// </example>
    public static ApiResponseModel<T> SuccessResponse(string message)
    {
        return new ApiResponseModel<T>
        {
            Success = true,
            Message = message,
            Data = default(T),
            Errors = null,
            Timestamp = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Hatalı işlemler için static factory method
    /// Error response oluşturmak için kullanılır
    /// </summary>
    /// <param name="message">Hata mesajı</param>
    /// <param name="errors">Detaylı hata listesi (opsiyonel)</param>
    /// <returns>Hatalı ApiResponseModel instance'ı</returns>
    /// <example>
    /// return ApiResponseModel&lt;object&gt;.ErrorResponse("Validation hatası", validationErrors);
    /// </example>
    public static ApiResponseModel<T> ErrorResponse(string message, List<string>? errors = null)
    {
        return new ApiResponseModel<T>
        {
            Success = false,
            Message = message,
            Data = default(T),
            Errors = errors,
            Timestamp = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Tek hata mesajı için static factory method
    /// Tek bir hata mesajını lista formatına çevirerek döndürür
    /// </summary>
    /// <param name="message">Ana hata mesajı</param>
    /// <param name="errorDetail">Detaylı hata mesajı</param>
    /// <returns>Hatalı ApiResponseModel instance'ı</returns>
    /// <example>
    /// return ApiResponseModel&lt;object&gt;.ErrorResponse("Kullanıcı bulunamadı", "ID: 123 geçersiz");
    /// </example>
    public static ApiResponseModel<T> ErrorResponse(string message, string errorDetail)
    {
        return new ApiResponseModel<T>
        {
            Success = false,
            Message = message,
            Data = default(T),
            Errors = new List<string> { errorDetail },
            Timestamp = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Validation hataları için özel factory method
    /// Model validation sonuçlarını API response'a çevirmek için kullanılır
    /// </summary>
    /// <param name="validationErrors">ModelState validation hataları</param>
    /// <returns>Validation hatası ApiResponseModel instance'ı</returns>
    /// <example>
    /// var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
    /// return ApiResponseModel&lt;object&gt;.ValidationErrorResponse(errors);
    /// </example>
    public static ApiResponseModel<T> ValidationErrorResponse(List<string> validationErrors)
    {
        return new ApiResponseModel<T>
        {
            Success = false,
            Message = "Validation hatası",
            Data = default(T),
            Errors = validationErrors,
            Timestamp = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Unauthorized (401) işlemler için static factory method
    /// Authentication başarısız durumları için kullanılır
    /// </summary>
    /// <param name="message">Unauthorized mesajı</param>
    /// <returns>Unauthorized ApiResponseModel instance'ı</returns>
    /// <example>
    /// return ApiResponseModel&lt;object&gt;.UnauthorizedResponse("Token geçersiz");
    /// </example>
    public static ApiResponseModel<T> UnauthorizedResponse(string message = "Bu işlem için yetkiniz bulunmamaktadır")
    {
        return new ApiResponseModel<T>
        {
            Success = false,
            Message = message,
            Data = default(T),
            Errors = new List<string> { "Unauthorized" },
            Timestamp = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Not Found (404) işlemler için static factory method
    /// Kaynak bulunamadığı durumlar için kullanılır
    /// </summary>
    /// <param name="message">Not found mesajı</param>
    /// <returns>Not Found ApiResponseModel instance'ı</returns>
    /// <example>
    /// return ApiResponseModel&lt;object&gt;.NotFoundResponse("Kullanıcı bulunamadı");
    /// </example>
    public static ApiResponseModel<T> NotFoundResponse(string message = "Kaynak bulunamadı")
    {
        return new ApiResponseModel<T>
        {
            Success = false,
            Message = message,
            Data = default(T),
            Errors = new List<string> { "Not Found" },
            Timestamp = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Server Error (500) işlemler için static factory method
    /// Internal server error durumları için kullanılır
    /// </summary>
    /// <param name="message">Server error mesajı</param>
    /// <returns>Server Error ApiResponseModel instance'ı</returns>
    /// <example>
    /// return ApiResponseModel&lt;object&gt;.ServerErrorResponse("Veritabanı bağlantı hatası");
    /// </example>
    public static ApiResponseModel<T> ServerErrorResponse(string message = "Sunucu hatası oluştu")
    {
        return new ApiResponseModel<T>
        {
            Success = false,
            Message = message,
            Data = default(T),
            Errors = new List<string> { "Internal Server Error" },
            Timestamp = DateTime.UtcNow
        };
    }
} 