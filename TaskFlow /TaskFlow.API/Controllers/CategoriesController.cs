/*
 * CategoriesController.cs - Categories API Controller
 * ===================================================
 * 
 * Bu controller Categories entity'si için CRUD operations sağlar.
 * RESTful API design patterns kullanır.
 * Service Layer pattern ile business logic ayrıştırılmıştır.
 * 
 * HTTP METHODS & ENDPOINTS:
 * ========================
 * GET    /api/categories        -> Kullanıcının kategorilerini listele
 * GET    /api/categories/{id}   -> Belirli bir kategoriyi getir
 * POST   /api/categories        -> Yeni kategori oluştur
 * PUT    /api/categories/{id}   -> Kategoriyi tamamen güncelle
 * DELETE /api/categories/{id}   -> Kategoriyi sil (soft delete)
 * 
 * CONTROLLER PATTERN:
 * ==================
 * - Dependency Injection (DbContext)
 * - Model Binding & Validation
 * - HTTP Status Codes
 * - Error Handling
 * - Async/Await pattern
 * - Standardized API responses
 */

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;

namespace TaskFlow.API.Controllers;

/// <summary>
/// Categories API Controller
/// Kategori yönetimi için RESTful API endpoints sağlar
/// Service Layer pattern kullanarak business logic'i ayırır
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize] // Tüm endpoint'ler JWT token gerektirir
[Produces("application/json")]
public class CategoriesController : ControllerBase
{
    #region Private Fields

    /// <summary>
    /// Category business logic servisi
    /// CRUD operations ve business rules için kullanılır
    /// </summary>
    private readonly ICategoryService _categoryService;

    /// <summary>
    /// ASP.NET Core logging servisi
    /// Hata ve bilgi logları için kullanılır
    /// </summary>
    private readonly ILogger<CategoriesController> _logger;

    #endregion

    #region Constructor

    /// <summary>
    /// CategoriesController constructor
    /// Dependency Injection ile gerekli servisleri alır
    /// </summary>
    /// <param name="categoryService">Category business logic servisi</param>
    /// <param name="logger">Logging servisi</param>
    public CategoriesController(
        ICategoryService categoryService,
        ILogger<CategoriesController> logger)
    {
        _categoryService = categoryService ?? throw new ArgumentNullException(nameof(categoryService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    #endregion

    #region CRUD Endpoints

    /// <summary>
    /// Kullanıcının kategorilerini listeler
    /// Query parameters ile filtreleme destekler
    /// </summary>
    /// <param name="filter">Filtreleme parametreleri (query string'den gelir)</param>
    /// <returns>Kategoriler listesi</returns>
    /// <response code="200">Kategoriler başarıyla getirildi</response>
    /// <response code="401">Token geçersiz veya eksik</response>
    /// <response code="500">Sunucu hatası</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponseModel<List<CategoryDto>>), 200)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
    public async Task<ActionResult<ApiResponseModel<List<CategoryDto>>>> GetCategories(
        [FromQuery] CategoryFilterDto filter)
    {
        try
        {
            // JWT token'dan user ID'yi al
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
            }

            // CategoryService ile kategorileri getir
            var categories = await _categoryService.GetCategoriesAsync(userId.Value, filter);

            _logger.LogDebug("Retrieved {Count} categories for user {UserId}", categories.Count, userId.Value);

            return Ok(ApiResponseModel<List<CategoryDto>>.SuccessResponse(
                $"{categories.Count} kategori bulundu",
                categories));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting categories for user");
            return StatusCode(500, ApiResponseModel<List<CategoryDto>>.ErrorResponse(
                "Kategoriler getirilirken bir hata oluştu"));
        }
    }

    /// <summary>
    /// Belirli bir kategoriyi ID'sine göre getirir
    /// </summary>
    /// <param name="id">Kategori ID'si</param>
    /// <returns>Kategori detayları</returns>
    /// <response code="200">Kategori başarıyla getirildi</response>
    /// <response code="401">Token geçersiz veya eksik</response>
    /// <response code="404">Kategori bulunamadı</response>
    /// <response code="500">Sunucu hatası</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponseModel<CategoryDto>), 200)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
    public async Task<ActionResult<ApiResponseModel<CategoryDto>>> GetCategory(int id)
    {
        try
        {
            // JWT token'dan user ID'yi al
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
            }

            // CategoryService ile kategoriyi getir
            var category = await _categoryService.GetCategoryByIdAsync(userId.Value, id);

            if (category == null)
            {
                return NotFound(ApiResponseModel<CategoryDto>.ErrorResponse("Kategori bulunamadı"));
            }

            return Ok(ApiResponseModel<CategoryDto>.SuccessResponse(
                "Kategori başarıyla getirildi",
                category));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting category {CategoryId}", id);
            return StatusCode(500, ApiResponseModel<CategoryDto>.ErrorResponse(
                "Kategori getirilirken bir hata oluştu"));
        }
    }

    /// <summary>
    /// Yeni kategori oluşturur
    /// </summary>
    /// <param name="createDto">Kategori oluşturma bilgileri</param>
    /// <returns>Oluşturulan kategori</returns>
    /// <response code="201">Kategori başarıyla oluşturuldu</response>
    /// <response code="400">Geçersiz veri veya business rule ihlali</response>
    /// <response code="401">Token geçersiz veya eksik</response>
    /// <response code="500">Sunucu hatası</response>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponseModel<CategoryDto>), 201)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
    public async Task<ActionResult<ApiResponseModel<CategoryDto>>> CreateCategory(
        [FromBody] CreateCategoryDto createDto)
    {
        try
        {
            // Model validation
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponseModel<object>.ErrorResponse("Validation hatası", errors));
            }

            // JWT token'dan user ID'yi al
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
            }

