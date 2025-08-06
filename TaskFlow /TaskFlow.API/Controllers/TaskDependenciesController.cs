// ****************************************************************************************************
//  TASKDEPENDENCIESCONTROLLER.CS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının görev bağımlılıkları yönetimi için API endpoint'lerini içerir.
//  Bağımlılık oluşturma, güncelleme, silme ve sorgulama işlemlerini sağlar.
//
//  ANA BAŞLIKLAR:
//  - CRUD Endpoints (Create, Read, Update, Delete)
//  - Dependency Analysis Endpoints
//  - Bulk Operations
//  - Validation ve Error Handling
//  - Real-time Notifications
//
//  GÜVENLİK:
//  - JWT token authentication
//  - User-based access control
//  - Input validation
//  - Business rule enforcement
//  - Data integrity protection
//
//  HATA YÖNETİMİ:
//  - Comprehensive error responses
//  - Detailed error messages
//  - HTTP status code mapping
//  - Exception handling
//  - Logging for debugging
//
//  EDGE-CASE'LER:
//  - Invalid task references
//  - Circular dependencies
//  - Self-dependencies
//  - Concurrent modifications
//  - Large dependency chains
//
//  YAN ETKİLER:
//  - Dependency creation affects task scheduling
//  - Task completion affects dependent tasks
//  - Real-time notifications via SignalR
//  - Cache invalidation
//
//  PERFORMANS:
//  - Efficient pagination
//  - Optimized queries
//  - Response caching
//  - Batch operations
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Clear endpoint design
//  - Comprehensive documentation
//  - Extensible API structure
//  - Backward compatibility
//  - Version management
// ****************************************************************************************************

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;
using Swashbuckle.AspNetCore.Annotations;
using Asp.Versioning;

