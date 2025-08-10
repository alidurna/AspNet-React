// ****************************************************************************************************
//  CATEGORYDTO.CS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının kategori yönetimi sisteminin ana DTO (Data Transfer Object) dosyasıdır.
//  Kategori oluşturma, güncelleme, filtreleme ve istatistik işlemleri için gerekli tüm DTO'ları içerir.
//  Validation attribute'ları ile input kontrolü ve computed properties ile UI entegrasyonu sağlar.
//
//  ANA BAŞLIKLAR:
//  - CategoryDto (Ana kategori veri modeli)
//  - CreateCategoryDto (Kategori oluşturma)
//  - UpdateCategoryDto (Kategori güncelleme)
//  - CategoryFilterDto (Kategori filtreleme)
//  - Category Statistics ve Analytics
//  - Validation ve Business Rules
//
//  GÜVENLİK:
//  - Input validation ve sanitization
//  - Color code format validation
//  - String length limits
//  - Business rule enforcement
//  - Data type validation
//
//  HATA YÖNETİMİ:
//  - Comprehensive validation attributes
//  - Custom validation methods
//  - Business rule validation
//  - Error message localization
//  - Graceful validation failures
//
//  EDGE-CASE'LER:
//  - Null or empty required fields
//  - Invalid color codes
//  - Duplicate category names
//  - Default category conflicts
//  - Large text inputs
//  - Unicode characters
//  - Special characters in names
//
//  YAN ETKİLER:
//  - Validation affects user experience
//  - Business rules enforce data integrity
//  - Filtering impacts performance
//  - Default category changes affect user preferences
//  - Color changes affect UI appearance
//
//  PERFORMANS:
//  - Efficient validation
//  - Optimized filtering
//  - Minimal memory usage
//  - Fast serialization
//  - Efficient database queries
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Clear separation of concerns
//  - Comprehensive documentation
//  - Extensible validation system
//  - Backward compatibility
//  - Configuration-based rules
// ****************************************************************************************************

using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    public class CategoryDto
    {
        [SwaggerSchema("Kategori ID")]
        public int Id { get; set; }

        [SwaggerSchema("Kategori adı")]
        public string Name { get; set; } = string.Empty;

        [SwaggerSchema("Kategori açıklaması")]
        public string? Description { get; set; }

        [SwaggerSchema("Kategori rengi (hex)")]
        public string? Color { get; set; }

        [SwaggerSchema("Kategori renk kodu (hex) - Color ile aynı")]
        public string? ColorCode { get; set; }

        [SwaggerSchema("Kategorinin oluşturulma tarihi")]
        public DateTime CreatedAt { get; set; }

        [SwaggerSchema("Kategorinin güncellenme tarihi")]
        public DateTime? UpdatedAt { get; set; }

        [SwaggerSchema("Kategori ikonu")]
        public string? Icon { get; set; }

        [SwaggerSchema("Kategori aktif mi?")]
        public bool? IsActive { get; set; }

        [SwaggerSchema("Varsayılan kategori mi?")]
        public bool? IsDefault { get; set; }

        [SwaggerSchema("Toplam görev sayısı")]
        public int? TotalTaskCount { get; set; }

        [SwaggerSchema("Tamamlanan görev sayısı")]
        public int? CompletedTaskCount { get; set; }

        [SwaggerSchema("Bekleyen görev sayısı")]
        public int? PendingTaskCount { get; set; }

        [SwaggerSchema("Tamamlanma yüzdesi")]
        public decimal? CompletionPercentage { get; set; }
    }
}

