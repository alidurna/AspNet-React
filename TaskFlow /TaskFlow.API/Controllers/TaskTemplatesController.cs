using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;
using Swashbuckle.AspNetCore.Annotations;
using Asp.Versioning;

namespace TaskFlow.API.Controllers
{
    /// <summary>
    /// Görev şablonları yönetimi için API controller
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Authorize]
    [Produces("application/json")]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
    [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
    public class TaskTemplatesController : ControllerBase
    {
        private readonly ITaskTemplateService _templateService;
        private readonly ILogger<TaskTemplatesController> _logger;

        public TaskTemplatesController(
            ITaskTemplateService templateService,
            ILogger<TaskTemplatesController> logger)
        {
            _templateService = templateService;
            _logger = logger;
        }

        #region CRUD Endpoints

        /// <summary>
        /// Kullanıcının şablonlarını filtreli olarak getirir
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<object>>> GetTemplates(
            [FromQuery] TaskTemplateFilterDto filter)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var (templates, pagination) = await _templateService.GetTemplatesAsync(userId.Value, filter);

                var response = new
                {
                    Templates = templates,
                    Pagination = pagination
                };

                return Ok(ApiResponseModel<object>.SuccessResponse(
                    $"{templates.Count} şablon bulundu",
                    response
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting templates");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Şablonlar getirilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Belirli bir şablonu getirir
        /// </summary>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<TaskTemplateDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<TaskTemplateDto>>> GetTemplate(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var template = await _templateService.GetTemplateByIdAsync(userId.Value, id);

                if (template == null)
                {
                    return NotFound(ApiResponseModel<TaskTemplateDto>.ErrorResponse("Şablon bulunamadı"));
                }

                return Ok(ApiResponseModel<TaskTemplateDto>.SuccessResponse(
                    "Şablon başarıyla getirildi",
                    template
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting template {TemplateId}", id);
                return StatusCode(500, ApiResponseModel<TaskTemplateDto>.ErrorResponse(
                    "Şablon getirilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Yeni bir şablon oluşturur
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponseModel<TaskTemplateDto>), 201)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<TaskTemplateDto>>> CreateTemplate(
            [FromBody] CreateTaskTemplateDto createDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var template = await _templateService.CreateTemplateAsync(userId.Value, createDto);

                return CreatedAtAction(
                    actionName: nameof(GetTemplate),
                    routeValues: new { id = template.Id },
                    value: ApiResponseModel<TaskTemplateDto>.SuccessResponse(
                        "Şablon başarıyla oluşturuldu",
                        template
                    )
                );
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Template creation failed: {Error}", ex.Message);
                return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating template");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Şablon oluşturulurken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Şablonu günceller
        /// </summary>
        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<TaskTemplateDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<TaskTemplateDto>>> UpdateTemplate(
            int id,
            [FromBody] UpdateTaskTemplateDto updateDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var template = await _templateService.UpdateTemplateAsync(userId.Value, id, updateDto);

                return Ok(ApiResponseModel<TaskTemplateDto>.SuccessResponse(
                    "Şablon başarıyla güncellendi",
                    template
                ));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Template update failed: {Error}", ex.Message);
                return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating template {TemplateId}", id);
                return StatusCode(500, ApiResponseModel<TaskTemplateDto>.ErrorResponse(
                    "Şablon güncellenirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Şablonu siler
        /// </summary>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<object>>> DeleteTemplate(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var success = await _templateService.DeleteTemplateAsync(userId.Value, id);

                if (!success)
                {
                    return NotFound(ApiResponseModel<object>.ErrorResponse("Şablon bulunamadı"));
                }

                return Ok(ApiResponseModel<object>.SuccessResponse(
                    "Şablon başarıyla silindi",
                    null
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting template {TemplateId}", id);
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Şablon silinirken bir hata oluştu"));
            }
        }

        #endregion

        #region Template Usage

        /// <summary>
        /// Şablondan görev oluşturur
        /// </summary>
        [HttpPost("create-task")]
        [ProducesResponseType(typeof(ApiResponseModel<TodoTaskDto>), 201)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<TodoTaskDto>>> CreateTaskFromTemplate(
            [FromBody] CreateTaskFromTemplateDto createDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var task = await _templateService.CreateTaskFromTemplateAsync(userId.Value, createDto);

                return CreatedAtAction(
                    actionName: nameof(GetTemplate),
                    routeValues: new { id = createDto.TemplateId },
                    value: ApiResponseModel<TodoTaskDto>.SuccessResponse(
                        "Şablondan görev başarıyla oluşturuldu",
                        task
                    )
                );
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Task creation from template failed: {Error}", ex.Message);
                return BadRequest(ApiResponseModel<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating task from template");
                return StatusCode(500, ApiResponseModel<object>.ErrorResponse(
                    "Şablondan görev oluşturulurken bir hata oluştu"));
            }
        }

        #endregion

        #region Analysis Endpoints

        /// <summary>
        /// En çok kullanılan şablonları getirir
        /// </summary>
        [HttpGet("most-used")]
        [ProducesResponseType(typeof(ApiResponseModel<List<TaskTemplateDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<List<TaskTemplateDto>>>> GetMostUsedTemplates(
            [FromQuery] int count = 5)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var templates = await _templateService.GetMostUsedTemplatesAsync(userId.Value, count);

                return Ok(ApiResponseModel<List<TaskTemplateDto>>.SuccessResponse(
                    $"{templates.Count} popüler şablon bulundu",
                    templates
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting most used templates");
                return StatusCode(500, ApiResponseModel<List<TaskTemplateDto>>.ErrorResponse(
                    "Popüler şablonlar getirilirken bir hata oluştu"));
            }
        }

        /// <summary>
        /// Kategoriye göre şablonları getirir
        /// </summary>
        [HttpGet("category/{categoryId:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<List<TaskTemplateDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 500)]
        public async Task<ActionResult<ApiResponseModel<List<TaskTemplateDto>>>> GetTemplatesByCategory(int categoryId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(ApiResponseModel<object>.ErrorResponse("Geçersiz token"));
                }

                var templates = await _templateService.GetTemplatesByCategoryAsync(userId.Value, categoryId);

                return Ok(ApiResponseModel<List<TaskTemplateDto>>.SuccessResponse(
                    $"{templates.Count} şablon bulundu",
                    templates
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting templates by category {CategoryId}", categoryId);
                return StatusCode(500, ApiResponseModel<List<TaskTemplateDto>>.ErrorResponse(
                    "Kategori şablonları getirilirken bir hata oluştu"));
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