namespace TaskFlow.API.Controllers
{
    /// <summary>
    /// Görev bağımlılıkları yönetimi için API controller
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Authorize]
    [Produces("application/json")]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
    public class TaskDependenciesController : ControllerBase
    {
        private readonly ITaskDependencyService _dependencyService;
        private readonly ILogger<TaskDependenciesController> _logger;

        public TaskDependenciesController(
            ITaskDependencyService dependencyService,
            ILogger<TaskDependenciesController> logger)
        {
            _dependencyService = dependencyService;
            _logger = logger;
        }

        #region CRUD Endpoints

        /// <summary>
        /// Kullanıcının bağımlılıklarını filtreli olarak getirir
        /// </summary>
        /// <param name="filter">Filtreleme kriterleri</param>
        /// <returns>Bağımlılık listesi</returns>
        /// <response code="200">Bağımlılıklar başarıyla getirildi</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<object>>> GetDependencies(
            [FromQuery] TaskDependencyFilterDto filter)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var (dependencies, pagination) = await _dependencyService.GetDependenciesAsync(userId.Value, filter);

                var response = new
                {
                    Dependencies = dependencies,
                    Pagination = pagination
                };

                return Ok(ApiResponseModel<object>.SuccessResponse(
                    $"{dependencies.Count} bağımlılık bulundu",
                    response
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dependencies");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Bağımlılıklar getirilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Belirli bir bağımlılığı getirir
        /// </summary>
        /// <param name="id">Bağımlılık ID'si</param>
        /// <returns>Bağımlılık detayları</returns>
        /// <response code="200">Bağımlılık başarıyla getirildi</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="404">Bağımlılık bulunamadı</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<TaskDependencyDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<TaskDependencyDto>>> GetDependency(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var dependency = await _dependencyService.GetDependencyByIdAsync(userId.Value, id);

                if (dependency == null)
                {
                    return NotFound(ApiResponseModel<TaskDependencyDto>.ErrorResponse("Bağımlılık bulunamadı"));
                }

                return Ok(ApiResponseModel<TaskDependencyDto>.SuccessResponse(
                    "Bağımlılık başarıyla getirildi",
                    dependency
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dependency {DependencyId}", id);
                return StatusCode(500, ApiResponseModel<TaskDependencyDto>.ErrorResponse(
                    "Bağımlılık getirilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Yeni bir bağımlılık oluşturur
        /// </summary>
        /// <param name="createDto">Bağımlılık oluşturma bilgileri</param>
        /// <returns>Oluşturulan bağımlılık</returns>
        /// <response code="201">Bağımlılık başarıyla oluşturuldu</response>
        /// <response code="400">Geçersiz veri</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponseModel<TaskDependencyDto>), 201)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<TaskDependencyDto>>> CreateDependency(
            [FromBody] CreateTaskDependencyDto createDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var dependency = await _dependencyService.CreateDependencyAsync(userId.Value, createDto);

                return CreatedAtAction(
                    actionName: nameof(GetDependency),
                    routeValues: new { id = dependency.Id },
                    value: ApiResponseModel<TaskDependencyDto>.SuccessResponse(
                        "Bağımlılık başarıyla oluşturuldu",
                        dependency
                    )
                );
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Dependency creation failed: {Error}", ex.Message);
                return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating dependency");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Bağımlılık oluşturulurken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Bağımlılığı günceller
        /// </summary>
        /// <param name="id">Bağımlılık ID'si</param>
        /// <param name="updateDto">Güncelleme bilgileri</param>
        /// <returns>Güncellenmiş bağımlılık</returns>
        /// <response code="200">Bağımlılık başarıyla güncellendi</response>
        /// <response code="400">Geçersiz veri</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="404">Bağımlılık bulunamadı</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<TaskDependencyDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<TaskDependencyDto>>> UpdateDependency(
            int id,
            [FromBody] UpdateTaskDependencyDto updateDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var dependency = await _dependencyService.UpdateDependencyAsync(userId.Value, id, updateDto);

                return Ok(ApiResponseModel<TaskDependencyDto>.SuccessResponse(
                    "Bağımlılık başarıyla güncellendi",
                    dependency
                ));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Dependency update failed: {Error}", ex.Message);
                return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating dependency {DependencyId}", id);
                return StatusCode(500, ApiResponseModel<TaskDependencyDto>.ErrorResponse(
                    "Bağımlılık güncellenirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Bağımlılığı siler
        /// </summary>
        /// <param name="id">Bağımlılık ID'si</param>
        /// <returns>Silme işlemi sonucu</returns>
        /// <response code="200">Bağımlılık başarıyla silindi</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="404">Bağımlılık bulunamadı</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<object>>> DeleteDependency(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var success = await _dependencyService.DeleteDependencyAsync(userId.Value, id);

                if (!success)
                {
                    return NotFound(ApiResponseModel<object>.ErrorResponse("Bağımlılık bulunamadı"));
                }

                return Ok(ApiResponseModel<object>.SuccessResponse(
                    "Bağımlılık başarıyla silindi",
                    null
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting dependency {DependencyId}", id);
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Bağımlılık silinirken bir hata oluştu"));
            }
        }

        #endregion

        #region Analysis Endpoints

        /// <summary>
        /// Belirli bir görevin bağımlılıklarını getirir
        /// </summary>
        /// <param name="taskId">Görev ID'si</param>
        /// <returns>Görevin bağımlılık listesi</returns>
        /// <response code="200">Bağımlılıklar başarıyla getirildi</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpGet("task/{taskId:int}/dependencies")]
        [ProducesResponseType(typeof(ApiResponseModel<List<TaskDependencyDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<List<TaskDependencyDto>>>> GetTaskDependencies(int taskId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var dependencies = await _dependencyService.GetTaskDependenciesAsync(userId.Value, taskId);

                return Ok(ApiResponseModel<List<TaskDependencyDto>>.SuccessResponse(
                    $"{dependencies.Count} bağımlılık bulundu",
                    dependencies
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dependencies for task {TaskId}", taskId);
                return StatusCode(500, ApiResponseModel<List<TaskDependencyDto>>.ErrorResponse(
                    "Görev bağımlılıkları getirilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Belirli bir görevin ön koşullarını getirir
        /// </summary>
        /// <param name="taskId">Görev ID'si</param>
        /// <returns>Görevin ön koşul listesi</returns>
        /// <response code="200">Ön koşullar başarıyla getirildi</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpGet("task/{taskId:int}/prerequisites")]
        [ProducesResponseType(typeof(ApiResponseModel<List<TaskDependencyDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<List<TaskDependencyDto>>>> GetTaskPrerequisites(int taskId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var prerequisites = await _dependencyService.GetTaskPrerequisitesAsync(userId.Value, taskId);

                return Ok(ApiResponseModel<List<TaskDependencyDto>>.SuccessResponse(
                    $"{prerequisites.Count} ön koşul bulundu",
                    prerequisites
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting prerequisites for task {TaskId}", taskId);
                return StatusCode(500, ApiResponseModel<List<TaskDependencyDto>>.ErrorResponse(
                    "Görev ön koşulları getirilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Görevin bağımlılık nedeniyle bloke olup olmadığını kontrol eder
        /// </summary>
        /// <param name="taskId">Görev ID'si</param>
        /// <returns>Görev bloke mi</returns>
        /// <response code="200">Kontrol başarıyla tamamlandı</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpGet("task/{taskId:int}/is-blocked")]
        [ProducesResponseType(typeof(ApiResponseModel<bool>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<bool>>> IsTaskBlocked(int taskId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var isBlocked = await _dependencyService.IsTaskBlockedByDependenciesAsync(userId.Value, taskId);

                return Ok(ApiResponseModel<bool>.SuccessResponse(
                    "Görev bloke durumu kontrol edildi",
                    isBlocked
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if task {TaskId} is blocked", taskId);
                return StatusCode(500, ApiResponseModel<bool>.ErrorResponse(
                    "Görev bloke durumu kontrol edilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Görevin başlayabilir olup olmadığını kontrol eder
        /// </summary>
        /// <param name="taskId">Görev ID'si</param>
        /// <returns>Görev başlayabilir mi</returns>
        /// <response code="200">Kontrol başarıyla tamamlandı</response>
        /// <response code="401">Token geçersiz veya eksik</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpGet("task/{taskId:int}/can-start")]
        [ProducesResponseType(typeof(ApiResponseModel<bool>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<bool>>> CanTaskStart(int taskId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var canStart = await _dependencyService.CanTaskStartAsync(userId.Value, taskId);

                return Ok(ApiResponseModel<bool>.SuccessResponse(
                    "Görev başlama durumu kontrol edildi",
                    canStart
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if task {TaskId} can start", taskId);
                return StatusCode(500, ApiResponseModel<bool>.ErrorResponse(
                    "Görev başlama durumu kontrol edilirken bir hata oluştu"));
            }
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// JWT token'dan kullanıcı ID'sini alır
        /// </summary>
        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("UserId");
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                return userId;
            }
            return null;
        }

        #endregion
    }
} 