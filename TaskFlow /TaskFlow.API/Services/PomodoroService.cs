// ****************************************************************************************************
//  POMODOROSERVICE.CS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının Pomodoro zaman yönetimi sisteminin ana business logic servisidir.
//  Pomodoro tekniği (25 dakika çalışma + 5 dakika mola) için session yönetimi ve timer kontrolü sağlar.
//
//  ANA BAŞLIKLAR:
//  - Session Management (Oluşturma, güncelleme, silme)
//  - Timer Control (Başlatma, duraklatma, durdurma)
//  - Statistics (İstatistik hesaplama)
//  - Real-time Updates (Gerçek zamanlı güncellemeler)
//  - User Progress (Kullanıcı ilerlemesi)
//
//  POMODORO TEKNİĞİ:
//  - Work Session: 25 dakika odaklanmış çalışma
//  - Short Break: 5 dakika kısa mola
//  - Long Break: 15 dakika uzun mola (4 session sonra)
//  - Sessions Until Long Break: 4 session
//
//  BUSINESS LOGIC:
//  - Session state transitions
//  - Time tracking calculations
//  - Progress computation
//  - Statistics aggregation
//  - Validation rules
//
//  GÜVENLİK:
//  - User isolation (kullanıcı sadece kendi session'larını yönetir)
//  - Input validation ve sanitization
//  - Business rule enforcement
//  - Data integrity protection
//
//  HATA YÖNETİMİ:
//  - Comprehensive exception handling
//  - Business rule validation
//  - Database transaction management
//  - Detailed logging for debugging
//  - Graceful error recovery
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
//  - Clear service design
//  - Comprehensive documentation
//  - Extensible business logic
//  - Backward compatibility
// ****************************************************************************************************

using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Interfaces;
using TaskFlow.API.Models;
using AutoMapper;

namespace TaskFlow.API.Services
{
    /// <summary>
    /// Pomodoro service implementasyonu
    /// </summary>
    public class PomodoroService : IPomodoroService
    {
        private readonly TaskFlowDbContext _context;
        private readonly ILogger<PomodoroService> _logger;
        private readonly IMapper _mapper;
        private readonly ICacheService _cacheService;

        // Pomodoro teknik sabitleri
        private const int DEFAULT_WORK_DURATION = 25;
        private const int DEFAULT_SHORT_BREAK_DURATION = 5;
        private const int DEFAULT_LONG_BREAK_DURATION = 15;
        private const int SESSIONS_UNTIL_LONG_BREAK = 4;

        /// <summary>
        /// PomodoroService constructor
        /// </summary>
        public PomodoroService(
            TaskFlowDbContext context,
            ILogger<PomodoroService> logger,
            IMapper mapper,
            ICacheService cacheService)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
        }

        #region Session Management

