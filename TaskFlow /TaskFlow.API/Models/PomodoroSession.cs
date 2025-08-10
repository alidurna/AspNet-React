// ****************************************************************************************************
//  POMODOROSESSION.CS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının Pomodoro zaman yönetimi sisteminin ana entity modelidir.
//  Pomodoro tekniği (25 dakika çalışma + 5 dakika mola) için session takibi sağlar.
//
//  ANA BAŞLIKLAR:
//  - Session Management (Başlangıç, bitiş, durum)
//  - Time Tracking (Çalışma süresi, mola süresi)
//  - Task Integration (Görev ile ilişki)
//  - Statistics (Session sayısı, toplam süre)
//  - User Progress (Kullanıcı ilerlemesi)
//
//  POMODORO TEKNİĞİ:
//  - Work Session: 25 dakika odaklanmış çalışma
//  - Short Break: 5 dakika kısa mola
//  - Long Break: 15 dakika uzun mola (4 session sonra)
//  - Sessions Until Long Break: 4 session
//
//  GÜVENLİK:
//  - User isolation (UserId foreign key)
//  - Data validation constraints
//  - Session integrity
//  - Time validation
//
//  HATA YÖNETİMİ:
//  - Invalid session durations
//  - Overlapping sessions
//  - Time zone issues
//  - Session state conflicts
//
//  EDGE-CASE'LER:
//  - Browser refresh during session
//  - Multiple active sessions
//  - Session interruption
//  - Time synchronization
//
//  YAN ETKİLER:
//  - Session creation affects user statistics
//  - Session completion affects task progress
//  - Session data affects productivity metrics
//
//  PERFORMANS:
//  - Efficient session queries
//  - Real-time updates
//  - Session caching
//  - Statistics calculation
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Clear entity design
//  - Comprehensive documentation
//  - Extensible model structure
//  - Backward compatibility
// ****************************************************************************************************

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskFlow.API.Models
{
    /// <summary>
    /// Pomodoro session durumları
    /// </summary>
    public enum PomodoroSessionState
    {
        /// <summary>
        /// Session başlatıldı ama henüz aktif değil
        /// </summary>
        Created = 0,

        /// <summary>
        /// Çalışma session'ı aktif
        /// </summary>
        Working = 1,

        /// <summary>
        /// Kısa mola aktif
        /// </summary>
        ShortBreak = 2,

        /// <summary>
        /// Uzun mola aktif
        /// </summary>
        LongBreak = 3,

        /// <summary>
        /// Session tamamlandı
        /// </summary>
        Completed = 4,

        /// <summary>
        /// Session iptal edildi
        /// </summary>
        Cancelled = 5,

        /// <summary>
        /// Session duraklatıldı
        /// </summary>
        Paused = 6
    }

    /// <summary>
    /// Pomodoro session tipi
    /// </summary>
    public enum PomodoroSessionType
    {
        /// <summary>
        /// Çalışma session'ı
        /// </summary>
        Work = 0,

        /// <summary>
        /// Kısa mola
        /// </summary>
        ShortBreak = 1,

        /// <summary>
        /// Uzun mola
        /// </summary>
        LongBreak = 2
    }

    /// <summary>
    /// Pomodoro session entity modeli
    /// </summary>
    public class PomodoroSession
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        /// <summary>
        /// Session başlığı
        /// </summary>
        [Required]
        [MaxLength(200)]
        public required string Title { get; set; }

        /// <summary>
        /// Session açıklaması
        /// </summary>
        [MaxLength(1000)]
        public string? Description { get; set; }

        /// <summary>
        /// Session tipi (Work, ShortBreak, LongBreak)
        /// </summary>
        [Required]
        public PomodoroSessionType SessionType { get; set; }

        /// <summary>
        /// Session durumu
        /// </summary>
        [Required]
        public PomodoroSessionState State { get; set; }

        /// <summary>
        /// Planlanan süre (dakika)
        /// </summary>
        [Required]
        [Range(1, 120)]
        public int PlannedDurationMinutes { get; set; }

        /// <summary>
        /// Gerçek süre (dakika)
        /// </summary>
        [Range(0, 120)]
        public int? ActualDurationMinutes { get; set; }

        /// <summary>
        /// Session başlangıç zamanı
        /// </summary>
        [Required]
        public DateTime StartTime { get; set; }

        /// <summary>
        /// Session bitiş zamanı
        /// </summary>
        public DateTime? EndTime { get; set; }

        /// <summary>
        /// Son duraklama zamanı
        /// </summary>
        public DateTime? LastPauseTime { get; set; }

        /// <summary>
        /// Toplam duraklama süresi (dakika)
        /// </summary>
        [Range(0, 60)]
        public int TotalPauseMinutes { get; set; }

        /// <summary>
        /// Session sırası (1, 2, 3, 4...)
        /// </summary>
        [Required]
        [Range(1, 100)]
        public int SessionNumber { get; set; }

        /// <summary>
        /// Bu session'dan önceki session sayısı
        /// </summary>
        [Range(0, 100)]
        public int SessionsCompleted { get; set; }

        /// <summary>
        /// Session tamamlandı mı?
        /// </summary>
        public bool IsCompleted { get; set; }

        /// <summary>
        /// Session iptal edildi mi?
        /// </summary>
        public bool IsCancelled { get; set; }

        /// <summary>
        /// Session notları
        /// </summary>
        [MaxLength(1000)]
        public string? Notes { get; set; }

        /// <summary>
        /// Session oluşturulma zamanı
        /// </summary>
        [Required]
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Session güncellenme zamanı
        /// </summary>
        [Required]
        public DateTime UpdatedAt { get; set; }

        /// <summary>
        /// Session aktif mi?
        /// </summary>
        public bool IsActive { get; set; } = true;

        // ===== RELATIONSHIPS =====

        /// <summary>
        /// Session'ı oluşturan kullanıcı
        /// </summary>
        [Required]
        public int UserId { get; set; }
        public virtual User? User { get; set; }

        /// <summary>
        /// Session ile ilişkili görev (opsiyonel)
        /// </summary>
        public int? TaskId { get; set; }
        public virtual TodoTask? Task { get; set; }

        /// <summary>
        /// Session ile ilişkili kategori (opsiyonel)
        /// </summary>
        public int? CategoryId { get; set; }
        public virtual Category? Category { get; set; }

        // ===== COMPUTED PROPERTIES =====

        /// <summary>
        /// Session'ın toplam süresi (dakika)
        /// </summary>
        [NotMapped]
        public int TotalDurationMinutes => ActualDurationMinutes ?? PlannedDurationMinutes;

        /// <summary>
        /// Session'ın kalan süresi (dakika)
        /// </summary>
        [NotMapped]
        public int RemainingMinutes
        {
            get
            {
                if (State == PomodoroSessionState.Completed || State == PomodoroSessionState.Cancelled)
                    return 0;

                var elapsed = DateTime.UtcNow - StartTime;
                var remaining = PlannedDurationMinutes - (int)elapsed.TotalMinutes;
                return Math.Max(0, remaining);
            }
        }

        /// <summary>
        /// Session'ın tamamlanma yüzdesi
        /// </summary>
        [NotMapped]
        public int CompletionPercentage
        {
            get
            {
                if (State == PomodoroSessionState.Completed)
                    return 100;

                if (State == PomodoroSessionState.Cancelled)
                    return 0;

                var elapsed = DateTime.UtcNow - StartTime;
                var percentage = (int)((elapsed.TotalMinutes / PlannedDurationMinutes) * 100);
                return Math.Min(100, Math.Max(0, percentage));
            }
        }

        /// <summary>
        /// Session'ın aktif olup olmadığı
        /// </summary>
        [NotMapped]
        public bool IsActiveSession => State == PomodoroSessionState.Working || 
                                     State == PomodoroSessionState.ShortBreak || 
                                     State == PomodoroSessionState.LongBreak;

        /// <summary>
        /// Session'ın duraklatılıp duraklatılmadığı
        /// </summary>
        [NotMapped]
        public bool IsPaused => State == PomodoroSessionState.Paused;

        /// <summary>
        /// Session'ın tamamlanıp tamamlanmadığı
        /// </summary>
        [NotMapped]
        public bool IsFinished => State == PomodoroSessionState.Completed || 
                                 State == PomodoroSessionState.Cancelled;
    }
} 