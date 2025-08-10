// ****************************************************************************************************
//  IPOMODOROSERVICE.CS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının Pomodoro zaman yönetimi sistemi için service interface'ini içerir.
//  Pomodoro session'larının oluşturulması, yönetilmesi ve takibi için gerekli metodları tanımlar.
//
//  ANA BAŞLIKLAR:
//  - Session Management (Oluşturma, güncelleme, silme)
//  - Timer Control (Başlatma, duraklatma, durdurma)
//  - Statistics (İstatistik hesaplama)
//  - Real-time Updates (Gerçek zamanlı güncellemeler)
//  - User Progress (Kullanıcı ilerlemesi)
//
//  SERVICE METODLARI:
//  - CreateSession: Yeni session oluşturma
//  - UpdateSession: Session güncelleme
//  - DeleteSession: Session silme
//  - GetSession: Session getirme
//  - GetSessions: Session listesi
//  - StartSession: Session başlatma
//  - PauseSession: Session duraklatma
//  - ResumeSession: Session devam ettirme
//  - CompleteSession: Session tamamlama
//  - CancelSession: Session iptal etme
//  - GetTimerState: Timer durumu
//  - GetStatistics: İstatistikler
//
//  BUSINESS LOGIC:
//  - Pomodoro technique rules
//  - Session state management
//  - Time tracking logic
//  - Progress calculation
//  - Statistics computation
//
//  VALIDATION:
//  - Session duration limits
//  - State transition rules
//  - User authorization
//  - Data integrity
//
//  PERFORMANCE:
//  - Efficient queries
//  - Caching strategies
//  - Real-time updates
//  - Memory optimization
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Clear interface design
//  - Comprehensive documentation
//  - Extensible methods
//  - Backward compatibility
// ****************************************************************************************************

using TaskFlow.API.DTOs;
using TaskFlow.API.Models;

namespace TaskFlow.API.Interfaces
{
    /// <summary>
    /// Pomodoro service interface'i
    /// </summary>
    public interface IPomodoroService
    {
        #region Session Management

        /// <summary>
        /// Yeni Pomodoro session'ı oluşturur
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="createDto">Session oluşturma DTO'su</param>
        /// <returns>Oluşturulan session</returns>
        Task<PomodoroSessionDto> CreateSessionAsync(int userId, CreatePomodoroSessionDto createDto);

        /// <summary>
        /// Pomodoro session'ını günceller
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="sessionId">Session ID'si</param>
        /// <param name="updateDto">Güncelleme DTO'su</param>
        /// <returns>Güncellenmiş session</returns>
        Task<PomodoroSessionDto> UpdateSessionAsync(int userId, int sessionId, UpdatePomodoroSessionDto updateDto);

        /// <summary>
        /// Pomodoro session'ını siler
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="sessionId">Session ID'si</param>
        /// <returns>Silme işlemi başarılı mı?</returns>
        Task<bool> DeleteSessionAsync(int userId, int sessionId);

        /// <summary>
        /// Belirli bir session'ı getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="sessionId">Session ID'si</param>
        /// <returns>Session bilgisi</returns>
        Task<PomodoroSessionDto?> GetSessionAsync(int userId, int sessionId);

        /// <summary>
        /// Kullanıcının session'larını listeler
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="filter">Filtreleme parametreleri</param>
        /// <returns>Session listesi</returns>
        Task<PomodoroSessionListDto> GetSessionsAsync(int userId, PomodoroFilterDto filter);

        #endregion

        #region Timer Control

        /// <summary>
        /// Session'ı başlatır
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="sessionId">Session ID'si</param>
        /// <returns>Başlatılan session</returns>
        Task<PomodoroSessionDto> StartSessionAsync(int userId, int sessionId);

        /// <summary>
        /// Session'ı duraklatır
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="sessionId">Session ID'si</param>
        /// <returns>Duraklatılan session</returns>
        Task<PomodoroSessionDto> PauseSessionAsync(int userId, int sessionId);

        /// <summary>
        /// Session'ı devam ettirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="sessionId">Session ID'si</param>
        /// <returns>Devam eden session</returns>
        Task<PomodoroSessionDto> ResumeSessionAsync(int userId, int sessionId);

        /// <summary>
        /// Session'ı tamamlar
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="sessionId">Session ID'si</param>
        /// <returns>Tamamlanan session</returns>
        Task<PomodoroSessionDto> CompleteSessionAsync(int userId, int sessionId);

        /// <summary>
        /// Session'ı iptal eder
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="sessionId">Session ID'si</param>
        /// <returns>İptal edilen session</returns>
        Task<PomodoroSessionDto> CancelSessionAsync(int userId, int sessionId);

        /// <summary>
        /// Kullanıcının aktif session'ını getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <returns>Aktif session</returns>
        Task<PomodoroSessionDto?> GetActiveSessionAsync(int userId);

        #endregion

        #region Timer State

        /// <summary>
        /// Timer durumunu getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <returns>Timer durumu</returns>
        Task<PomodoroTimerDto> GetTimerStateAsync(int userId);