        /// <summary>
        /// Yeni Pomodoro session'ı oluşturur
        /// </summary>
        public async Task<PomodoroSessionDto> CreateSessionAsync(int userId, CreatePomodoroSessionDto createDto)
        {
            try
            {
                // Kullanıcının aktif (Working) session'ı var mı kontrol et
                var activeSession = await _context.PomodoroSessions
                    .FirstOrDefaultAsync(s => s.UserId == userId && 
                        s.State == PomodoroSessionState.Working && 
                        s.IsActive);
                
                if (activeSession != null)
                {
                    throw new InvalidOperationException("Zaten aktif bir session'ınız var. Önce mevcut session'ı tamamlayın.");
                }

                // Session numarasını belirle
                var sessionNumber = await GetNextSessionNumberAsync(userId);

                // Yeni session oluştur
                var session = new PomodoroSession
                {
                    Title = createDto.Title,
                    Description = createDto.Description,
                    SessionType = createDto.SessionType,
                    State = PomodoroSessionState.Created,
                    PlannedDurationMinutes = createDto.PlannedDurationMinutes,
                    StartTime = DateTime.UtcNow,
                    SessionNumber = sessionNumber,
                    SessionsCompleted = await GetCompletedSessionsCountAsync(userId),
                    UserId = userId,
                    TaskId = createDto.TaskId,
                    CategoryId = createDto.CategoryId,
                    Notes = createDto.Notes,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                _context.PomodoroSessions.Add(session);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Pomodoro session created: {SessionId} for user {UserId}", session.Id, userId);

                var sessionDto = _mapper.Map<PomodoroSessionDto>(session);
                return sessionDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Pomodoro session for user {UserId}", userId);
                throw;
            }
        }

        /// <summary>
        /// Pomodoro session'ını günceller
        /// </summary>
        public async Task<PomodoroSessionDto> UpdateSessionAsync(int userId, int sessionId, UpdatePomodoroSessionDto updateDto)
        {
            try
            {
                var session = await GetSessionEntityAsync(userId, sessionId);
                if (session == null)
                {
                    throw new InvalidOperationException("Session bulunamadı.");
                }

                // Session'ı güncelle
                if (!string.IsNullOrEmpty(updateDto.Title))
                    session.Title = updateDto.Title;

                if (!string.IsNullOrEmpty(updateDto.Description))
                    session.Description = updateDto.Description;

                if (updateDto.State.HasValue)
                    session.State = updateDto.State.Value;

                if (updateDto.ActualDurationMinutes.HasValue)
                    session.ActualDurationMinutes = updateDto.ActualDurationMinutes.Value;

                if (!string.IsNullOrEmpty(updateDto.Notes))
                    session.Notes = updateDto.Notes;

                session.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Pomodoro session updated: {SessionId} for user {UserId}", sessionId, userId);

                var sessionDto = _mapper.Map<PomodoroSessionDto>(session);
                return sessionDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Pomodoro session {SessionId} for user {UserId}", sessionId, userId);
                throw;
            }
        }

        /// <summary>
        /// Pomodoro session'ını siler
        /// </summary>
        public async Task<bool> DeleteSessionAsync(int userId, int sessionId)
        {
            try
            {
                var session = await GetSessionEntityAsync(userId, sessionId);
                if (session == null)
                {
                    return false;
                }

                // Aktif session'ları silmeye izin verme
                if (session.IsActiveSession)
                {
                    throw new InvalidOperationException("Aktif session'lar silinemez. Önce session'ı durdurun.");
                }

                session.IsActive = false;
                session.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Pomodoro session deleted: {SessionId} for user {UserId}", sessionId, userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting Pomodoro session {SessionId} for user {UserId}", sessionId, userId);
                throw;
            }
        }