            // CategoryService ile kategori oluştur
            var category = await _categoryService.CreateCategoryAsync(userId.Value, createDto);

            _logger.LogInformation("Category created successfully: {CategoryId} for user {UserId}", 
                category.Id, userId.Value);

            return CreatedAtAction(
                actionName: nameof(GetCategory),
                routeValues: new { id = category.Id },
                value: ApiResponseModel<CategoryDto>.SuccessResponse(
                    "Kategori başarıyla oluşturuldu",
                    category
                )
            );
        }
        catch (InvalidOperationException ex)
        {
            // Business rule violations
            _logger.LogWarning("Category creation failed: {Error}", ex.Message);
            return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating category");
            return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                "Kategori oluşturulurken bir hata oluştu"));
        }
    }

    /// <summary>
    /// Kategoriyi günceller
    /// </summary>
    /// <param name="id">Güncellenecek kategori ID'si</param>
    /// <param name="updateDto">Güncelleme bilgileri</param>
    /// <returns>Güncellenmiş kategori</returns>
    /// <response code="200">Kategori başarıyla güncellendi</response>
    /// <response code="400">Geçersiz veri veya business rule ihlali</response>
    /// <response code="401">Token geçersiz veya eksik</response>
    /// <response code="404">Kategori bulunamadı</response>
    /// <response code="500">Sunucu hatası</response>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponseModel<CategoryDto>), 200)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
    public async Task<ActionResult<ApiResponseModel<CategoryDto>>> UpdateCategory(
        int id, 
        [FromBody] UpdateCategoryDto updateDto)
    {
        try
        {
            // Model validation
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponseModel<object>.ErrorResponse("Validation hatası", errors));
            }

            // JWT token'dan user ID'yi al
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
            }

            // CategoryService ile kategoriyi güncelle
            var updatedCategory = await _categoryService.UpdateCategoryAsync(userId.Value, id, updateDto);

            _logger.LogInformation("Category updated successfully: {CategoryId}", id);

            return Ok(ApiResponseModel<CategoryDto>.SuccessResponse(
                "Kategori başarıyla güncellendi",
                updatedCategory
            ));
        }
        catch (InvalidOperationException ex)
        {
            // Business rule violations or not found
            _logger.LogWarning("Category update failed: {Error}", ex.Message);
            
            if (ex.Message.Contains("bulunamadı"))
            {
                return NotFound(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            
            return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating category {CategoryId}", id);
            return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                "Kategori güncellenirken bir hata oluştu"));
        }
    }

    /// <summary>
    /// Kategoriyi siler (soft delete)
    /// </summary>
    /// <param name="id">Silinecek kategori ID'si</param>
    /// <returns>Silme işlemi sonucu</returns>
    /// <response code="200">Kategori başarıyla silindi</response>
    /// <response code="401">Token geçersiz veya eksik</response>
    /// <response code="404">Kategori bulunamadı</response>
    /// <response code="500">Sunucu hatası</response>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
    public async Task<ActionResult<ApiResponseModel<object>>> DeleteCategory(int id)
    {
        try
        {
            // JWT token'dan user ID'yi al
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
            }

            // CategoryService ile kategoriyi sil
            var deleted = await _categoryService.DeleteCategoryAsync(userId.Value, id);

            if (!deleted)
            {
                return NotFound(ApiResponseModel<object>.ErrorResponse("Kategori bulunamadı"));
            }

            _logger.LogInformation("Category deleted successfully: {CategoryId}", id);

            return Ok(ApiResponseModel<object>.SuccessResponse(
                "Kategori başarıyla silindi"
            ));
        }
        catch (InvalidOperationException ex)
        {
            // Business rule violations
            _logger.LogWarning("Category deletion failed: {Error}", ex.Message);
            return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting category {CategoryId}", id);
            return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                "Kategori silinirken bir hata oluştu"));
        }
    }

    #endregion

    #region Statistics Endpoints

    /// <summary>
    /// Kullanıcının kategori özet istatistiklerini getirir
    /// </summary>
    /// <returns>Kategori özet istatistikleri</returns>
    /// <response code="200">İstatistikler başarıyla getirildi</response>
    /// <response code="401">Token geçersiz veya eksik</response>
    /// <response code="500">Sunucu hatası</response>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(ApiResponseModel<List<CategorySummaryDto>>), 200)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
    public async Task<ActionResult<ApiResponseModel<List<CategorySummaryDto>>>> GetCategoryStatistics()
    {
        try
        {
            // JWT token'dan user ID'yi al
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
            }

            // CategoryService ile özet istatistikleri getir
            var stats = await _categoryService.GetCategorySummaryAsync(userId.Value);

            return Ok(ApiResponseModel<List<CategorySummaryDto>>.SuccessResponse(
                "Kategori istatistikleri getirildi",
                stats
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting category statistics");
            return StatusCode(500, ApiResponseModel<List<CategorySummaryDto>>.ErrorResponse(
                "İstatistikler getirilirken bir hata oluştu"));
        }
    }

    #endregion

    #region Helper Methods

    /// <summary>
    /// JWT token'dan mevcut kullanıcının ID'sini alır
    /// </summary>
    /// <returns>User ID veya null</returns>
    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    #endregion
}

