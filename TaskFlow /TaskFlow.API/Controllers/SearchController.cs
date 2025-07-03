/*
 * SearchController.cs - Gelişmiş Arama API Controller'ı
 * ====================================================
 * Bu controller, TaskFlow uygulamasının gelişmiş arama özelliklerini sağlar.
 * 
 * ANA ÖZELLİKLER:
 * ===============
 * 🔍 Genel Arama (Global Search)
 *    - Tüm varlıklarda (görev, kategori, kullanıcı) aynı anda arama
 *    - Önbellekleme desteği ile hızlı sonuçlar
 *    - Kullanıcı bazlı güvenlik kontrolü
 * 
 * 🎯 Görev Araması (Task Search)
 *    - Detaylı filtreleme seçenekleri
 *    - Sayfalama (pagination) desteği
 *    - Çoklu sıralama kriterleri
 *    - Tarih aralığı filtrelemesi
 * 
 * 💡 Arama Önerileri (Search Suggestions)
 *    - Otomatik tamamlama (autocomplete) desteği
 *    - Akıllı öneri algoritması
 *    - Performans odaklı önbellekleme
 * 
 * GÜVENLİK ÖZELLİKLERİ:
 * =====================
 * 🔒 JWT Authentication zorunlu
 * 👤 Kullanıcı bazlı veri erişimi
 * 🛡️ Input validation ve sanitization
 * 📊 Rate limiting (gelecekte eklenebilir)
 * 
 * PERFORMANS İYİLEŞTİRMELERİ:
 * ===========================
 * ⚡ Redis cache entegrasyonu
 * 🗄️ Entity Framework optimizasyonları
 * 📄 Sayfalama ile büyük veri desteği
 * 🔢 LINQ sorgu optimizasyonları
 */

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Asp.Versioning;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;
using TaskFlow.API.Services;
using TaskFlow.API.Interfaces;

namespace TaskFlow.API.Controllers;

/// <summary>
/// Advanced Search functionality for TaskFlow application
/// Provides comprehensive search capabilities across tasks, categories, and users
/// </summary>
[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiVersion("1.0")]
[Authorize]
public class SearchController : ControllerBase
{
    private readonly ILogger<SearchController> _logger;
    private readonly TaskFlowDbContext _context;
    private readonly ICacheService _cacheService;

    public SearchController(
        ILogger<SearchController> logger,
        TaskFlowDbContext context,
        ICacheService cacheService)
    {
        _logger = logger;
        _context = context;
        _cacheService = cacheService;
    }