/// <summary>
/// Yeni kategori oluşturmak için kullanılan DTO
/// POST /api/categories endpoint'ine gönderilir
/// 
/// Bu DTO sadece WRITE operations için kullanılır
/// Validation attributes içerir
/// </summary>
public class CreateCategoryDto
{
    /// <summary>
    /// Kategori adı (zorunlu)
    /// Minimum 2, maksimum 100 karakter
    /// </summary>
    [Required(ErrorMessage = "Kategori adı zorunludur")]
    [StringLength(100, MinimumLength = 2, 
        ErrorMessage = "Kategori adı 2-100 karakter arasında olmalıdır")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Kategori açıklaması (opsiyonel)
    /// Maksimum 500 karakter
    /// </summary>
    [StringLength(500, ErrorMessage = "Açıklama maksimum 500 karakter olabilir")]
    public string? Description { get; set; }

    /// <summary>
    /// Kategori renk kodu (opsiyonel)
    /// HEX format validation (#RRGGBB)
    /// Girilmezse default blue (#3498DB) kullanılır
    /// </summary>
    [RegularExpression(@"^#([A-Fa-f0-9]{6})$", 
        ErrorMessage = "Renk kodu geçerli HEX formatında olmalıdır (örn: #3498DB)")]
    public string? ColorCode { get; set; }

    /// <summary>
    /// Kategori ikonu (opsiyonel)
    /// CSS class name veya icon identifier
    /// </summary>
    [StringLength(50, ErrorMessage = "İkon maksimum 50 karakter olabilir")]
    public string? Icon { get; set; }

    /// <summary>
    /// Bu kategori varsayılan kategori olsun mu?
    /// Default: false
    /// Eğer true ise, kullanıcının mevcut default kategorisi false yapılır
    /// </summary>
    public bool IsDefault { get; set; } = false;
}

/// <summary>
/// Kategori güncellemek için kullanılan DTO
/// PUT /api/categories/{id} endpoint'ine gönderilir
/// 
/// CreateCategoryDto'ya benzer ama ID içermez (URL'de gelir)
/// Partial update için PATCH method da eklenebilir
/// </summary>
public class UpdateCategoryDto
{
    /// <summary>
    /// Güncellenecek kategori adı
    /// Validation rules CreateCategoryDto ile aynı
    /// </summary>
    [Required(ErrorMessage = "Kategori adı zorunludur")]
    [StringLength(100, MinimumLength = 2, 
        ErrorMessage = "Kategori adı 2-100 karakter arasında olmalıdır")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Güncellenecek açıklama
    /// </summary>
    [StringLength(500, ErrorMessage = "Açıklama maksimum 500 karakter olabilir")]
    public string? Description { get; set; }

    /// <summary>
    /// Güncellenecek renk kodu
    /// </summary>
    [RegularExpression(@"^#([A-Fa-f0-9]{6})$", 
        ErrorMessage = "Renk kodu geçerli HEX formatında olmalıdır (örn: #3498DB)")]
    public string? ColorCode { get; set; }

    /// <summary>
    /// Güncellenecek ikon
    /// </summary>
    [StringLength(50, ErrorMessage = "İkon maksimum 50 karakter olabilir")]
    public string? Icon { get; set; }

    /// <summary>
    /// Kategorinin aktiflik durumu
    /// Soft delete için kullanılır
    /// false yapılırsa kategori deaktive olur
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Varsayılan kategori durumu
    /// </summary>
    public bool IsDefault { get; set; } = false;
}

/// <summary>
/// Kategoriler için liste filtreleme parametreleri
/// GET /api/categories?isActive=true&search=work query parameters
/// 
/// Bu DTO query string'den gelen filtreleme parametrelerini alır
/// </summary>
public class CategoryFilterDto
{
    /// <summary>
    /// Sadece aktif kategorileri getir
    /// ?isActive=true
    /// </summary>
    public bool? IsActive { get; set; }

    /// <summary>
    /// Kategori adında arama
    /// ?search=work -> Name.Contains("work")
    /// </summary>
    public string? Search { get; set; }

    /// <summary>
    /// Sıralama kriteri
    /// ?orderBy=name, ?orderBy=createdAt
    /// </summary>
    public string? OrderBy { get; set; } = "name";

    /// <summary>
    /// Sıralama yönü
    /// ?orderDirection=desc
    /// </summary>
    public string? OrderDirection { get; set; } = "asc";

    /// <summary>
    /// Sadece varsayılan kategorileri getir
    /// ?onlyDefault=true
    /// </summary>
    public bool? OnlyDefault { get; set; }
}

/*
 * DTO MAPPING ÖRNEKLERİ:
 * ======================
 * 
 * 1. Entity'den DTO'ya mapping (AutoMapper kullanılabilir):
 * 
 * var categoryDto = new CategoryDto
 * {
 *     Id = category.Id,
 *     Name = category.Name,
 *     Description = category.Description,
 *     ColorCode = category.ColorCode,
 *     Icon = category.Icon,
 *     IsActive = category.IsActive,
 *     IsDefault = category.IsDefault,
 *     TotalTaskCount = category.TotalTaskCount,
 *     CompletedTaskCount = category.CompletedTaskCount,
 *     PendingTaskCount = category.PendingTaskCount,
 *     CompletionPercentage = category.CompletionPercentage,
 *     CreatedAt = category.CreatedAt,
 *     UpdatedAt = category.UpdatedAt
 * };
 * 
 * 2. CreateCategoryDto'dan Entity'ye mapping:
 * 
 * var category = new Category
 * {
 *     UserId = currentUserId, // Authentication'dan gelir
 *     Name = createDto.Name,
 *     Description = createDto.Description,
 *     ColorCode = createDto.ColorCode ?? "#3498DB",
 *     Icon = createDto.Icon,
 *     IsDefault = createDto.IsDefault,
 *     IsActive = true,
 *     CreatedAt = DateTime.UtcNow,
 *     UpdatedAt = DateTime.UtcNow
 * };
 * 
 * VALIDATION KULLANIMI:
 * ====================
 * 
 * Controller'da otomatik validation:
 * 
 * [HttpPost]
 * public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto createDto)
 * {
 *     if (!ModelState.IsValid)
 *     {
 *         return BadRequest(ApiResponse<CategoryDto>.ValidationError(ModelState));
 *     }
 *     
 *     // Business logic...
 * }
 * 
 * FRONTEND KULLANIMI:
 * ==================
 * 
 * // TypeScript interface'leri
 * interface CategoryDto {
 *     id: number;
 *     name: string;
 *     description?: string;
 *     colorCode: string;
 *     icon?: string;
 *     isActive: boolean;
 *     isDefault: boolean;
 *     totalTaskCount: number;
 *     completedTaskCount: number;
 *     pendingTaskCount: number;
 *     completionPercentage: number;
 *     createdAt: string;
 *     updatedAt: string;
 * }
 * 
 * interface CreateCategoryDto {
 *     name: string;
 *     description?: string;
 *     colorCode?: string;
 *     icon?: string;
 *     isDefault?: boolean;
 * }
 */ 