/*
 * CONTROLLER BEST PRACTICES UYGULAMASI:
 * =====================================
 * 
 * 1. ✅ Dependency Injection kullandık
 * 2. ✅ Async/Await pattern kullandık
 * 3. ✅ Proper HTTP status codes döndük
 * 4. ✅ Model validation yaptık
 * 5. ✅ Business rules validation yaptık
 * 6. ✅ Error handling implement ettik
 * 7. ✅ Standardized API responses kullandık
 * 8. ✅ DTO pattern uyguladık
 * 9. ✅ Soft delete kullandık
 * 10. ✅ Include ile related data getirdik
 * 
 * SONRAKI GELIŞTIRMELER:
 * =====================
 * 1. JWT Authentication (currentUserId)
 * 2. Logging (Serilog, NLog)
 * 3. Caching (Redis, Memory Cache)
 * 4. Rate Limiting
 * 5. API Versioning
 * 6. AutoMapper (DTO mapping için)
 * 7. FluentValidation (complex validation için)
 * 8. Unit Testing
 * 
 * HTTP STATUS CODES KULLANILAN:
 * ============================
 * - 200 OK: Başarılı GET, PUT
 * - 201 Created: Başarılı POST
 * - 400 Bad Request: Validation errors, business rule violations
 * - 404 Not Found: Resource bulunamadı
 * - 500 Internal Server Error: Beklenmeyen hatalar
 */ 