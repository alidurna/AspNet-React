using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;
using TaskFlow.API.Models;
using Asp.Versioning;

namespace TaskFlow.API.Controllers
{
    // ****************************************************************************************************
    //  TODOTASKSCONTROLLER.CS
    //  --------------------------------------------------------------------------------------------------
    //  Bu dosya, TaskFlow uygulamasının görev yönetimi sisteminin ana API controller'ıdır. Kullanıcıların
    //  görevlerini oluşturma, güncelleme, silme, tamamlama, filtreleme ve arama işlemlerini yönetir.
    //  Ayrıca görev istatistikleri, alt görev yönetimi ve zaman bazlı görev listeleme özelliklerini sağlar.
    //
    //  ANA BAŞLIKLAR:
    //  - CRUD Operations (Create, Read, Update, Delete)
    //  - Task Completion ve Progress Tracking
    //  - Advanced Filtering ve Search
    //  - Time-based Task Queries (Today, This Week, Overdue)
    //  - Sub-task Management (Hierarchical Tasks)
    //  - Task Statistics ve Analytics
    //  - Priority-based Operations
    //
    //  GÜVENLİK:
    //  - JWT tabanlı authentication (tüm endpoint'ler korumalı)
    //  - User isolation (kullanıcı sadece kendi görevlerini görür)
    //  - Input validation ve sanitization
    //  - Business rule enforcement
    //
    //  HATA YÖNETİMİ:
    //  - Comprehensive try-catch blocks
    //  - Specific exception handling (NotFound, Validation, etc.)
    //  - Detailed logging for debugging
    //  - Consistent error response format
    //
    //  EDGE-CASE'LER:
    //  - Circular parent-child relationships
    //  - Invalid task IDs veya non-existent tasks
    //  - Empty search results
    //  - Large dataset pagination
    //  - Concurrent task modifications
    //  - Invalid date ranges
    //
    //  YAN ETKİLER:
    //  - Task completion triggers sub-task updates
    //  - Progress updates affect parent task completion
    //  - Task deletion cascades to sub-tasks
    //  - Statistics are calculated in real-time
    //  - Search operations may be resource-intensive
    //
    //  PERFORMANS:
    //  - Pagination for large datasets
    //  - Efficient database queries with includes
    //  - Caching for frequently accessed data
    //  - Optimized search algorithms
    //
    //  SÜRDÜRÜLEBİLİRLİK:
    //  - Service layer pattern
    //  - Dependency injection
    //  - Comprehensive documentation
    //  - Extensible architecture
    // ****************************************************************************************************
    /// <summary>
    /// TodoTask yönetimi için API Controller
    /// Task CRUD operations, filtering, completion tracking ve hierarchy management
    /// Service Layer pattern kullanarak business logic'i ayırır
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
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Authorize] // Tüm endpoint'ler JWT token gerektirir
    [Produces("application/json")]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
    public class TodoTasksController : ControllerBase
    {
        #region Private Fields

        /// <summary>
        /// Task business logic servisi
        /// CRUD operations ve business rules için kullanılır
        /// </summary>
        private readonly ITaskService _taskService;

        /// <summary>
        /// ASP.NET Core logging servisi
        /// Hata ve bilgi logları için kullanılır
        /// </summary>
        private readonly ILogger<TodoTasksController> _logger;

        #endregion

        #region Constructor

        /// <summary>
        /// TodoTasksController constructor
        /// Dependency Injection ile gerekli servisleri alır
        /// </summary>
        /// <param name="taskService">Task business logic servisi</param>
        /// <param name="logger">Logging servisi</param>
        public TodoTasksController(
            ITaskService taskService,
            ILogger<TodoTasksController> logger)
        {
            _taskService = taskService ?? throw new ArgumentNullException(nameof(taskService));
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
        [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<object>>> GetTasks(
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

                // TaskService ile task'ları getir (pagination ile)
                var (tasks, pagination) = await _taskService.GetTasksAsync(userId.Value, filter);

                _logger.LogDebug("Retrieved {Count} tasks for user {UserId}", tasks.Count, userId.Value);

                // Response object oluştur
                var response = new
                {
                    Tasks = tasks,
                    Pagination = pagination
                };

                return Ok(ApiResponseModel<object>.SuccessResponse(
                    $"{tasks.Count} görev bulundu",
                    response
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tasks for user");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Görevler getirilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Belirli bir task'ı ID'sine göre getirir
        /// </summary>
        /// <param name="id">Task ID'si</param>
        /// <returns>Task detayları</returns>
        /// <response code="200">Task başarıyla getirildi</response>
        /// <response code="401">Token geçersiz veya eksik</response>
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
                // JWT token'dan user ID'yi al
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // TaskService ile task'ı getir
                var task = await _taskService.GetTaskByIdAsync(userId.Value, id, includeSubTasks: true);

                if (task == null)
                {
                    return NotFound(ApiResponseModel<TodoTaskDto>.ErrorResponse("Görev bulunamadı"));
                }

                return Ok(ApiResponseModel<TodoTaskDto>.SuccessResponse(
                    "Görev başarıyla getirildi",
                    task
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting task {TaskId}", id);
                return StatusCode(500, ApiResponseModel<TodoTaskDto>.ErrorResponse(
                    "Görev getirilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Yeni task oluşturur
        /// </summary>
        /// <param name="createDto">Task oluşturma bilgileri</param>
        /// <returns>Oluşturulan task</returns>
        /// <response code="201">Task başarıyla oluşturuldu</response>
        /// <response code="400">Geçersiz veri veya business rule ihlali</response>
        /// <response code="401">Token geçersiz veya eksik</response>
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
                // Model validation artık GlobalValidationActionFilter tarafından handle ediliyor

                // JWT token'dan user ID'yi al
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // TaskService ile task oluştur
                var task = await _taskService.CreateTaskAsync(userId.Value, createDto);

                _logger.LogInformation("Task created successfully: {TaskId} for user {UserId}", 
                    task.Id, userId.Value);

                return CreatedAtAction(
                    actionName: nameof(GetTask),
                    routeValues: new { id = task.Id },
                    value: ApiResponseModel<TodoTaskDto>.SuccessResponse(
                        "Görev başarıyla oluşturuldu",
                        task
                    )
                );
            }
            catch (InvalidOperationException ex)
            {
                // Business rule violations
                _logger.LogWarning("Task creation failed: {Error}", ex.Message);
                return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating task");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Görev oluşturulurken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Task'ı günceller
        /// </summary>
        /// <param name="id">Güncellenecek task ID'si</param>
        /// <param name="updateDto">Güncelleme bilgileri</param>
        /// <returns>Güncellenmiş task</returns>
        /// <response code="200">Task başarıyla güncellendi</response>
        /// <response code="400">Geçersiz veri veya business rule ihlali</response>
        /// <response code="401">Token geçersiz veya eksik</response>
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
                // Model validation artık GlobalValidationActionFilter tarafından handle ediliyor

                // JWT token'dan user ID'yi al
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // TaskService ile task'ı güncelle
                var updatedTask = await _taskService.UpdateTaskAsync(userId.Value, id, updateDto);

                _logger.LogInformation("Task updated successfully: {TaskId}", id);

                return Ok(ApiResponseModel<TodoTaskDto>.SuccessResponse(
                    "Görev başarıyla güncellendi",
                    updatedTask
                ));
            }
            catch (InvalidOperationException ex)
            {
                // Business rule violations or not found
                _logger.LogWarning("Task update failed: {Error}", ex.Message);
                
                if (ex.Message.Contains("bulunamadı"))
                {
                    return NotFound(ApiResponseModel<object>.ErrorResponse(ex.Message));
                }
                
                return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating task {TaskId}", id);
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Görev güncellenirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Belirtilen görevleri toplu olarak siler.
        /// </summary>
        /// <param name="bulkDeleteDto">Silinecek görev ID'lerinin listesini içeren DTO.</param>
        /// <returns>Silinen görev sayısı.</returns>
        /// <response code="200">Görevler başarıyla silindi.</response>
        /// <response code="400">Geçersiz veri veya business rule ihlali.</response>
        /// <response code="401">Token geçersiz veya eksik.</response>
        /// <response code="500">Sunucu hatası.</response>
        [HttpPost("bulk-delete")]
        [ProducesResponseType(typeof(ApiResponseModel<int>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<int>>> BulkDeleteTasks(
            [FromBody] BulkDeleteTaskDto bulkDeleteDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var deletedCount = await _taskService.BulkDeleteTasksAsync(userId.Value, bulkDeleteDto.TaskIds);

                return Ok(ApiResponseModel<int>.SuccessResponse(
                    $"{deletedCount} görev başarıyla silindi.", deletedCount
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk deleting tasks for user {UserId}", GetCurrentUserId());
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Toplu görev silinirken bir hata oluştu."));
            }
        }

        /// <summary>
        /// Belirtilen görevleri toplu olarak tamamlar.
        /// </summary>
        /// <param name="bulkCompleteDto">Tamamlanacak görev ID'lerinin listesini içeren DTO.</param>
        /// <returns>Tamamlanan görev sayısı.</returns>
        /// <response code="200">Görevler başarıyla tamamlandı.</response>
        /// <response code="400">Geçersiz veri veya business rule ihlali.</response>
        /// <response code="401">Token geçersiz veya eksik.</response>
        /// <response code="500">Sunucu hatası.</response>
        [HttpPost("bulk-complete")]
        [ProducesResponseType(typeof(ApiResponseModel<int>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<int>>> BulkCompleteTasks(
            [FromBody] BulkCompleteTaskDto bulkCompleteDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var completedCount = await _taskService.BulkCompleteTasksAsync(userId.Value, bulkCompleteDto.TaskIds);

                return Ok(ApiResponseModel<int>.SuccessResponse(
                    $"{completedCount} görev başarıyla tamamlandı.", completedCount
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk completing tasks for user {UserId}", GetCurrentUserId());
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Toplu görev tamamlanırken bir hata oluştu."));
            }
        }

        /// <summary>
        /// Görevi ID'ye göre siler
        /// </summary>
        /// <param name="id">Task ID'si</param>
        /// <returns>Başarılı sonuç</returns>
        /// <response code="200">Task başarıyla silindi</response>
        /// <response code="401">Token geçersiz veya eksik</response>
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
                // JWT token'dan user ID'yi al
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // TaskService ile task'ı sil
                var deleted = await _taskService.DeleteTaskAsync(userId.Value, id);

                if (!deleted)
                {
                    return NotFound(ApiResponseModel<object>.ErrorResponse("Görev bulunamadı"));
                }

                _logger.LogInformation("Task deleted successfully: {TaskId}", id);

                return Ok(ApiResponseModel<object>.SuccessResponse(
                    "Görev başarıyla silindi"
                ));
            }
            catch (InvalidOperationException ex)
            {
                // Business rule violations
                _logger.LogWarning("Task deletion failed: {Error}", ex.Message);
                return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting task {TaskId}", id);
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Görev silinirken bir hata oluştu"));
            }
        }

        #endregion

        #region Task Completion Endpoints

        /// <summary>
        /// Task'ın tamamlanma durumunu günceller
        /// </summary>
        /// <param name="id">Task ID'si</param>
        /// <param name="completeDto">Tamamlanma bilgileri</param>
        /// <returns>Güncellenmiş task</returns>
        /// <response code="200">Task durumu başarıyla güncellendi</response>
        /// <response code="400">Geçersiz veri</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="404">Task bulunamadı</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpPatch("{id:int}/complete")]
        [ProducesResponseType(typeof(ApiResponseModel<TodoTaskDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<TodoTaskDto>>> CompleteTask(
            int id,
            [FromBody] CompleteTaskDto completeDto)
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

                // TaskService ile task completion güncelle
                var updatedTask = await _taskService.CompleteTaskAsync(userId.Value, id, completeDto);

                var message = completeDto.IsCompleted ? "Görev tamamlandı" : "Görev tamamlanmamış olarak işaretlendi";
                _logger.LogInformation("Task completion updated: {TaskId} - {IsCompleted}", id, completeDto.IsCompleted);

                return Ok(ApiResponseModel<TodoTaskDto>.SuccessResponse(message, updatedTask));
            }
            catch (InvalidOperationException ex)
            {
                // Business rule violations or not found
                _logger.LogWarning("Task completion update failed: {Error}", ex.Message);
                
                if (ex.Message.Contains("bulunamadı"))
                {
                    return NotFound(ApiResponseModel<object>.ErrorResponse(ex.Message));
                }
                
                return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating task completion {TaskId}", id);
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Görev durumu güncellenirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Task'ın progress yüzdesini günceller
        /// </summary>
        /// <param name="id">Task ID'si</param>
        /// <param name="progressDto">Progress bilgileri</param>
        /// <returns>Güncellenmiş task</returns>
        /// <response code="200">Progress başarıyla güncellendi</response>
        /// <response code="400">Geçersiz veri</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="404">Task bulunamadı</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpPatch("{id:int}/progress")]
        [ProducesResponseType(typeof(ApiResponseModel<TodoTaskDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<TodoTaskDto>>> UpdateTaskProgress(
            int id,
            [FromBody] UpdateTaskProgressDto progressDto)
        {
            try
            {
                // Model validation artık GlobalValidationActionFilter tarafından handle ediliyor

                // JWT token'dan user ID'yi al
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // TaskService ile progress güncelle
                var updatedTask = await _taskService.UpdateTaskProgressAsync(userId.Value, id, progressDto.CompletionPercentage);

                _logger.LogInformation("Task progress updated: {TaskId} - {Progress}%", id, progressDto.CompletionPercentage);

                return Ok(ApiResponseModel<TodoTaskDto>.SuccessResponse(
                    $"Görev ilerlemesi %{progressDto.CompletionPercentage} olarak güncellendi",
                    updatedTask
                ));
            }
            catch (InvalidOperationException ex)
            {
                // Business rule violations or not found
                _logger.LogWarning("Task progress update failed: {Error}", ex.Message);
                
                if (ex.Message.Contains("bulunamadı"))
                {
                    return NotFound(ApiResponseModel<object>.ErrorResponse(ex.Message));
                }
                
                return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            catch (ArgumentException ex)
            {
                // Invalid percentage range
                _logger.LogWarning("Invalid progress percentage: {Error}", ex.Message);
                return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating task progress {TaskId}", id);
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Görev ilerlemesi güncellenirken bir hata oluştu"));
            }
        }

        #endregion

        #region Search & Filter Endpoints

        /// <summary>
        /// Task'larda arama yapar
        /// </summary>
        /// <param name="searchText">Arama metni</param>
        /// <param name="maxResults">Maksimum sonuç sayısı</param>
        /// <returns>Arama sonuçları</returns>
        /// <response code="200">Arama başarıyla tamamlandı</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpGet("search")]
        [ProducesResponseType(typeof(ApiResponseModel<List<TodoTaskDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<List<TodoTaskDto>>>> SearchTasks(
            [FromQuery] string searchText,
            [FromQuery] int maxResults = 50)
        {
            try
            {
                // JWT token'dan user ID'yi al
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // TaskService ile arama yap
                var tasks = await _taskService.SearchTasksAsync(userId.Value, searchText, maxResults);

                return Ok(ApiResponseModel<List<TodoTaskDto>>.SuccessResponse(
                    $"{tasks.Count} görev bulundu",
                    tasks
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching tasks");
                return StatusCode(500, ApiResponseModel<List<TodoTaskDto>>.ErrorResponse(
                    "Arama sırasında bir hata oluştu"));
            }
        }

        /// <summary>
        /// Süresi geçmiş task'ları getirir
        /// </summary>
        /// <returns>Süresi geçmiş task'lar</returns>
        /// <response code="200">Süresi geçmiş task'lar başarıyla getirildi</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpGet("overdue")]
        [ProducesResponseType(typeof(ApiResponseModel<List<TodoTaskDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<List<TodoTaskDto>>>> GetOverdueTasks()
        {
            try
            {
                // JWT token'dan user ID'yi al
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // TaskService ile overdue task'ları getir
                var tasks = await _taskService.GetOverdueTasksAsync(userId.Value);

                return Ok(ApiResponseModel<List<TodoTaskDto>>.SuccessResponse(
                    $"{tasks.Count} süresi geçmiş görev bulundu",
                    tasks
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting overdue tasks");
                return StatusCode(500, ApiResponseModel<List<TodoTaskDto>>.ErrorResponse(
                    "Süresi geçmiş görevler getirilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Bugün yapılacak task'ları getirir
        /// </summary>
        /// <returns>Bugünkü task'lar</returns>
        /// <response code="200">Bugünkü task'lar başarıyla getirildi</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpGet("today")]
        [ProducesResponseType(typeof(ApiResponseModel<List<TodoTaskDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<List<TodoTaskDto>>>> GetTasksDueToday()
        {
            try
            {
                // JWT token'dan user ID'yi al
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // TaskService ile bugünkü task'ları getir
                var tasks = await _taskService.GetTasksDueTodayAsync(userId.Value);

                return Ok(ApiResponseModel<List<TodoTaskDto>>.SuccessResponse(
                    $"{tasks.Count} bugünkü görev bulundu",
                    tasks
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tasks due today");
                return StatusCode(500, ApiResponseModel<List<TodoTaskDto>>.ErrorResponse(
                    "Bugünkü görevler getirilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Bu hafta yapılacak task'ları getirir
        /// </summary>
        /// <returns>Bu haftaki task'lar</returns>
        /// <response code="200">Bu haftaki task'lar başarıyla getirildi</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpGet("this-week")]
        [ProducesResponseType(typeof(ApiResponseModel<List<TodoTaskDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<List<TodoTaskDto>>>> GetTasksDueThisWeek()
        {
            try
            {
                // JWT token'dan user ID'yi al
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // TaskService ile bu haftaki task'ları getir
                var tasks = await _taskService.GetTasksDueThisWeekAsync(userId.Value);

                return Ok(ApiResponseModel<List<TodoTaskDto>>.SuccessResponse(
                    $"{tasks.Count} bu haftaki görev bulundu",
                    tasks
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tasks due this week");
                return StatusCode(500, ApiResponseModel<List<TodoTaskDto>>.ErrorResponse(
                    "Bu haftaki görevler getirilirken bir hata oluştu"));
            }
        }

        #endregion

        #region Sub-Tasks Endpoints

        /// <summary>
        /// Belirli bir task'ın alt task'larını getirir
        /// </summary>
        /// <param name="parentId">Parent task ID'si</param>
        /// <returns>Alt task'lar</returns>
        /// <response code="200">Alt task'lar başarıyla getirildi</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpGet("{parentId:int}/subtasks")]
        [ProducesResponseType(typeof(ApiResponseModel<List<TodoTaskDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<List<TodoTaskDto>>>> GetSubTasks(int parentId)
        {
            try
            {
                // JWT token'dan user ID'yi al
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // TaskService ile alt task'ları getir
                var subTasks = await _taskService.GetSubTasksAsync(userId.Value, parentId);

                return Ok(ApiResponseModel<List<TodoTaskDto>>.SuccessResponse(
                    $"{subTasks.Count} alt görev bulundu",
                    subTasks
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sub-tasks for parent {ParentId}", parentId);
                return StatusCode(500, ApiResponseModel<List<TodoTaskDto>>.ErrorResponse(
                    "Alt görevler getirilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Belirli bir task için alt task oluşturur
        /// </summary>
        /// <param name="parentId">Parent task ID'si</param>
        /// <param name="createDto">Alt task oluşturma bilgileri</param>
        /// <returns>Oluşturulan alt task</returns>
        /// <response code="201">Alt task başarıyla oluşturuldu</response>
        /// <response code="400">Geçersiz veri</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpPost("{parentId:int}/subtasks")]
        [ProducesResponseType(typeof(ApiResponseModel<TodoTaskDto>), 201)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<TodoTaskDto>>> CreateSubTask(
            int parentId,
            [FromBody] CreateTodoTaskDto createDto)
        {
            try
            {
                // JWT token'dan user ID'yi al
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // Parent task'ı kontrol et
                var parentTask = await _taskService.GetTaskByIdAsync(userId.Value, parentId);
                if (parentTask == null)
                {
                    return NotFound(ApiResponseModel<object>.ErrorResponse("Parent görev bulunamadı"));
                }

                // Alt task oluştur
                createDto.ParentTaskId = parentId;
                var subTask = await _taskService.CreateTaskAsync(userId.Value, createDto);

                _logger.LogInformation("Sub-task created successfully: {SubTaskId} for parent {ParentId}", 
                    subTask.Id, parentId);

                return CreatedAtAction(
                    actionName: nameof(GetTask),
                    routeValues: new { id = subTask.Id },
                    value: ApiResponseModel<TodoTaskDto>.SuccessResponse(
                        "Alt görev başarıyla oluşturuldu",
                        subTask
                    )
                );
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Sub-task creation failed: {Error}", ex.Message);
                return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating sub-task for parent {ParentId}", parentId);
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Alt görev oluşturulurken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Alt görevleri sıralar
        /// </summary>
        /// <param name="parentId">Parent task ID'si</param>
        /// <param name="subTaskIds">Sıralanacak alt görev ID'leri</param>
        /// <returns>Güncellenmiş alt görevler</returns>
        /// <response code="200">Alt görevler başarıyla sıralandı</response>
        /// <response code="400">Geçersiz veri</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpPut("{parentId:int}/subtasks/reorder")]
        [ProducesResponseType(typeof(ApiResponseModel<List<TodoTaskDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<List<TodoTaskDto>>>> ReorderSubTasks(
            int parentId,
            [FromBody] List<int> subTaskIds)
        {
            try
            {
                // JWT token'dan user ID'yi al
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // Alt görevleri sırala
                var reorderedSubTasks = await _taskService.ReorderSubTasksAsync(userId.Value, parentId, subTaskIds);

                return Ok(ApiResponseModel<List<TodoTaskDto>>.SuccessResponse(
                    "Alt görevler başarıyla sıralandı",
                    reorderedSubTasks
                ));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Sub-task reordering failed: {Error}", ex.Message);
                return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reordering sub-tasks for parent {ParentId}", parentId);
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Alt görevler sıralanırken bir hata oluştu"));
            }
        }

        #endregion

        #region Statistics Endpoints

        /// <summary>
        /// Kullanıcının task istatistiklerini getirir
        /// </summary>
        /// <returns>Task istatistikleri</returns>
        /// <response code="200">İstatistikler başarıyla getirildi</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpGet("statistics")]
        [ProducesResponseType(typeof(ApiResponseModel<TaskStatsDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<TaskStatsDto>>> GetTaskStatistics()
        {
            try
            {
                // JWT token'dan user ID'yi al
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // TaskService ile istatistikleri getir
                var stats = await _taskService.GetTaskStatsAsync(userId.Value);

                return Ok(ApiResponseModel<TaskStatsDto>.SuccessResponse(
                    "Görev istatistikleri getirildi",
                    stats
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting task statistics");
                return StatusCode(500, ApiResponseModel<TaskStatsDto>.ErrorResponse(
                    "İstatistikler getirilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Priority bazında task istatistiklerini getirir
        /// </summary>
        /// <returns>Priority istatistikleri</returns>
        /// <response code="200">Priority istatistikleri başarıyla getirildi</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpGet("statistics/priority")]
        [ProducesResponseType(typeof(ApiResponseModel<List<TaskPriorityStatsDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<List<TaskPriorityStatsDto>>>> GetTaskPriorityStatistics()
        {
            try
            {
                // JWT token'dan user ID'yi al
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                // TaskService ile priority istatistiklerini getir
                var stats = await _taskService.GetTaskPriorityStatsAsync(userId.Value);

                return Ok(ApiResponseModel<List<TaskPriorityStatsDto>>.SuccessResponse(
                    "Priority istatistikleri getirildi",
                    stats
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting task priority statistics");
                return StatusCode(500, ApiResponseModel<List<TaskPriorityStatsDto>>.ErrorResponse(
                    "Priority istatistikleri getirilirken bir hata oluştu"));
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
} 