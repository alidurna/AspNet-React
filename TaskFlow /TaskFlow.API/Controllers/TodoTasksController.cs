using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;

namespace TaskFlow.API.Controllers
{
    /// <summary>
    /// TodoTask yönetimi için API Controller
    /// Task CRUD operations, filtering, completion tracking ve hierarchy management
    /// </summary>
    /// <remarks>
    /// Bu controller TaskFlow uygulamasının ana fonksiyonelliğini sağlar.
    /// Kullanıcıların görevlerini oluşturma, güncelleme, silme ve yönetme işlemleri yapılır.
    /// 
    /// Ana özellikler:
    /// - JWT tabanlı authentication (tüm endpoint'ler korumalı)
    /// - User isolation (kullanıcı sadece kendi task'larını görür)
    /// - Hierarchical tasks (parent-child ilişkisi)
    /// - Advanced filtering ve searching
    /// - Task completion tracking
    /// - Category integration
    /// </remarks>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Tüm endpoint'ler JWT token gerektirir
    [Produces("application/json")]
    public class TodoTasksController : ControllerBase
    {
        #region Private Fields

        /// <summary>
        /// Entity Framework database context
        /// Task, User, Category verilerine erişim için
        /// </summary>
        private readonly TaskFlowDbContext _context;

        /// <summary>
        /// ASP.NET Core logging servisi
        /// Hata ve bilgi logları için
        /// </summary>
        private readonly ILogger<TodoTasksController> _logger;

        #endregion

        #region Constructor