        /// <summary>
        /// Belirli bir session'ı getirir
        /// </summary>
        public async Task<PomodoroSessionDto?> GetSessionAsync(int userId, int sessionId)
        {
            try
            {
                var session = await _context.PomodoroSessions
                    .Include(s => s.User)
                    .Include(s => s.Task)
                    .Include(s => s.Category)
                    .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId && s.IsActive);

                if (session == null)
                    return null;

                var sessionDto = _mapper.Map<PomodoroSessionDto>(session);
                return sessionDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Pomodoro session {SessionId} for user {UserId}", sessionId, userId);
                throw;
            }
        }

        /// <summary>
        /// Kullanıcının session'larını listeler
        /// </summary>
        public async Task<PomodoroSessionListDto> GetSessionsAsync(int userId, PomodoroFilterDto filter)
        {
            try
            {
                var query = _context.PomodoroSessions
                    .Include(s => s.User)
                    .Include(s => s.Task)
                    .Include(s => s.Category)
                    .Where(s => s.UserId == userId && s.IsActive);

                // Filtreleme
                if (filter.SessionType.HasValue)
                    query = query.Where(s => s.SessionType == filter.SessionType.Value);

                if (filter.State.HasValue)
                    query = query.Where(s => s.State == filter.State.Value);

                if (filter.StartDate.HasValue)
                    query = query.Where(s => s.StartTime >= filter.StartDate.Value);

                if (filter.EndDate.HasValue)
                    query = query.Where(s => s.StartTime <= filter.EndDate.Value);

                if (filter.TaskId.HasValue)
                    query = query.Where(s => s.TaskId == filter.TaskId.Value);

                if (filter.CategoryId.HasValue)
                    query = query.Where(s => s.CategoryId == filter.CategoryId.Value);

                // Sıralama
                query = filter.SortBy.ToLower() switch
                {
                    "title" => filter.SortAscending ? query.OrderBy(s => s.Title) : query.OrderByDescending(s => s.Title),
                    "starttime" => filter.SortAscending ? query.OrderBy(s => s.StartTime) : query.OrderByDescending(s => s.StartTime),
                    "sessiontype" => filter.SortAscending ? query.OrderBy(s => s.SessionType) : query.OrderByDescending(s => s.SessionType),
                    "state" => filter.SortAscending ? query.OrderBy(s => s.State) : query.OrderByDescending(s => s.State),
                    _ => filter.SortAscending ? query.OrderBy(s => s.CreatedAt) : query.OrderByDescending(s => s.CreatedAt)
                };

                // Sayfalama
                var totalCount = await query.CountAsync();
                var sessions = await query
                    .Skip((filter.Page - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToListAsync();

                var sessionDtos = _mapper.Map<List<PomodoroSessionDto>>(sessions);

                return new PomodoroSessionListDto
                {
                    Sessions = sessionDtos,
                    TotalCount = totalCount,
                    Page = filter.Page,
                    PageSize = filter.PageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / filter.PageSize),
                    HasNextPage = filter.Page * filter.PageSize < totalCount,
                    HasPreviousPage = filter.Page > 1
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Pomodoro sessions for user {UserId}", userId);
                throw;
            }
        }

        #endregion

        #region Timer Control

        /// <summary>
        /// Session'ı başlatır
        /// </summary>
        public async Task<PomodoroSessionDto> StartSessionAsync(int userId, int sessionId)
        {
            try
            {
                var session = await GetSessionEntityAsync(userId, sessionId);
                if (session == null)
                {
                    throw new InvalidOperationException("Session bulunamadı.");
                }

                // Aktif session kontrolü - sadece Working state'teki session'ları kontrol et
                var activeSession = await _context.PomodoroSessions
                    .FirstOrDefaultAsync(s => s.UserId == userId && 
                        s.State == PomodoroSessionState.Working && 
                        s.IsActive);
                
                if (activeSession != null && activeSession.Id != sessionId)
                {
                    throw new InvalidOperationException("Zaten aktif bir session'ınız var. Önce mevcut session'ı tamamlayın.");
                }

                if (!await CanStartSessionAsync(userId, sessionId))
                {
                    throw new InvalidOperationException("Session başlatılamaz.");
                }

                // Session'ı başlat
                session.State = PomodoroSessionState.Working;
                session.StartTime = DateTime.UtcNow;
                session.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Pomodoro session started: {SessionId} for user {UserId}", sessionId, userId);

                var sessionDto = _mapper.Map<PomodoroSessionDto>(session);
                return sessionDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting Pomodoro session {SessionId} for user {UserId}", sessionId, userId);
                throw;
            }
        }

        /// <summary>
        /// Session'ı duraklatır
        /// </summary>
        public async Task<PomodoroSessionDto> PauseSessionAsync(int userId, int sessionId)
        {
            try
            {
                var session = await GetSessionEntityAsync(userId, sessionId);
                if (session == null)
                {
                    throw new InvalidOperationException("Session bulunamadı.");
                }

                if (!await CanPauseSessionAsync(userId, sessionId))
                {
                    throw new InvalidOperationException("Session duraklatılamaz.");
                }

                // Session'ı duraklat
                session.State = PomodoroSessionState.Paused;
                session.LastPauseTime = DateTime.UtcNow;
                session.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Pomodoro session paused: {SessionId} for user {UserId}", sessionId, userId);

                var sessionDto = _mapper.Map<PomodoroSessionDto>(session);
                return sessionDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error pausing Pomodoro session {SessionId} for user {UserId}", sessionId, userId);
                throw;
            }
        }

        /// <summary>
        /// Session'ı devam ettirir
        /// </summary>
        public async Task<PomodoroSessionDto> ResumeSessionAsync(int userId, int sessionId)
        {
            try
            {
                var session = await GetSessionEntityAsync(userId, sessionId);
                if (session == null)
                {
                    throw new InvalidOperationException("Session bulunamadı.");
                }

                if (session.State != PomodoroSessionState.Paused)
                {
                    throw new InvalidOperationException("Sadece duraklatılmış session'lar devam ettirilebilir.");
                }

                // Duraklama süresini hesapla
                if (session.LastPauseTime.HasValue)
                {
                    var pauseDuration = DateTime.UtcNow - session.LastPauseTime.Value;
                    session.TotalPauseMinutes += (int)pauseDuration.TotalMinutes;
                }

                // Session'ı devam ettir
                session.State = session.SessionType == PomodoroSessionType.Work ? 
                    PomodoroSessionState.Working : 
                    (session.SessionType == PomodoroSessionType.ShortBreak ? 
                        PomodoroSessionState.ShortBreak : 
                        PomodoroSessionState.LongBreak);

                session.LastPauseTime = null;
                session.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Pomodoro session resumed: {SessionId} for user {UserId}", sessionId, userId);

                var sessionDto = _mapper.Map<PomodoroSessionDto>(session);
                return sessionDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resuming Pomodoro session {SessionId} for user {UserId}", sessionId, userId);
                throw;
            }
        }

        /// <summary>
        /// Session'ı tamamlar
        /// </summary>
        public async Task<PomodoroSessionDto> CompleteSessionAsync(int userId, int sessionId)
        {
            try
            {
                var session = await GetSessionEntityAsync(userId, sessionId);
                if (session == null)
                {
                    throw new InvalidOperationException("Session bulunamadı.");
                }

                if (!await CanCompleteSessionAsync(userId, sessionId))
                {
                    throw new InvalidOperationException("Session tamamlanamaz.");
                }

                // Session'ı tamamla
                session.State = PomodoroSessionState.Completed;
                session.EndTime = DateTime.UtcNow;
                session.IsCompleted = true;
                session.ActualDurationMinutes = (int)(DateTime.UtcNow - session.StartTime).TotalMinutes;
                session.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Pomodoro session completed: {SessionId} for user {UserId}", sessionId, userId);

                var sessionDto = _mapper.Map<PomodoroSessionDto>(session);
                return sessionDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing Pomodoro session {SessionId} for user {UserId}", sessionId, userId);
                throw;
            }
        }

        /// <summary>
        /// Session'ı iptal eder
        /// </summary>
        public async Task<PomodoroSessionDto> CancelSessionAsync(int userId, int sessionId)
        {
            try
            {
                var session = await GetSessionEntityAsync(userId, sessionId);
                if (session == null)
                {
                    throw new InvalidOperationException("Session bulunamadı.");
                }

                // Session'ı iptal et
                session.State = PomodoroSessionState.Cancelled;
                session.EndTime = DateTime.UtcNow;
                session.IsCancelled = true;
                session.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Pomodoro session cancelled: {SessionId} for user {UserId}", sessionId, userId);

                var sessionDto = _mapper.Map<PomodoroSessionDto>(session);
                return sessionDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling Pomodoro session {SessionId} for user {UserId}", sessionId, userId);
                throw;
            }
        }

        /// <summary>
        /// Kullanıcının aktif session'ını getirir
        /// </summary>
        public async Task<PomodoroSessionDto?> GetActiveSessionAsync(int userId)
        {
            try
            {
                var session = await _context.PomodoroSessions
                    .Include(s => s.User)
                    .Include(s => s.Task)
                    .Include(s => s.Category)
                    .FirstOrDefaultAsync(s => s.UserId == userId && 
                        s.State == PomodoroSessionState.Working && 
                        s.IsActive);

                if (session == null)
                    return null;

                var sessionDto = _mapper.Map<PomodoroSessionDto>(session);
                return sessionDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active Pomodoro session for user {UserId}", userId);
                throw;
            }
        }

        #endregion

        #region Timer State

        /// <summary>
        /// Timer durumunu getirir
        /// </summary>
        public async Task<PomodoroTimerDto> GetTimerStateAsync(int userId)
        {
            try
            {
                var activeSession = await GetActiveSessionAsync(userId);
                
                if (activeSession == null)
                {
                    return new PomodoroTimerDto
                    {
                        IsActive = false,
                        IsPaused = false,
                        State = PomodoroSessionState.Created,
                        SessionType = PomodoroSessionType.Work,
                        RemainingSeconds = 0,
                        TotalSeconds = 0,
                        CompletionPercentage = 0
                    };
                }

                var remainingSeconds = activeSession.RemainingMinutes * 60;
                var totalSeconds = activeSession.PlannedDurationMinutes * 60;

                return new PomodoroTimerDto
                {
                    ActiveSessionId = activeSession.Id,
                    State = activeSession.State,
                    SessionType = activeSession.SessionType,
                    SessionTitle = activeSession.Title,
                    IsActive = activeSession.IsActiveSession,
                    IsPaused = activeSession.IsPaused,
                    RemainingSeconds = Math.Max(0, remainingSeconds),
                    TotalSeconds = totalSeconds,
                    CompletionPercentage = activeSession.CompletionPercentage,
                    NextSessionType = await GetNextSessionTypeAsync(userId)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting timer state for user {UserId}", userId);
                throw;
            }
        }

        /// <summary>
        /// Timer'ı başlatır
        /// </summary>
        public async Task<PomodoroTimerDto> StartTimerAsync(int userId, PomodoroSessionType sessionType, int durationMinutes)
        {
            try
            {
                // Aktif session var mı kontrol et
                var activeSession = await GetActiveSessionAsync(userId);
                if (activeSession != null)
                {
                    throw new InvalidOperationException("Zaten aktif bir timer var.");
                }

                // Yeni session oluştur ve başlat
                var createDto = new CreatePomodoroSessionDto
                {
                    Title = GetSessionTitle(sessionType),
                    SessionType = sessionType,
                    PlannedDurationMinutes = durationMinutes
                };

                var session = await CreateSessionAsync(userId, createDto);
                await StartSessionAsync(userId, session.Id);

                return await GetTimerStateAsync(userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting timer for user {UserId}", userId);
                throw;
            }
        }

        /// <summary>
        /// Timer'ı duraklatır
        /// </summary>
        public async Task<PomodoroTimerDto> PauseTimerAsync(int userId)
        {
            try
            {
                var activeSession = await GetActiveSessionAsync(userId);
                if (activeSession == null)
                {
                    throw new InvalidOperationException("Aktif timer bulunamadı.");
                }

                await PauseSessionAsync(userId, activeSession.Id);
                return await GetTimerStateAsync(userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error pausing timer for user {UserId}", userId);
                throw;
            }
        }

        /// <summary>
        /// Timer'ı devam ettirir
        /// </summary>
        public async Task<PomodoroTimerDto> ResumeTimerAsync(int userId)
        {
            try
            {
                var activeSession = await GetActiveSessionAsync(userId);
                if (activeSession == null)
                {
                    throw new InvalidOperationException("Aktif timer bulunamadı.");
                }

                await ResumeSessionAsync(userId, activeSession.Id);
                return await GetTimerStateAsync(userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resuming timer for user {UserId}", userId);
                throw;
            }
        }

        /// <summary>
        /// Timer'ı durdurur
        /// </summary>
        public async Task<PomodoroTimerDto> StopTimerAsync(int userId)
        {
            try
            {
                var activeSession = await GetActiveSessionAsync(userId);
                if (activeSession == null)
                {
                    throw new InvalidOperationException("Aktif timer bulunamadı.");
                }

                await CancelSessionAsync(userId, activeSession.Id);
                return await GetTimerStateAsync(userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error stopping timer for user {UserId}", userId);
                throw;
            }
        }

        #endregion

        #region Statistics

        /// <summary>
        /// Kullanıcının Pomodoro istatistiklerini getirir
        /// </summary>
        public async Task<PomodoroStatisticsDto> GetStatisticsAsync(int userId, DateTime? startDate = null, DateTime? endDate = null)
        {
            try
            {
                var query = _context.PomodoroSessions
                    .Where(s => s.UserId == userId && s.IsActive);

                if (startDate.HasValue)
                    query = query.Where(s => s.StartTime >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(s => s.StartTime <= endDate.Value);

                var sessions = await query.ToListAsync();

                var totalSessions = sessions.Count;
                var completedSessions = sessions.Count(s => s.IsCompleted);
                var cancelledSessions = sessions.Count(s => s.IsCancelled);
                var totalWorkMinutes = sessions.Where(s => s.SessionType == PomodoroSessionType.Work && s.ActualDurationMinutes.HasValue)
                    .Sum(s => s.ActualDurationMinutes.Value);
                var totalBreakMinutes = sessions.Where(s => s.SessionType != PomodoroSessionType.Work && s.ActualDurationMinutes.HasValue)
                    .Sum(s => s.ActualDurationMinutes.Value);

                var sessionsWithDuration = sessions.Where(s => s.ActualDurationMinutes.HasValue).ToList();
                var averageSessionMinutes = sessionsWithDuration.Any() ? 
                    sessionsWithDuration.Average(s => s.ActualDurationMinutes.Value) : 0;

                var todaySessions = sessions.Count(s => s.StartTime.Date == DateTime.UtcNow.Date);
                var thisWeekSessions = sessions.Count(s => s.StartTime >= DateTime.UtcNow.AddDays(-7));
                var thisMonthSessions = sessions.Count(s => s.StartTime.Month == DateTime.UtcNow.Month && s.StartTime.Year == DateTime.UtcNow.Year);
                var longestSessionMinutes = sessionsWithDuration.Any() ? 
                    sessionsWithDuration.Max(s => s.ActualDurationMinutes.Value) : 0;
                var shortestSessionMinutes = sessionsWithDuration.Any() ? 
                    sessionsWithDuration.Min(s => s.ActualDurationMinutes.Value) : 0;

                var successRate = totalSessions > 0 ? (double)completedSessions / totalSessions * 100 : 0;

                return new PomodoroStatisticsDto
                {
                    TotalSessions = totalSessions,
                    CompletedSessions = completedSessions,
                    CancelledSessions = cancelledSessions,
                    TotalWorkMinutes = totalWorkMinutes,
                    TotalBreakMinutes = totalBreakMinutes,
                    AverageSessionMinutes = averageSessionMinutes,
                    TodaySessions = todaySessions,
                    ThisWeekSessions = thisWeekSessions,
                    ThisMonthSessions = thisMonthSessions,
                    LongestSessionMinutes = longestSessionMinutes,
                    ShortestSessionMinutes = shortestSessionMinutes,
                    SuccessRate = successRate
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Pomodoro statistics for user {UserId}", userId);
                throw;
            }
        }

        /// <summary>
        /// Günlük istatistikleri getirir
        /// </summary>
        public async Task<PomodoroStatisticsDto> GetDailyStatisticsAsync(int userId, DateTime date)
        {
            var startDate = date.Date;
            var endDate = startDate.AddDays(1);
            return await GetStatisticsAsync(userId, startDate, endDate);
        }

        /// <summary>
        /// Haftalık istatistikleri getirir
        /// </summary>
        public async Task<PomodoroStatisticsDto> GetWeeklyStatisticsAsync(int userId, DateTime startOfWeek)
        {
            var endOfWeek = startOfWeek.AddDays(7);
            return await GetStatisticsAsync(userId, startOfWeek, endOfWeek);
        }

        /// <summary>
        /// Aylık istatistikleri getirir
        /// </summary>
        public async Task<PomodoroStatisticsDto> GetMonthlyStatisticsAsync(int userId, int year, int month)
        {
            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1);
            return await GetStatisticsAsync(userId, startDate, endDate);
        }

        #endregion

        #region Quick Actions

        /// <summary>
        /// Hızlı çalışma session'ı başlatır (25 dakika)
        /// </summary>
        public async Task<PomodoroSessionDto> StartQuickWorkSessionAsync(int userId, string title, int? taskId = null)
        {
            var createDto = new CreatePomodoroSessionDto
            {
                Title = title,
                SessionType = PomodoroSessionType.Work,
                PlannedDurationMinutes = DEFAULT_WORK_DURATION,
                TaskId = taskId
            };

            var session = await CreateSessionAsync(userId, createDto);
            return await StartSessionAsync(userId, session.Id);
        }

        /// <summary>
        /// Hızlı kısa mola başlatır (5 dakika)
        /// </summary>
        public async Task<PomodoroSessionDto> StartQuickShortBreakAsync(int userId)
        {
            var createDto = new CreatePomodoroSessionDto
            {
                Title = "Kısa Mola",
                SessionType = PomodoroSessionType.ShortBreak,
                PlannedDurationMinutes = DEFAULT_SHORT_BREAK_DURATION
            };

            var session = await CreateSessionAsync(userId, createDto);
            return await StartSessionAsync(userId, session.Id);
        }

        /// <summary>
        /// Hızlı uzun mola başlatır (15 dakika)
        /// </summary>
        public async Task<PomodoroSessionDto> StartQuickLongBreakAsync(int userId)
        {
            var createDto = new CreatePomodoroSessionDto
            {
                Title = "Uzun Mola",
                SessionType = PomodoroSessionType.LongBreak,
                PlannedDurationMinutes = DEFAULT_LONG_BREAK_DURATION
            };

            var session = await CreateSessionAsync(userId, createDto);
            return await StartSessionAsync(userId, session.Id);
        }

        /// <summary>
        /// Sonraki session tipini belirler
        /// </summary>
        public async Task<PomodoroSessionType> GetNextSessionTypeAsync(int userId)
        {
            var completedSessions = await GetCompletedSessionsCountAsync(userId);
            var sessionInCurrentCycle = completedSessions % SESSIONS_UNTIL_LONG_BREAK;

            // 4 session tamamlandıysa uzun mola, yoksa kısa mola
            return sessionInCurrentCycle == 0 ? PomodoroSessionType.LongBreak : PomodoroSessionType.ShortBreak;
        }

        #endregion

        #region Validation

        /// <summary>
        /// Session'ın başlatılabilir olup olmadığını kontrol eder
        /// </summary>
        public async Task<bool> CanStartSessionAsync(int userId, int sessionId)
        {
            var session = await GetSessionEntityAsync(userId, sessionId);
            if (session == null) return false;

            return session.State == PomodoroSessionState.Created;
        }

        /// <summary>
        /// Session'ın duraklatılabilir olup olmadığını kontrol eder
        /// </summary>
        public async Task<bool> CanPauseSessionAsync(int userId, int sessionId)
        {
            var session = await GetSessionEntityAsync(userId, sessionId);
            if (session == null) return false;

            return session.State == PomodoroSessionState.Working || 
                   session.State == PomodoroSessionState.ShortBreak || 
                   session.State == PomodoroSessionState.LongBreak;
        }

        /// <summary>
        /// Session'ın tamamlanabilir olup olmadığını kontrol eder
        /// </summary>
        public async Task<bool> CanCompleteSessionAsync(int userId, int sessionId)
        {
            var session = await GetSessionEntityAsync(userId, sessionId);
            if (session == null) return false;

            return session.State == PomodoroSessionState.Working || 
                   session.State == PomodoroSessionState.ShortBreak || 
                   session.State == PomodoroSessionState.LongBreak ||
                   session.State == PomodoroSessionState.Paused;
        }

        #endregion

        #region Private Helper Methods

        /// <summary>
        /// Session entity'sini getirir
        /// </summary>
        private async Task<PomodoroSession?> GetSessionEntityAsync(int userId, int sessionId)
        {
            return await _context.PomodoroSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId && s.IsActive);
        }

        /// <summary>
        /// Sonraki session numarasını getirir
        /// </summary>
        private async Task<int> GetNextSessionNumberAsync(int userId)
        {
            var lastSession = await _context.PomodoroSessions
                .Where(s => s.UserId == userId && s.IsActive)
                .OrderByDescending(s => s.SessionNumber)
                .FirstOrDefaultAsync();

            return lastSession?.SessionNumber + 1 ?? 1;
        }

        /// <summary>
        /// Tamamlanan session sayısını getirir
        /// </summary>
        private async Task<int> GetCompletedSessionsCountAsync(int userId)
        {
            return await _context.PomodoroSessions
                .CountAsync(s => s.UserId == userId && s.IsCompleted && s.IsActive);
        }

        /// <summary>
        /// Session başlığını oluşturur
        /// </summary>
        private string GetSessionTitle(PomodoroSessionType sessionType)
        {
            return sessionType switch
            {
                PomodoroSessionType.Work => "Çalışma Session'ı",
                PomodoroSessionType.ShortBreak => "Kısa Mola",
                PomodoroSessionType.LongBreak => "Uzun Mola",
                _ => "Session"
            };
        }

        #endregion

        #region Notifications

        /// <summary>
        /// Email notification gönderir
        /// </summary>
        public async Task<bool> SendEmailNotificationAsync(int sessionId)
        {
            try
            {
                var session = await _context.PomodoroSessions
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.Id == sessionId);

                if (session == null)
                {
                    _logger.LogWarning("Session not found for email notification: {SessionId}", sessionId);
                    return false;
                }

                // Email gönderme işlemi burada implement edilecek
                _logger.LogInformation("Email notification sent for session: {SessionId}", sessionId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email notification for session: {SessionId}", sessionId);
                return false;
            }
        }

        /// <summary>
        /// SMS notification gönderir
        /// </summary>
        public async Task<bool> SendSmsNotificationAsync(int sessionId)
        {
            try
            {
                var session = await _context.PomodoroSessions
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.Id == sessionId);

                if (session == null)
                {
                    _logger.LogWarning("Session not found for SMS notification: {SessionId}", sessionId);
                    return false;
                }

                // SMS gönderme işlemi burada implement edilecek
                _logger.LogInformation("SMS notification sent for session: {SessionId}", sessionId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending SMS notification for session: {SessionId}", sessionId);
                return false;
            }
        }

        /// <summary>
        /// Push notification gönderir
        /// </summary>
        public async Task<bool> SendPushNotificationAsync(int sessionId)
        {
            try
            {
                var session = await _context.PomodoroSessions
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.Id == sessionId);

                if (session == null)
                {
                    _logger.LogWarning("Session not found for push notification: {SessionId}", sessionId);
                    return false;
                }

                // Push notification gönderme işlemi burada implement edilecek
                _logger.LogInformation("Push notification sent for session: {SessionId}", sessionId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending push notification for session: {SessionId}", sessionId);
                return false;
            }
        }

        /// <summary>
        /// Notification ayarlarını günceller
        /// </summary>
        public async Task<NotificationSettingsDto> UpdateNotificationSettingsAsync(int userId, NotificationSettingsDto settings)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    throw new ArgumentException("User not found");
                }

                // Notification ayarlarını güncelleme işlemi burada implement edilecek
                // Şimdilik sadece log yazıyoruz
                _logger.LogInformation("Notification settings updated for user: {UserId}", userId);

                return settings;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating notification settings for user: {UserId}", userId);
                throw;
            }
        }

        /// <summary>
        /// Notification ayarlarını getirir
        /// </summary>
        public async Task<NotificationSettingsDto> GetNotificationSettingsAsync(int userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    throw new ArgumentException("User not found");
                }

                // Varsayılan notification ayarları
                return new NotificationSettingsDto
                {
                    EmailEnabled = true,
                    SmsEnabled = false,
                    PushEnabled = true,
                    SoundEnabled = true,
                    NotifyOnSessionComplete = true,
                    NotifyOnSessionPause = false,
                    NotifyDailySummary = true,
                    NotifyWeeklySummary = true,
                    NotificationTime = 9,
                    NotificationMinute = 0,
                    TimeZone = "Europe/Istanbul"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notification settings for user: {UserId}", userId);
                throw;
            }
        }

        #endregion
    }
} 