// ****************************************************************************************************
//  POMODOROCONTROLLER.CS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının Pomodoro zaman yönetimi sistemi için API controller'ıdır.
//  Pomodoro session'larının oluşturulması, yönetilmesi ve timer kontrolü için HTTP endpoint'leri sağlar.
//
//  ANA BAŞLIKLAR:
//  - Session Management (CRUD operations)
//  - Timer Control (Start, pause, resume, stop)
//  - Statistics (User progress tracking)
//  - Quick Actions (Fast session creation)
//  - Real-time Updates (Timer state)
//
//  ENDPOINT'LER:
//  - GET /api/v1/Pomodoro/sessions - Session listesi
//  - GET /api/v1/Pomodoro/sessions/{id} - Session detayı
//  - POST /api/v1/Pomodoro/sessions - Yeni session oluşturma
//  - PUT /api/v1/Pomodoro/sessions/{id} - Session güncelleme
//  - DELETE /api/v1/Pomodoro/sessions/{id} - Session silme
//  - POST /api/v1/Pomodoro/sessions/{id}/start - Session başlatma
//  - POST /api/v1/Pomodoro/sessions/{id}/pause - Session duraklatma
//  - POST /api/v1/Pomodoro/sessions/{id}/resume - Session devam ettirme
//  - POST /api/v1/Pomodoro/sessions/{id}/complete - Session tamamlama
//  - POST /api/v1/Pomodoro/sessions/{id}/cancel - Session iptal etme
//  - GET /api/v1/Pomodoro/timer - Timer durumu
//  - POST /api/v1/Pomodoro/timer/start - Timer başlatma
//  - POST /api/v1/Pomodoro/timer/pause - Timer duraklatma
//  - POST /api/v1/Pomodoro/timer/resume - Timer devam ettirme
//  - POST /api/v1/Pomodoro/timer/stop - Timer durdurma
//  - GET /api/v1/Pomodoro/statistics - İstatistikler
//  - POST /api/v1/Pomodoro/quick/work - Hızlı çalışma session'ı
//  - POST /api/v1/Pomodoro/quick/short-break - Hızlı kısa mola
//  - POST /api/v1/Pomodoro/quick/long-break - Hızlı uzun mola
//
//  GÜVENLİK:
//  - JWT tabanlı authentication (tüm endpoint'ler korumalı)
//  - User isolation (kullanıcı sadece kendi session'larını yönetir)
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
//  - Multiple active sessions
//  - Session interruption
//  - Time synchronization
//  - Browser refresh during session
//  - Concurrent session modifications
//
//  YAN ETKİLER:
//  - Session creation affects user statistics
//  - Session completion affects task progress
//  - Session data affects productivity metrics
//  - Timer state affects real-time updates
//
//  PERFORMANS:
//  - Efficient session queries
//  - Real-time timer updates
//  - Session caching
//  - Statistics calculation optimization
//  - Memory efficient tracking
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Clear controller design
//  - Comprehensive documentation
//  - Extensible endpoint structure
//  - Backward compatibility
// ****************************************************************************************************

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;
using TaskFlow.API.Models;
using Asp.Versioning;