        /// <summary>
        /// TodoTasksController constructor
        /// Dependency Injection ile gerekli servisleri alır
        /// </summary>
        /// <param name="context">Database context</param>
        /// <param name="logger">Logging servisi</param>
        public TodoTasksController(
            TaskFlowDbContext context,
            ILogger<TodoTasksController> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        #endregion

        #region CRUD Endpoints

        /// <summary>
        /// Kullanıcının task'larını listeler (filtering ve pagination ile)
        /// Advanced search, filtering ve sorting desteği sağlar
        /// </summary>
        /// <param name="filter">Filtreleme ve sayfalama parametreleri</param>
        /// <returns>Filtrelenmiş task listesi</returns>
        /// <response code="200">Task listesi başarıyla getirildi</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponseModel<List<TodoTaskDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<List<TodoTaskDto>>>> GetTasks(
            [FromQuery] TodoTaskFilterDto filter)
        {
            try
            {
                // JWT token'dan user ID'yi al
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // Base query - sadece kendi task'ları
                var query = _context.TodoTasks
                    .Include(t => t.Category)
                    .Include(t => t.ParentTask)
                    .Where(t => t.UserId == userId.Value && t.IsActive);

                // ===== FILTERING =====

                // Kategori filtresi
                if (filter.CategoryId.HasValue)
                {
                    query = query.Where(t => t.CategoryId == filter.CategoryId.Value);
                }

                // Parent task filtresi
                if (filter.ParentTaskId.HasValue)
                {
                    query = query.Where(t => t.ParentTaskId == filter.ParentTaskId.Value);
                }
                else if (filter.OnlyParentTasks)
                {
                    query = query.Where(t => t.ParentTaskId == null);
                }

                // Completion status filtresi
                if (filter.IsCompleted.HasValue)
                {
                    query = query.Where(t => t.IsCompleted == filter.IsCompleted.Value);
                }

                // Priority filtresi
                if (!string.IsNullOrWhiteSpace(filter.Priority))
                {
                    if (Enum.TryParse<Priority>(filter.Priority, out var priority))
                    {
                        query = query.Where(t => t.Priority == priority);
                    }
                }

                // Text search (title ve description'da arama)
                if (!string.IsNullOrWhiteSpace(filter.SearchText))
                {
                    var searchLower = filter.SearchText.ToLower();
                    query = query.Where(t => 
                        t.Title.ToLower().Contains(searchLower) || 
                        (t.Description != null && t.Description.ToLower().Contains(searchLower)));
                }

                // Tag filtresi
                if (!string.IsNullOrWhiteSpace(filter.Tag))
                {
                    query = query.Where(t => 
                        t.Tags != null && t.Tags.ToLower().Contains(filter.Tag.ToLower()));
                }

                // Due date range filtresi
                if (filter.DueDateFrom.HasValue)
                {
                    query = query.Where(t => t.DueDate >= filter.DueDateFrom.Value);
                }
                if (filter.DueDateTo.HasValue)
                {
                    query = query.Where(t => t.DueDate <= filter.DueDateTo.Value);
                }

                // Overdue filtresi
                if (filter.IsOverdue == true)
                {
                    var now = DateTime.UtcNow;
                    query = query.Where(t => t.DueDate.HasValue && t.DueDate.Value < now && !t.IsCompleted);
                }

                // ===== SORTING =====
                query = filter.SortBy?.ToLower() switch
                {
                    "title" => filter.SortAscending ? query.OrderBy(t => t.Title) : query.OrderByDescending(t => t.Title),
                    "duedate" => filter.SortAscending ? query.OrderBy(t => t.DueDate) : query.OrderByDescending(t => t.DueDate),
                    "priority" => filter.SortAscending ? query.OrderBy(t => t.Priority) : query.OrderByDescending(t => t.Priority),
                    "createdat" => filter.SortAscending ? query.OrderBy(t => t.CreatedAt) : query.OrderByDescending(t => t.CreatedAt),
                    "updatedat" => filter.SortAscending ? query.OrderBy(t => t.UpdatedAt) : query.OrderByDescending(t => t.UpdatedAt),
                    "completion" => filter.SortAscending ? query.OrderBy(t => t.CompletionPercentage) : query.OrderByDescending(t => t.CompletionPercentage),
                    _ => query.OrderByDescending(t => t.CreatedAt) // Default: newest first
                };

                // ===== PAGINATION =====
                var totalCount = await query.CountAsync();
                var totalPages = (int)Math.Ceiling((double)totalCount / filter.PageSize);

                var tasks = await query
                    .Skip((filter.Page - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToListAsync();

                // ===== DTO MAPPING =====
                var taskDtos = new List<TodoTaskDto>();

                foreach (var task in tasks)
                {
                    var taskDto = await MapToDto(task, filter.IncludeSubTasks);
                    taskDtos.Add(taskDto);
                }

                // ===== RESPONSE =====
                var response = new
                {
                    Tasks = taskDtos,
                    Pagination = new
                    {
                        CurrentPage = filter.Page,
                        PageSize = filter.PageSize,
                        TotalCount = totalCount,
                        TotalPages = totalPages,
                        HasPreviousPage = filter.Page > 1,
                        HasNextPage = filter.Page < totalPages
                    },
                    FilterSummary = new
                    {
                        TotalTasks = totalCount,
                        CompletedTasks = taskDtos.Count(t => t.IsCompleted),
                        PendingTasks = taskDtos.Count(t => !t.IsCompleted),
                        OverdueTasks = taskDtos.Count(t => t.IsOverdue)
                    }
                };

                _logger.LogInformation("Tasks retrieved for user {UserId}: {Count} tasks", userId, totalCount);

                return Ok(ApiResponseModel<object>.SuccessResponse(
                    $"{totalCount} task bulundu (Sayfa {filter.Page}/{totalPages})",
                    response));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tasks for user");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Task'lar getirilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Belirli bir task'i ID'sine göre getirir
        /// Task detay sayfası için kullanılır
        /// </summary>
        /// <param name="id">Task ID'si</param>
        /// <returns>Task detayları</returns>
        /// <response code="200">Task detayları başarıyla getirildi</response>
        /// <response code="401">Token geçersiz</response>
        /// <response code="404">Task bulunamadı</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<TodoTaskDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<TodoTaskDto>>> GetTask(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // Task'i bul (sadece kendi task'ları)
                var task = await _context.TodoTasks
                    .Include(t => t.Category)
                    .Include(t => t.ParentTask)
                    .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId.Value && t.IsActive);

                if (task == null)
                {
                    return NotFound(ApiResponseModel<object>.ErrorResponse("Task bulunamadı"));
                }

                // DTO'ya map et (sub-tasks dahil)
                var taskDto = await MapToDto(task, includeSubTasks: true);

                return Ok(ApiResponseModel<TodoTaskDto>.SuccessResponse(
                    "Task detayları başarıyla getirildi",
                    taskDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving task {TaskId}", id);
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Task detayları getirilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Yeni task oluşturur
        /// Kategori ve parent task kontrolü yapar
        /// </summary>
        /// <param name="createDto">Yeni task bilgileri</param>
        /// <returns>Oluşturulan task</returns>
        /// <response code="201">Task başarıyla oluşturuldu</response>
        /// <response code="400">Geçersiz veri</response>
        /// <response code="401">Token geçersiz</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponseModel<TodoTaskDto>), 201)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<TodoTaskDto>>> CreateTask(
            [FromBody] CreateTodoTaskDto createDto)
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

                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // ===== BUSINESS VALIDATION =====

                // Kategori kontrolü
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Id == createDto.CategoryId && 
                                            c.UserId == userId.Value && 
                                            c.IsActive);

                if (category == null)
                {
                    return BadRequest(ApiResponseModel<object>.ErrorResponse(
                        "Seçilen kategori bulunamadı veya size ait değil"));
                }

                // Parent task kontrolü (eğer belirtilmişse)
                TodoTask? parentTask = null;
                if (createDto.ParentTaskId.HasValue)
                {
                    parentTask = await _context.TodoTasks
                        .FirstOrDefaultAsync(t => t.Id == createDto.ParentTaskId.Value && 
                                                t.UserId == userId.Value && 
                                                t.IsActive);

                    if (parentTask == null)
                    {
                        return BadRequest(ApiResponseModel<object>.ErrorResponse(
                            "Seçilen üst task bulunamadı veya size ait değil"));
                    }

                    // Circular reference kontrolü (derin hierarchy engellemek için)
                    var maxDepth = 5; // Business rule
                    var currentDepth = await GetTaskDepth(parentTask.Id);
                    if (currentDepth >= maxDepth)
                    {
                        return BadRequest(ApiResponseModel<object>.ErrorResponse(
                            $"Task hierarchy {maxDepth} seviyeden derin olamaz"));
                    }
                }

                // User task limit kontrolü
                var userTaskCount = await _context.TodoTasks
                    .CountAsync(t => t.UserId == userId.Value && t.IsActive);

                const int maxTasksPerUser = 1000; // Business rule
                if (userTaskCount >= maxTasksPerUser)
                {
                    return BadRequest(ApiResponseModel<object>.ErrorResponse(
                        $"Maksimum {maxTasksPerUser} task oluşturabilirsiniz"));
                }

                // ===== ENTITY CREATION =====
                var task = new TodoTask
                {
                    UserId = userId.Value,
                    CategoryId = createDto.CategoryId,
                    ParentTaskId = createDto.ParentTaskId,
                    Title = createDto.Title.Trim(),
                    Description = string.IsNullOrWhiteSpace(createDto.Description) 
                        ? null 
                        : createDto.Description.Trim(),
                    Priority = Enum.Parse<Priority>(createDto.Priority),
                    CompletionPercentage = createDto.CompletionPercentage,
                    DueDate = createDto.DueDate,
                    ReminderDate = createDto.ReminderDate,
                    StartDate = createDto.StartDate,
                    IsCompleted = createDto.CompletionPercentage >= 100,
                    CompletedAt = createDto.CompletionPercentage >= 100 ? DateTime.UtcNow : null,
                    IsActive = true,
                    Tags = string.IsNullOrWhiteSpace(createDto.Tags) 
                        ? null 
                        : createDto.Tags.Trim(),
                    Notes = string.IsNullOrWhiteSpace(createDto.Notes) 
                        ? null 
                        : createDto.Notes.Trim(),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Database'e ekle
                _context.TodoTasks.Add(task);
                await _context.SaveChangesAsync();

                _logger.LogInformation("New task created: {TaskId} by user {UserId}", task.Id, userId);

                // DTO'ya map et
                var taskDto = await MapToDto(task, includeSubTasks: false);

                return CreatedAtAction(
                    nameof(GetTask),
                    new { id = task.Id },
                    ApiResponseModel<TodoTaskDto>.SuccessResponse(
                        "Task başarıyla oluşturuldu",
                        taskDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating task for user");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Task oluşturulurken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Mevcut task'i günceller
        /// Partial update desteği sağlar
        /// </summary>
        /// <param name="id">Task ID'si</param>
        /// <param name="updateDto">Güncellenecek task bilgileri</param>
        /// <returns>Güncellenmiş task</returns>
        /// <response code="200">Task başarıyla güncellendi</response>
        /// <response code="400">Geçersiz veri</response>
        /// <response code="401">Token geçersiz</response>
        /// <response code="404">Task bulunamadı</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<TodoTaskDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<TodoTaskDto>>> UpdateTask(
            int id,
            [FromBody] UpdateTodoTaskDto updateDto)
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

                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // Task'i bul
                var task = await _context.TodoTasks
                    .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId.Value && t.IsActive);

                if (task == null)
                {
                    return NotFound(ApiResponseModel<object>.ErrorResponse("Task bulunamadı"));
                }

                // ===== BUSINESS VALIDATION =====

                // Kategori kontrolü (eğer değiştirilmişse)
                if (updateDto.CategoryId.HasValue && updateDto.CategoryId != task.CategoryId)
                {
                    var category = await _context.Categories
                        .FirstOrDefaultAsync(c => c.Id == updateDto.CategoryId.Value && 
                                                c.UserId == userId.Value && 
                                                c.IsActive);

                    if (category == null)
                    {
                        return BadRequest(ApiResponseModel<object>.ErrorResponse(
                            "Seçilen kategori bulunamadı veya size ait değil"));
                    }
                }

                // Parent task kontrolü (eğer değiştirilmişse)
                if (updateDto.ParentTaskId.HasValue && updateDto.ParentTaskId != task.ParentTaskId)
                {
                    if (updateDto.ParentTaskId == task.Id)
                    {
                        return BadRequest(ApiResponseModel<object>.ErrorResponse(
                            "Task kendisinin alt task'ı olamaz"));
                    }

                    var parentTask = await _context.TodoTasks
                        .FirstOrDefaultAsync(t => t.Id == updateDto.ParentTaskId.Value && 
                                                t.UserId == userId.Value && 
                                                t.IsActive);

                    if (parentTask == null)
                    {
                        return BadRequest(ApiResponseModel<object>.ErrorResponse(
                            "Seçilen üst task bulunamadı veya size ait değil"));
                    }

                    // Circular reference kontrolü
                    if (await IsCircularReference(task.Id, updateDto.ParentTaskId.Value))
                    {
                        return BadRequest(ApiResponseModel<object>.ErrorResponse(
                            "Bu işlem döngüsel referans oluşturacaktır"));
                    }
                }

                // ===== UPDATE ENTITY =====
                var wasCompleted = task.IsCompleted;

                // Sadece null olmayan değerleri güncelle (partial update)
                if (updateDto.CategoryId.HasValue)
                    task.CategoryId = updateDto.CategoryId.Value;

                if (updateDto.ParentTaskId.HasValue)
                    task.ParentTaskId = updateDto.ParentTaskId.Value;

                if (!string.IsNullOrWhiteSpace(updateDto.Title))
                    task.Title = updateDto.Title.Trim();

                if (updateDto.Description != null)
                    task.Description = string.IsNullOrWhiteSpace(updateDto.Description) 
                        ? null 
                        : updateDto.Description.Trim();

                if (!string.IsNullOrWhiteSpace(updateDto.Priority))
                    task.Priority = Enum.Parse<Priority>(updateDto.Priority);

                if (updateDto.CompletionPercentage.HasValue)
                {
                    task.CompletionPercentage = updateDto.CompletionPercentage.Value;
                    
                    // Completion status güncelle
                    var isNowCompleted = updateDto.CompletionPercentage.Value >= 100;
                    if (isNowCompleted && !wasCompleted)
                    {
                        task.IsCompleted = true;
                        task.CompletedAt = DateTime.UtcNow;
                    }
                    else if (!isNowCompleted && wasCompleted)
                    {
                        task.IsCompleted = false;
                        task.CompletedAt = null;
                    }
                }

                if (updateDto.DueDate.HasValue)
                    task.DueDate = updateDto.DueDate.Value;

                if (updateDto.ReminderDate.HasValue)
                    task.ReminderDate = updateDto.ReminderDate.Value;

                if (updateDto.StartDate.HasValue)
                    task.StartDate = updateDto.StartDate.Value;

                if (updateDto.Tags != null)
                    task.Tags = string.IsNullOrWhiteSpace(updateDto.Tags) 
                        ? null 
                        : updateDto.Tags.Trim();

                if (updateDto.Notes != null)
                    task.Notes = string.IsNullOrWhiteSpace(updateDto.Notes) 
                        ? null 
                        : updateDto.Notes.Trim();

                task.UpdatedAt = DateTime.UtcNow;

                // Değişiklikleri kaydet
                await _context.SaveChangesAsync();

                _logger.LogInformation("Task updated: {TaskId} by user {UserId}", id, userId);

                // DTO'ya map et
                var taskDto = await MapToDto(task, includeSubTasks: false);

                return Ok(ApiResponseModel<TodoTaskDto>.SuccessResponse(
                    "Task başarıyla güncellendi",
                    taskDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating task {TaskId}", id);
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Task güncellenirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Task'i siler (soft delete)
        /// İlişkili alt task'ları da pasif yapar
        /// </summary>
        /// <param name="id">Task ID'si</param>
        /// <returns>Silme sonucu</returns>
        /// <response code="200">Task başarıyla silindi</response>
        /// <response code="401">Token geçersiz</response>
        /// <response code="404">Task bulunamadı</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<object>>> DeleteTask(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // Task'i bul
                var task = await _context.TodoTasks
                    .Include(t => t.SubTasks)
                    .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId.Value && t.IsActive);

                if (task == null)
                {
                    return NotFound(ApiResponseModel<object>.ErrorResponse("Task bulunamadı"));
                }

                // Soft delete - task ve alt task'ları pasif yap
                await SoftDeleteTaskAndSubTasks(task);

                await _context.SaveChangesAsync();

                _logger.LogInformation("Task deleted: {TaskId} by user {UserId}", id, userId);

                var deletedCount = 1 + (task.SubTasks?.Count(st => st.IsActive) ?? 0);

                return Ok(ApiResponseModel<object>.SuccessResponse(
                    $"Task ve {deletedCount - 1} alt task başarıyla silindi"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting task {TaskId}", id);
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Task silinirken bir hata oluştu"));
            }
        }

        #endregion

        #region Special Operations

        /// <summary>
        /// Task'i tamamlar veya tamamlamayı geri alır
        /// Completion tracking için özel endpoint
        /// </summary>
        /// <param name="id">Task ID'si</param>
        /// <param name="completeDto">Completion bilgileri</param>
        /// <returns>Güncellenmiş task</returns>
        [HttpPatch("{id:int}/complete")]
        [ProducesResponseType(typeof(ApiResponseModel<TodoTaskDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        public async Task<ActionResult<ApiResponseModel<TodoTaskDto>>> CompleteTask(
            int id,
            [FromBody] CompleteTaskDto completeDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var task = await _context.TodoTasks
                    .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId.Value && t.IsActive);

                if (task == null)
                {
                    return NotFound(ApiResponseModel<object>.ErrorResponse("Task bulunamadı"));
                }

                // Completion status güncelle
                task.IsCompleted = completeDto.IsCompleted;
                task.CompletionPercentage = completeDto.CompletionPercentage ?? 
                    (completeDto.IsCompleted ? 100 : task.CompletionPercentage);
                task.CompletedAt = completeDto.IsCompleted ? DateTime.UtcNow : null;
                task.UpdatedAt = DateTime.UtcNow;

                // Completion note varsa notes'a ekle
                if (!string.IsNullOrWhiteSpace(completeDto.CompletionNote))
                {
                    var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");
                    var note = $"[{timestamp}] Tamamlama notu: {completeDto.CompletionNote}";
                    task.Notes = string.IsNullOrWhiteSpace(task.Notes) 
                        ? note 
                        : $"{task.Notes}\n\n{note}";
                }

                await _context.SaveChangesAsync();

                var action = completeDto.IsCompleted ? "tamamlandı" : "tamamlama geri alındı";
                _logger.LogInformation("Task {Action}: {TaskId} by user {UserId}", action, id, userId);

                var taskDto = await MapToDto(task, includeSubTasks: false);

                return Ok(ApiResponseModel<TodoTaskDto>.SuccessResponse(
                    $"Task {action}",
                    taskDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing task {TaskId}", id);
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Task completion güncellenirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Kullanıcının task istatistiklerini getirir
        /// Dashboard için özet bilgiler
        /// </summary>
        /// <returns>Task istatistikleri</returns>
        [HttpGet("statistics")]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<ApiResponseModel<object>>> GetTaskStatistics()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var now = DateTime.UtcNow;

                var stats = new
                {
                    TotalTasks = await _context.TodoTasks.CountAsync(t => t.UserId == userId.Value && t.IsActive),
                    CompletedTasks = await _context.TodoTasks.CountAsync(t => t.UserId == userId.Value && t.IsActive && t.IsCompleted),
                    PendingTasks = await _context.TodoTasks.CountAsync(t => t.UserId == userId.Value && t.IsActive && !t.IsCompleted),
                    OverdueTasks = await _context.TodoTasks.CountAsync(t => t.UserId == userId.Value && t.IsActive && !t.IsCompleted && t.DueDate.HasValue && t.DueDate.Value < now),
                    TodayTasks = await _context.TodoTasks.CountAsync(t => t.UserId == userId.Value && t.IsActive && t.DueDate.HasValue && t.DueDate.Value.Date == now.Date),
                    ThisWeekTasks = await _context.TodoTasks.CountAsync(t => t.UserId == userId.Value && t.IsActive && t.DueDate.HasValue && t.DueDate.Value >= now.Date && t.DueDate.Value < now.Date.AddDays(7)),
                    HighPriorityTasks = await _context.TodoTasks.CountAsync(t => t.UserId == userId.Value && t.IsActive && !t.IsCompleted && (t.Priority == Priority.High || t.Priority == Priority.Critical)),
                    TasksByCategory = await _context.TodoTasks
                        .Where(t => t.UserId == userId.Value && t.IsActive)
                        .GroupBy(t => new { t.CategoryId, t.Category.Name })
                        .Select(g => new { CategoryId = g.Key.CategoryId, CategoryName = g.Key.Name, TaskCount = g.Count() })
                        .ToListAsync(),
                    TasksByPriority = await _context.TodoTasks
                        .Where(t => t.UserId == userId.Value && t.IsActive)
                        .GroupBy(t => t.Priority)
                        .Select(g => new { Priority = g.Key.ToString(), TaskCount = g.Count() })
                        .ToListAsync()
                };

                return Ok(ApiResponseModel<object>.SuccessResponse(
                    "Task istatistikleri başarıyla getirildi",
                    stats));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting task statistics for user");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "İstatistikler getirilirken bir hata oluştu"));
            }
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// JWT token'dan mevcut kullanıcı ID'sini alma helper methodu
        /// </summary>
        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return null;
            }

            return userId;
        }

        /// <summary>
        /// TodoTask entity'sini TodoTaskDto'ya map eden helper method
        /// </summary>
        private async Task<TodoTaskDto> MapToDto(TodoTask task, bool includeSubTasks = false)
        {
            var dto = new TodoTaskDto
            {
                Id = task.Id,
                UserId = task.UserId,
                CategoryId = task.CategoryId,
                ParentTaskId = task.ParentTaskId,
                Title = task.Title,
                Description = task.Description,
                Priority = task.Priority.ToString(),
                CompletionPercentage = task.CompletionPercentage,
                DueDate = task.DueDate,
                ReminderDate = task.ReminderDate,
                StartDate = task.StartDate,
                IsCompleted = task.IsCompleted,
                CompletedAt = task.CompletedAt,
                IsActive = task.IsActive,
                Tags = task.Tags,
                Notes = task.Notes,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt
            };

            // Category bilgilerini ekle
            if (task.Category != null)
            {
                dto.Category = new CategoryDto
                {
                    Id = task.Category.Id,
                    Name = task.Category.Name,
                    Description = task.Category.Description,
                    ColorCode = task.Category.ColorCode,
                    Icon = task.Category.Icon,
                    IsActive = task.Category.IsActive,
                    IsDefault = task.Category.IsDefault,
                    CreatedAt = task.Category.CreatedAt,
                    UpdatedAt = task.Category.UpdatedAt
                };
            }

            // Parent task bilgilerini ekle (sığ mapping)
            if (task.ParentTask != null)
            {
                dto.ParentTask = new TodoTaskDto
                {
                    Id = task.ParentTask.Id,
                    Title = task.ParentTask.Title,
                    IsCompleted = task.ParentTask.IsCompleted,
                    Priority = task.ParentTask.Priority.ToString()
                };
            }

            // Sub-tasks ekle (eğer istenirse)
            if (includeSubTasks)
            {
                var subTasks = await _context.TodoTasks
                    .Include(t => t.Category)
                    .Where(t => t.ParentTaskId == task.Id && t.IsActive)
                    .ToListAsync();

                dto.SubTasks = new List<TodoTaskDto>();
                foreach (var subTask in subTasks)
                {
                    var subTaskDto = await MapToDto(subTask, false); // Recursive olmayı engelle
                    dto.SubTasks.Add(subTaskDto);
                }
            }

            return dto;
        }

        /// <summary>
        /// Task hierarchy depth hesaplama
        /// </summary>
        private async Task<int> GetTaskDepth(int taskId)
        {
            var depth = 0;
            int? currentTaskId = taskId;

            while (currentTaskId.HasValue)
            {
                var parentTask = await _context.TodoTasks
                    .Where(t => t.Id == currentTaskId.Value)
                    .Select(t => t.ParentTaskId)
                    .FirstOrDefaultAsync();

                if (parentTask == null)
                    break;

                depth++;
                currentTaskId = parentTask;

                // Infinite loop engellemek için maksimum depth
                if (depth > 10)
                    break;
            }

            return depth;
        }

        /// <summary>
        /// Circular reference kontrolü
        /// </summary>
        private async Task<bool> IsCircularReference(int taskId, int newParentId)
        {
            int? currentParentId = newParentId;

            while (currentParentId.HasValue)
            {
                if (currentParentId.Value == taskId)
                    return true; // Circular reference bulundu

                var parent = await _context.TodoTasks
                    .Where(t => t.Id == currentParentId.Value)
                    .Select(t => t.ParentTaskId)
                    .FirstOrDefaultAsync();

                currentParentId = parent;
            }

            return false;
        }

        /// <summary>
        /// Task ve alt task'larını soft delete yapan recursive method
        /// </summary>
        private async Task SoftDeleteTaskAndSubTasks(TodoTask task)
        {
            task.IsActive = false;
            task.UpdatedAt = DateTime.UtcNow;

            // Alt task'ları da recursively sil
            var subTasks = await _context.TodoTasks
                .Where(t => t.ParentTaskId == task.Id && t.IsActive)
                .ToListAsync();

            foreach (var subTask in subTasks)
            {
                await SoftDeleteTaskAndSubTasks(subTask);
            }
        }

        #endregion
    }
} 