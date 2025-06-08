/*
 * ApiResponse.cs - Standart API Response Modeli
 * =============================================
 */

namespace TaskFlow.API.DTOs;

/// <summary>
/// Generic API response wrapper
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public object? Errors { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Success with data
    public static ApiResponse<T> CreateSuccess(T data, string message)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data,
            Timestamp = DateTime.UtcNow
        };
    }

    // Success with message only
    public static ApiResponse<T> SuccessMessage(string message)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = default(T),
            Timestamp = DateTime.UtcNow
        };
    }

    // Error response
    public static ApiResponse<T> Error(string message, object? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Data = default(T),
            Errors = errors,
            Timestamp = DateTime.UtcNow
        };
    }

    // Validation error
    public static ApiResponse<T> ValidationError(object validationErrors)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = "Girilen bilgilerde hatalar var",
            Data = default(T),
            Errors = validationErrors,
            Timestamp = DateTime.UtcNow
        };
    }
} 