namespace TaskFlow.API.Controllers
{
    /// <summary>
    /// Pomodoro zaman yönetimi controller'ı
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Authorize]
    public class PomodoroController : ControllerBase
    {
        private readonly IPomodoroService _pomodoroService;
        private readonly ILogger<PomodoroController> _logger;

        /// <summary>
        /// PomodoroController constructor
        /// </summary>
        public PomodoroController(
            IPomodoroService pomodoroService,
            ILogger<PomodoroController> logger)
        {
            _pomodoroService = pomodoroService ?? throw new ArgumentNullException(nameof(pomodoroService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        #region Session Management

        /// <summary>
        /// Kullanıcının Pomodoro session'larını listeler
        /// </summary>
        /// <param name="page">Sayfa numarası</param>
        /// <param name="pageSize">Sayfa boyutu</param>
        /// <param name="sessionType">Session tipi filtresi</param>
        /// <param name="state">Session durumu filtresi</param>
        /// <param name="startDate">Başlangıç tarihi</param>
        /// <param name="endDate">Bitiş tarihi</param>
        /// <param name="taskId">Görev ID filtresi</param>
        /// <param name="categoryId">Kategori ID filtresi</param>
        /// <param name="sortBy">Sıralama alanı</param>
        /// <param name="sortAscending">Artan sıralama</param>
        /// <returns>Session listesi</returns>
        [HttpGet("sessions")]
        [ProducesResponseType(typeof(PomodoroSessionListDto), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<PomodoroSessionListDto>> GetSessions(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] PomodoroSessionType? sessionType = null,
            [FromQuery] PomodoroSessionState? state = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int? taskId = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] string sortBy = "createdAt",
            [FromQuery] bool sortAscending = false)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                var filter = new PomodoroFilterDto
                {
                    Page = page,
                    PageSize = pageSize,
                    SessionType = sessionType,
                    State = state,
                    StartDate = startDate,
                    EndDate = endDate,
                    TaskId = taskId,
                    CategoryId = categoryId,
                    SortBy = sortBy,
                    SortAscending = sortAscending
                };

                var sessions = await _pomodoroService.GetSessionsAsync(userId.Value, filter);

                _logger.LogInformation("Pomodoro sessions retrieved for user {UserId}: {Count} sessions", userId, sessions.TotalCount);

                return Ok(sessions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Pomodoro sessions for user");
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Session'lar alınırken hata oluştu"
                });
            }
        }

        /// <summary>
        /// Kullanıcının aktif Pomodoro session'ını getirir
        /// </summary>
        /// <returns>Aktif session varsa session detayı, yoksa null</returns>
        [HttpGet("sessions/active")]
        [ProducesResponseType(typeof(PomodoroSessionDto), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<PomodoroSessionDto?>> GetActiveSession()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                var activeSession = await _pomodoroService.GetActiveSessionAsync(userId.Value);
                if (activeSession == null)
                {
                    return Ok(new ApiResponseModel<PomodoroSessionDto?>
                    {
                        Success = true,
                        Data = null,
                        Message = "Aktif session bulunamadı"
                    });
                }

                return Ok(new ApiResponseModel<PomodoroSessionDto>
                {
                    Success = true,
                    Data = activeSession,
                    Message = "Aktif session başarıyla getirildi"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active Pomodoro session");
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Aktif session alınırken hata oluştu"
                });
            }
        }

        /// <summary>
        /// Kullanıcının aktif session'ını iptal eder (temizler)
        /// </summary>
        /// <returns>İşlem sonucu</returns>
        [HttpDelete("sessions/active")]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult> ClearActiveSession()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                var activeSession = await _pomodoroService.GetActiveSessionAsync(userId.Value);
                if (activeSession == null)
                {
                    return Ok(new ApiResponseModel<object>
                    {
                        Success = true,
                        Message = "Temizlenecek aktif session bulunamadı"
                    });
                }

                // Aktif session'ı iptal et
                var updateDto = new UpdatePomodoroSessionDto
                {
                    State = PomodoroSessionState.Cancelled,
                    Notes = "Kullanıcı tarafından manuel olarak iptal edildi"
                };

                await _pomodoroService.UpdateSessionAsync(userId.Value, activeSession.Id, updateDto);

                _logger.LogInformation("Active Pomodoro session cleared for user {UserId}, session {SessionId}", userId, activeSession.Id);

                return Ok(new ApiResponseModel<object>
                {
                    Success = true,
                    Message = "Aktif session başarıyla temizlendi"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing active Pomodoro session");
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Aktif session temizlenirken hata oluştu"
                });
            }
        }

        /// <summary>
        /// Belirli bir Pomodoro session'ını getirir
        /// </summary>
        /// <param name="id">Session ID'si</param>
        /// <returns>Session detayı</returns>
        [HttpGet("sessions/{id}")]
        [ProducesResponseType(typeof(PomodoroSessionDto), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<PomodoroSessionDto>> GetSession(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                var session = await _pomodoroService.GetSessionAsync(userId.Value, id);
                if (session == null)
                {
                    return NotFound(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Session bulunamadı"
                    });
                }

                return Ok(session);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Pomodoro session {SessionId}", id);
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Session alınırken hata oluştu"
                });
            }
        }

        /// <summary>
        /// Yeni Pomodoro session'ı oluşturur
        /// </summary>
        /// <param name="createDto">Session oluşturma DTO'su</param>
        /// <returns>Oluşturulan session</returns>
        [HttpPost("sessions")]
        [ProducesResponseType(typeof(PomodoroSessionDto), 201)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<PomodoroSessionDto>> CreateSession([FromBody] CreatePomodoroSessionDto createDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                var session = await _pomodoroService.CreateSessionAsync(userId.Value, createDto);

                _logger.LogInformation("Pomodoro session created: {SessionId} for user {UserId}", session.Id, userId);

                return CreatedAtAction(nameof(GetSession), new { id = session.Id }, session);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Pomodoro session");
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Session oluşturulurken hata oluştu"
                });
            }
        }

        /// <summary>
        /// Pomodoro session'ını günceller
        /// </summary>
        /// <param name="id">Session ID'si</param>
        /// <param name="updateDto">Güncelleme DTO'su</param>
        /// <returns>Güncellenmiş session</returns>
        [HttpPut("sessions/{id}")]
        [ProducesResponseType(typeof(PomodoroSessionDto), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<PomodoroSessionDto>> UpdateSession(int id, [FromBody] UpdatePomodoroSessionDto updateDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                var session = await _pomodoroService.UpdateSessionAsync(userId.Value, id, updateDto);

                _logger.LogInformation("Pomodoro session updated: {SessionId} for user {UserId}", id, userId);

                return Ok(session);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Pomodoro session {SessionId}", id);
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Session güncellenirken hata oluştu"
                });
            }
        }

        /// <summary>
        /// Pomodoro session'ını siler
        /// </summary>
        /// <param name="id">Session ID'si</param>
        /// <returns>Silme işlemi sonucu</returns>
        [HttpDelete("sessions/{id}")]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<ApiResponseModel<object>>> DeleteSession(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                var result = await _pomodoroService.DeleteSessionAsync(userId.Value, id);
                if (!result)
                {
                    return NotFound(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Session bulunamadı"
                    });
                }

                _logger.LogInformation("Pomodoro session deleted: {SessionId} for user {UserId}", id, userId);

                return Ok(new ApiResponseModel<object>
                {
                    Success = true,
                    Message = "Session başarıyla silindi"
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting Pomodoro session {SessionId}", id);
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Session silinirken hata oluştu"
                });
            }
        }

        #endregion

        #region Session Control

        /// <summary>
        /// Session'ı başlatır
        /// </summary>
        /// <param name="id">Session ID'si</param>
        /// <returns>Başlatılan session</returns>
        [HttpPost("sessions/{id}/start")]
        [ProducesResponseType(typeof(PomodoroSessionDto), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<PomodoroSessionDto>> StartSession(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                var session = await _pomodoroService.StartSessionAsync(userId.Value, id);

                _logger.LogInformation("Pomodoro session started: {SessionId} for user {UserId}", id, userId);

                return Ok(session);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting Pomodoro session {SessionId}", id);
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Session başlatılırken hata oluştu"
                });
            }
        }

        /// <summary>
        /// Session'ı duraklatır
        /// </summary>
        /// <param name="id">Session ID'si</param>
        /// <returns>Duraklatılan session</returns>
        [HttpPost("sessions/{id}/pause")]
        [ProducesResponseType(typeof(PomodoroSessionDto), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<PomodoroSessionDto>> PauseSession(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                var session = await _pomodoroService.PauseSessionAsync(userId.Value, id);

                _logger.LogInformation("Pomodoro session paused: {SessionId} for user {UserId}", id, userId);

                return Ok(session);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error pausing Pomodoro session {SessionId}", id);
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Session duraklatılırken hata oluştu"
                });
            }
        }

        /// <summary>
        /// Session'ı devam ettirir
        /// </summary>
        /// <param name="id">Session ID'si</param>
        /// <returns>Devam eden session</returns>
        [HttpPost("sessions/{id}/resume")]
        [ProducesResponseType(typeof(PomodoroSessionDto), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<PomodoroSessionDto>> ResumeSession(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                var session = await _pomodoroService.ResumeSessionAsync(userId.Value, id);

                _logger.LogInformation("Pomodoro session resumed: {SessionId} for user {UserId}", id, userId);

                return Ok(session);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resuming Pomodoro session {SessionId}", id);
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Session devam ettirilirken hata oluştu"
                });
            }
        }

        /// <summary>
        /// Session'ı tamamlar
        /// </summary>
        /// <param name="id">Session ID'si</param>
        /// <returns>Tamamlanan session</returns>
        [HttpPost("sessions/{id}/complete")]
        [ProducesResponseType(typeof(PomodoroSessionDto), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<PomodoroSessionDto>> CompleteSession(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                var session = await _pomodoroService.CompleteSessionAsync(userId.Value, id);

                _logger.LogInformation("Pomodoro session completed: {SessionId} for user {UserId}", id, userId);

                return Ok(session);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing Pomodoro session {SessionId}", id);
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Session tamamlanırken hata oluştu"
                });
            }
        }

        /// <summary>
        /// Session'ı iptal eder
        /// </summary>
        /// <param name="id">Session ID'si</param>
        /// <returns>İptal edilen session</returns>
        [HttpPost("sessions/{id}/cancel")]
        [ProducesResponseType(typeof(PomodoroSessionDto), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<PomodoroSessionDto>> CancelSession(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                var session = await _pomodoroService.CancelSessionAsync(userId.Value, id);

                _logger.LogInformation("Pomodoro session cancelled: {SessionId} for user {UserId}", id, userId);

                return Ok(session);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling Pomodoro session {SessionId}", id);
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Session iptal edilirken hata oluştu"
                });
            }
        }

        #endregion

        #region Timer Control

        /// <summary>
        /// Timer durumunu getirir
        /// </summary>
        /// <returns>Timer durumu</returns>
        [HttpGet("timer")]
        [ProducesResponseType(typeof(PomodoroTimerDto), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<PomodoroTimerDto>> GetTimerState()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                var timerState = await _pomodoroService.GetTimerStateAsync(userId.Value);

                return Ok(timerState);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting timer state for user");
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Timer durumu alınırken hata oluştu"
                });
            }
        }

        /// <summary>
        /// Timer'ı başlatır
        /// </summary>
        /// <param name="sessionType">Session tipi</param>
        /// <param name="durationMinutes">Süre (dakika)</param>
        /// <returns>Başlatılan timer</returns>
        [HttpPost("timer/start")]
        [ProducesResponseType(typeof(PomodoroTimerDto), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<PomodoroTimerDto>> StartTimer(
            [FromQuery] PomodoroSessionType sessionType = PomodoroSessionType.Work,
            [FromQuery] int durationMinutes = 25)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                var timerState = await _pomodoroService.StartTimerAsync(userId.Value, sessionType, durationMinutes);

                _logger.LogInformation("Pomodoro timer started for user {UserId}: {SessionType} for {Duration} minutes", 
                    userId, sessionType, durationMinutes);

                return Ok(timerState);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting Pomodoro timer for user");
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Timer başlatılırken hata oluştu"
                });
            }
        }

        /// <summary>
        /// Timer'ı duraklatır
        /// </summary>
        /// <returns>Duraklatılan timer</returns>
        [HttpPost("timer/pause")]
        [ProducesResponseType(typeof(PomodoroTimerDto), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<PomodoroTimerDto>> PauseTimer()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                var timerState = await _pomodoroService.PauseTimerAsync(userId.Value);

                _logger.LogInformation("Pomodoro timer paused for user {UserId}", userId);

                return Ok(timerState);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error pausing Pomodoro timer for user");
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Timer duraklatılırken hata oluştu"
                });
            }
        }

        /// <summary>
        /// Timer'ı devam ettirir
        /// </summary>
        /// <returns>Devam eden timer</returns>
        [HttpPost("timer/resume")]
        [ProducesResponseType(typeof(PomodoroTimerDto), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<PomodoroTimerDto>> ResumeTimer()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                var timerState = await _pomodoroService.ResumeTimerAsync(userId.Value);

                _logger.LogInformation("Pomodoro timer resumed for user {UserId}", userId);

                return Ok(timerState);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resuming Pomodoro timer for user");
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Timer devam ettirilirken hata oluştu"
                });
            }
        }

        /// <summary>
        /// Timer'ı durdurur
        /// </summary>
        /// <returns>Durdurulan timer</returns>
        [HttpPost("timer/stop")]
        [ProducesResponseType(typeof(PomodoroTimerDto), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<PomodoroTimerDto>> StopTimer()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                var timerState = await _pomodoroService.StopTimerAsync(userId.Value);

                _logger.LogInformation("Pomodoro timer stopped for user {UserId}", userId);

                return Ok(timerState);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error stopping Pomodoro timer for user");
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Timer durdurulurken hata oluştu"
                });
            }
        }

        #endregion

        #region Statistics

        /// <summary>
        /// Kullanıcının Pomodoro istatistiklerini getirir
        /// </summary>
        /// <param name="timeFilter">Zaman filtresi (today, week, month)</param>
        /// <param name="startDate">Başlangıç tarihi</param>
        /// <param name="endDate">Bitiş tarihi</param>
        /// <returns>İstatistikler</returns>
        [HttpGet("statistics")]
        [ProducesResponseType(typeof(PomodoroStatisticsDto), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<PomodoroStatisticsDto>> GetStatistics(
            [FromQuery] string? timeFilter = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                // TimeFilter'a göre tarih aralığını ayarla
                if (!string.IsNullOrEmpty(timeFilter) && !startDate.HasValue && !endDate.HasValue)
                {
                    var now = DateTime.UtcNow;
                    switch (timeFilter.ToLower())
                    {
                        case "today":
                            startDate = now.Date;
                            endDate = now.Date.AddDays(1).AddSeconds(-1);
                            break;
                        case "week":
                            var startOfWeek = now.Date.AddDays(-(int)now.DayOfWeek);
                            startDate = startOfWeek;
                            endDate = startOfWeek.AddDays(7).AddSeconds(-1);
                            break;
                        case "month":
                            startDate = new DateTime(now.Year, now.Month, 1);
                            endDate = startDate.Value.AddMonths(1).AddSeconds(-1);
                            break;
                    }
                }

                var statistics = await _pomodoroService.GetStatisticsAsync(userId.Value, startDate, endDate);

                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Pomodoro statistics for user");
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "İstatistikler alınırken hata oluştu"
                });
            }
        }

        #endregion

        #region Quick Actions

        /// <summary>
        /// Hızlı çalışma session'ı başlatır (25 dakika)
        /// </summary>
        /// <param name="title">Session başlığı</param>
        /// <param name="taskId">İlişkili görev ID'si</param>
        /// <returns>Başlatılan session</returns>
        [HttpPost("quick/work")]
        [ProducesResponseType(typeof(PomodoroSessionDto), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<PomodoroSessionDto>> StartQuickWorkSession(
            [FromQuery] string title = "Hızlı Çalışma",
            [FromQuery] int? taskId = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                var session = await _pomodoroService.StartQuickWorkSessionAsync(userId.Value, title, taskId);

                _logger.LogInformation("Quick work session started for user {UserId}: {Title}", userId, title);

                return Ok(session);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting quick work session for user");
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Hızlı çalışma session'ı başlatılırken hata oluştu"
                });
            }
        }

        /// <summary>
        /// Hızlı kısa mola başlatır (5 dakika)
        /// </summary>
        /// <returns>Başlatılan mola</returns>
        [HttpPost("quick/short-break")]
        [ProducesResponseType(typeof(PomodoroSessionDto), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<PomodoroSessionDto>> StartQuickShortBreak()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                var session = await _pomodoroService.StartQuickShortBreakAsync(userId.Value);

                _logger.LogInformation("Quick short break started for user {UserId}", userId);

                return Ok(session);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting quick short break for user");
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Hızlı kısa mola başlatılırken hata oluştu"
                });
            }
        }

        /// <summary>
        /// Hızlı uzun mola başlatır (15 dakika)
        /// </summary>
        /// <returns>Başlatılan mola</returns>
        [HttpPost("quick/long-break")]
        [ProducesResponseType(typeof(PomodoroSessionDto), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<PomodoroSessionDto>> StartQuickLongBreak()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new ApiResponseModel<object>
                    {
                        Success = false,
                        Message = "Kullanıcı kimliği doğrulanamadı"
                    });
                }

                var session = await _pomodoroService.StartQuickLongBreakAsync(userId.Value);

                _logger.LogInformation("Quick long break started for user {UserId}", userId);

                return Ok(session);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting quick long break for user");
                return StatusCode(500, new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Hızlı uzun mola başlatılırken hata oluştu"
                });
            }
        }

        #endregion

        // ===== NOTIFICATION ENDPOINTS =====

        /// <summary>
        /// Session tamamlandığında email notification gönderir
        /// </summary>
        [HttpPost("sessions/{id}/notify/email")]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<ApiResponseModel<object>>> SendEmailNotification(int id)
        {
            try
            {
                _logger.LogInformation("Email notification requested for session {SessionId}", id);
                
                var result = await _pomodoroService.SendEmailNotificationAsync(id);
                
                return Ok(new ApiResponseModel<object>
                {
                    Success = true,
                    Message = "Email notification sent successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email notification for session {SessionId}", id);
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Failed to send email notification",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Session tamamlandığında SMS notification gönderir
        /// </summary>
        [HttpPost("sessions/{id}/notify/sms")]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<ApiResponseModel<object>>> SendSmsNotification(int id)
        {
            try
            {
                _logger.LogInformation("SMS notification requested for session {SessionId}", id);
                
                var result = await _pomodoroService.SendSmsNotificationAsync(id);
                
                return Ok(new ApiResponseModel<object>
                {
                    Success = true,
                    Message = "SMS notification sent successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending SMS notification for session {SessionId}", id);
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Failed to send SMS notification",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Session tamamlandığında push notification gönderir
        /// </summary>
        [HttpPost("sessions/{id}/notify/push")]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 404)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<ApiResponseModel<object>>> SendPushNotification(int id)
        {
            try
            {
                _logger.LogInformation("Push notification requested for session {SessionId}", id);
                
                var result = await _pomodoroService.SendPushNotificationAsync(id);
                
                return Ok(new ApiResponseModel<object>
                {
                    Success = true,
                    Message = "Push notification sent successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending push notification for session {SessionId}", id);
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Failed to send push notification",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Notification ayarlarını günceller
        /// </summary>
        [HttpPut("notifications/settings")]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 400)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<ApiResponseModel<object>>> UpdateNotificationSettings([FromBody] NotificationSettingsDto settings)
        {
            try
            {
                _logger.LogInformation("Notification settings update requested for user {UserId}", GetCurrentUserId());
                
                var result = await _pomodoroService.UpdateNotificationSettingsAsync(GetCurrentUserId()!.Value, settings);
                
                return Ok(new ApiResponseModel<object>
                {
                    Success = true,
                    Message = "Notification settings updated successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating notification settings for user {UserId}", GetCurrentUserId());
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Failed to update notification settings",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Notification ayarlarını getirir
        /// </summary>
        [HttpGet("notifications/settings")]
        [ProducesResponseType(typeof(NotificationSettingsDto), 200)]
        [ProducesResponseType(typeof(ApiResponseModel<object>), 401)]
        public async Task<ActionResult<NotificationSettingsDto>> GetNotificationSettings()
        {
            try
            {
                _logger.LogInformation("Notification settings requested for user {UserId}", GetCurrentUserId());
                
                var settings = await _pomodoroService.GetNotificationSettingsAsync(GetCurrentUserId()!.Value);
                
                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notification settings for user {UserId}", GetCurrentUserId());
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    Message = "Failed to get notification settings",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        #region Private Helper Methods

        /// <summary>
        /// JWT token'dan kullanıcı ID'sini alır
        /// </summary>
        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                return userId;
            }
            return null;
        }

        #endregion
    }
} 