        /// <summary>
        /// Timer'ı başlatır
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="sessionType">Session tipi</param>
        /// <param name="durationMinutes">Süre (dakika)</param>
        /// <returns>Başlatılan timer</returns>
        Task<PomodoroTimerDto> StartTimerAsync(int userId, PomodoroSessionType sessionType, int durationMinutes);

        /// <summary>
        /// Timer'ı duraklatır
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <returns>Duraklatılan timer</returns>
        Task<PomodoroTimerDto> PauseTimerAsync(int userId);

        /// <summary>
        /// Timer'ı devam ettirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <returns>Devam eden timer</returns>
        Task<PomodoroTimerDto> ResumeTimerAsync(int userId);

        /// <summary>
        /// Timer'ı durdurur
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <returns>Durdurulan timer</returns>
        Task<PomodoroTimerDto> StopTimerAsync(int userId);

        #endregion

        #region Statistics

        /// <summary>
        /// Kullanıcının Pomodoro istatistiklerini getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="startDate">Başlangıç tarihi</param>
        /// <param name="endDate">Bitiş tarihi</param>
        /// <returns>İstatistikler</returns>
        Task<PomodoroStatisticsDto> GetStatisticsAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);

        /// <summary>
        /// Günlük istatistikleri getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="date">Tarih</param>
        /// <returns>Günlük istatistikler</returns>
        Task<PomodoroStatisticsDto> GetDailyStatisticsAsync(int userId, DateTime date);

        /// <summary>
        /// Haftalık istatistikleri getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="startOfWeek">Haftanın başlangıcı</param>
        /// <returns>Haftalık istatistikler</returns>
        Task<PomodoroStatisticsDto> GetWeeklyStatisticsAsync(int userId, DateTime startOfWeek);

        /// <summary>
        /// Aylık istatistikleri getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="year">Yıl</param>
        /// <param name="month">Ay</param>
        /// <returns>Aylık istatistikler</returns>
        Task<PomodoroStatisticsDto> GetMonthlyStatisticsAsync(int userId, int year, int month);

        #endregion

        #region Quick Actions

        /// <summary>
        /// Hızlı çalışma session'ı başlatır (25 dakika)
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="title">Session başlığı</param>
        /// <param name="taskId">İlişkili görev ID'si</param>
        /// <returns>Başlatılan session</returns>
        Task<PomodoroSessionDto> StartQuickWorkSessionAsync(int userId, string title, int? taskId = null);

        /// <summary>
        /// Hızlı kısa mola başlatır (5 dakika)
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <returns>Başlatılan mola</returns>
        Task<PomodoroSessionDto> StartQuickShortBreakAsync(int userId);

        /// <summary>
        /// Hızlı uzun mola başlatır (15 dakika)
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <returns>Başlatılan mola</returns>
        Task<PomodoroSessionDto> StartQuickLongBreakAsync(int userId);

        /// <summary>
        /// Sonraki session tipini belirler
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <returns>Sonraki session tipi</returns>
        Task<PomodoroSessionType> GetNextSessionTypeAsync(int userId);

        #endregion

        #region Validation

        /// <summary>
        /// Session'ın başlatılabilir olup olmadığını kontrol eder
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="sessionId">Session ID'si</param>
        /// <returns>Başlatılabilir mi?</returns>
        Task<bool> CanStartSessionAsync(int userId, int sessionId);

        /// <summary>
        /// Session'ın duraklatılabilir olup olmadığını kontrol eder
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="sessionId">Session ID'si</param>
        /// <returns>Duraklatılabilir mi?</returns>
        Task<bool> CanPauseSessionAsync(int userId, int sessionId);

        /// <summary>
        /// Session'ın tamamlanabilir olup olmadığını kontrol eder
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="sessionId">Session ID'si</param>
        /// <returns>Tamamlanabilir mi?</returns>
        Task<bool> CanCompleteSessionAsync(int userId, int sessionId);

        #endregion

        #region Notifications

        /// <summary>
        /// Email notification gönderir
        /// </summary>
        /// <param name="sessionId">Session ID'si</param>
        /// <returns>Gönderim sonucu</returns>
        Task<bool> SendEmailNotificationAsync(int sessionId);

        /// <summary>
        /// SMS notification gönderir
        /// </summary>
        /// <param name="sessionId">Session ID'si</param>
        /// <returns>Gönderim sonucu</returns>
        Task<bool> SendSmsNotificationAsync(int sessionId);

        /// <summary>
        /// Push notification gönderir
        /// </summary>
        /// <param name="sessionId">Session ID'si</param>
        /// <returns>Gönderim sonucu</returns>
        Task<bool> SendPushNotificationAsync(int sessionId);

        /// <summary>
        /// Notification ayarlarını günceller
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <param name="settings">Notification ayarları</param>
        /// <returns>Güncellenmiş ayarlar</returns>
        Task<NotificationSettingsDto> UpdateNotificationSettingsAsync(int userId, NotificationSettingsDto settings);

        /// <summary>
        /// Notification ayarlarını getirir
        /// </summary>
        /// <param name="userId">Kullanıcı ID'si</param>
        /// <returns>Notification ayarları</returns>
        Task<NotificationSettingsDto> GetNotificationSettingsAsync(int userId);

        #endregion
    }
} 