    /// <summary>
    /// Global search across all entities (tasks, categories, users)
    /// </summary>
    /// <param name="request">Search request parameters</param>
    /// <returns>Combined search results</returns>
    [HttpPost("global")]
    public async Task<IActionResult> GlobalSearch([FromBody] GlobalSearchRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Query))
            {
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Arama terimi boş olamaz",
                    Errors = new[] { "Arama terimi zorunludur" }.ToList()
                });
            }

            var cacheKey = $"global_search_{request.Query}_{request.GetHashCode()}";
            var cachedResult = await _cacheService.GetAsync<GlobalSearchResponse>(cacheKey);

            if (cachedResult != null)
            {
                return Ok(new ApiResponseModel<GlobalSearchResponse>
                {
                    Success = true,
                    Message = "Search results retrieved from cache",
                    Data = cachedResult
                });
            }

            // Get current user ID
            var userId = GetCurrentUserId();

            // Search tasks
            var taskResults = await SearchTasks(request, userId);
            
            // Search categories
            var categoryResults = await SearchCategories(request, userId);
            
            // Search users (if allowed)
            var userResults = request.IncludeUsers ? await SearchUsers(request) : new List<UserSearchResult>();

            var result = new GlobalSearchResponse
            {
                Query = request.Query,
                TotalResults = taskResults.Count + categoryResults.Count + userResults.Count,
                Tasks = taskResults,
                Categories = categoryResults,
                Users = userResults,
                SearchTime = DateTime.UtcNow
            };

            // Cache results for 5 minutes
            await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(5));

            return Ok(new ApiResponseModel<GlobalSearchResponse>
            {
                Success = true,
                Message = "Search completed successfully",
                Data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during global search for query: {Query}", request.Query);
            return StatusCode(500, new ApiResponseModel<object>
            {
                Success = false,
                Message = "Arama başarısız oldu",
                Errors = new[] { "Arama sırasında bir hata oluştu" }.ToList()
            });
        }
    }

    /// <summary>
    /// Advanced task search with filters
    /// </summary>
    /// <param name="request">Task search request</param>
    /// <returns>Filtered task results</returns>
    [HttpPost("tasks")]
    public async Task<IActionResult> SearchTasks([FromBody] TaskSearchRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var query = _context.TodoTasks
                .Where(t => t.UserId == userId)
                .AsQueryable();

            // Text search
            if (!string.IsNullOrWhiteSpace(request.Query))
            {
                query = query.Where(t => 
                    t.Title.Contains(request.Query) ||
                    t.Description.Contains(request.Query) ||
                    t.Category.Name.Contains(request.Query));
            }

            // Priority filter
            if (request.Priority.HasValue)
            {
                query = query.Where(t => t.Priority == request.Priority.Value);
            }

            // Status filter
            if (request.IsCompleted.HasValue)
            {
                query = query.Where(t => t.IsCompleted == request.IsCompleted.Value);
            }

            // Category filter
            if (request.CategoryId.HasValue)
            {
                query = query.Where(t => t.CategoryId == request.CategoryId.Value);
            }

            // Date range filter
            if (request.StartDate.HasValue)
            {
                query = query.Where(t => t.CreatedAt >= request.StartDate.Value);
            }

            if (request.EndDate.HasValue)
            {
                query = query.Where(t => t.CreatedAt <= request.EndDate.Value);
            }

            // Due date filter
            if (request.DueDateStart.HasValue)
            {
                query = query.Where(t => t.DueDate >= request.DueDateStart.Value);
            }

            if (request.DueDateEnd.HasValue)
            {
                query = query.Where(t => t.DueDate <= request.DueDateEnd.Value);
            }

            // Apply sorting
            query = request.SortBy?.ToLower() switch
            {
                "title" => request.SortOrder == "desc" ? query.OrderByDescending(t => t.Title) : query.OrderBy(t => t.Title),
                "priority" => request.SortOrder == "desc" ? query.OrderByDescending(t => t.Priority) : query.OrderBy(t => t.Priority),
                "duedate" => request.SortOrder == "desc" ? query.OrderByDescending(t => t.DueDate) : query.OrderBy(t => t.DueDate),
                "createdat" => request.SortOrder == "desc" ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt),
                _ => query.OrderByDescending(t => t.CreatedAt)
            };

            // f
            var totalCount = await query.CountAsync();
            var tasks = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Include(t => t.Category)
                .Select(t => new TaskSearchResult
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    Priority = t.Priority,
                    IsCompleted = t.IsCompleted,
                    DueDate = t.DueDate,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt,
                    CategoryName = t.Category.Name,
                    CategoryColor = t.Category.ColorCode
                })
                .ToListAsync();

            var result = new TaskSearchResponse
            {
                Query = request.Query,
                Tasks = tasks,
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / request.PageSize),
                HasNextPage = request.Page * request.PageSize < totalCount,
                HasPrevPage = request.Page > 1
            };

            return Ok(new ApiResponseModel<TaskSearchResponse>
            {
                Success = true,
                Message = "Task search completed successfully",
                Data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during task search");
            return StatusCode(500, new ApiResponseModel<object>
            {
                Success = false,
                Message = "Task search failed",
                Errors = new List<string> { "Görev araması sırasında bir hata oluştu" }
            });
        }
    }

    /// <summary>
    /// Get search suggestions for autocomplete
    /// </summary>
    /// <param name="query">Partial search term</param>
    /// <returns>Search suggestions</returns>
    [HttpGet("suggestions")]
    public async Task<IActionResult> GetSearchSuggestions([FromQuery] string query)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            {
                return Ok(new ApiResponseModel<SearchSuggestionsResponse>
                {
                    Success = true,
                    Message = "No suggestions available",
                    Data = new SearchSuggestionsResponse { Suggestions = new List<string>() }
                });
            }

            var cacheKey = $"search_suggestions_{query.ToLower()}";
            var cachedSuggestions = await _cacheService.GetAsync<SearchSuggestionsResponse>(cacheKey);

            if (cachedSuggestions != null)
            {
                return Ok(new ApiResponseModel<SearchSuggestionsResponse>
                {
                    Success = true,
                    Message = "Suggestions retrieved from cache",
                    Data = cachedSuggestions
                });
            }

            var userId = GetCurrentUserId();
            var suggestions = new List<string>();

            // Task title suggestions
            var taskTitles = await _context.TodoTasks
                .Where(t => t.UserId == userId && t.Title.Contains(query))
                .Select(t => t.Title)
                .Distinct()
                .Take(5)
                .ToListAsync();

            suggestions.AddRange(taskTitles);

            // Category name suggestions
            var categoryNames = await _context.Categories
                .Where(c => c.UserId == userId && c.Name.Contains(query))
                .Select(c => c.Name)
                .Distinct()
                .Take(3)
                .ToListAsync();

            suggestions.AddRange(categoryNames);

            // Remove duplicates and limit results
            suggestions = suggestions.Distinct().Take(8).ToList();

            var result = new SearchSuggestionsResponse
            {
                Suggestions = suggestions
            };

            // Cache suggestions for 10 minutes
            await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(10));

            return Ok(new ApiResponseModel<SearchSuggestionsResponse>
            {
                Success = true,
                Message = "Search suggestions retrieved successfully",
                Data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving search suggestions for query: {Query}", query);
            return StatusCode(500, new ApiResponseModel<object>
            {
                Success = false,
                Message = "Failed to retrieve search suggestions",
                Errors = new List<string> { "An error occurred while retrieving suggestions" }
            });
        }
    }

    #region Private Methods

    private async Task<List<TaskSearchResult>> SearchTasks(GlobalSearchRequest request, int userId)
    {
        return await _context.TodoTasks
            .Where(t => t.UserId == userId &&
                       (t.Title.Contains(request.Query) ||
                        t.Description.Contains(request.Query) ||
                        t.Category.Name.Contains(request.Query)))
            .Include(t => t.Category)
            .Take(request.MaxResults)
            .Select(t => new TaskSearchResult
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Priority = t.Priority,
                IsCompleted = t.IsCompleted,
                DueDate = t.DueDate,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                CategoryName = t.Category.Name,
                CategoryColor = t.Category.ColorCode
            })
            .ToListAsync();
    }

    private async Task<List<CategorySearchResult>> SearchCategories(GlobalSearchRequest request, int userId)
    {
        return await _context.Categories
            .Where(c => c.UserId == userId &&
                       (c.Name.Contains(request.Query) ||
                        c.Description.Contains(request.Query)))
            .Take(request.MaxResults)
            .Select(c => new CategorySearchResult
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Color = c.ColorCode,
                CreatedAt = c.CreatedAt,
                TaskCount = c.Tasks.Count
            })
            .ToListAsync();
    }

    private async Task<List<UserSearchResult>> SearchUsers(GlobalSearchRequest request)
    {
        return await _context.Users
            .Where(u => u.IsActive &&
                       (u.FirstName.Contains(request.Query) ||
                        u.LastName.Contains(request.Query) ||
                        u.Email.Contains(request.Query)))
            .Take(request.MaxResults)
            .Select(u => new UserSearchResult
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                ProfileImageUrl = u.ProfileImageUrl
            })
            .ToListAsync();
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }

    #endregion
} 