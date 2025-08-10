// ****************************************************************************************************
//  POMODORODTO.CS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının Pomodoro zaman yönetimi sistemi için DTO'ları içerir.
//  API request/response modellerini ve data transfer object'lerini tanımlar.
//
//  ANA BAŞLIKLAR:
//  - Create/Update DTOs (Oluşturma/Güncelleme)
//  - Response DTOs (Yanıt modelleri)
//  - Filter DTOs (Filtreleme)
//  - Statistics DTOs (İstatistikler)
//  - Real-time DTOs (Gerçek zamanlı)
//
//  DTO TİPLERİ:
//  - CreatePomodoroSessionDto: Yeni session oluşturma
//  - UpdatePomodoroSessionDto: Session güncelleme
//  - PomodoroSessionDto: Session yanıt modeli
//  - PomodoroStatisticsDto: İstatistik yanıt modeli
//  - PomodoroFilterDto: Filtreleme parametreleri
//  - PomodoroTimerDto: Timer durumu
//
//  VALIDATION:
//  - Required field validation
//  - Range validation
//  - Business rule validation
//  - Time validation
//
//  MAPPING:
//  - Entity ↔ DTO dönüşümleri
//  - AutoMapper profiles
//  - Custom mapping logic
//
//  PERFORMANS:
//  - Efficient serialization
//  - Minimal data transfer
//  - Caching support
//  - Real-time updates
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Clear DTO structure
//  - Comprehensive documentation
//  - Type safety
//  - Backward compatibility
// ****************************************************************************************************

using TaskFlow.API.Models;

namespace TaskFlow.API.DTOs
{
    /// <summary>
    /// Yeni Pomodoro session oluşturma DTO'su
    /// </summary>
    public class CreatePomodoroSessionDto
    {
        /// <summary>
        /// Session başlığı
        /// </summary>
        public required string Title { get; set; }

        /// <summary>
        /// Session açıklaması
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Session tipi
        /// </summary>
        public PomodoroSessionType SessionType { get; set; } = PomodoroSessionType.Work;

        /// <summary>
        /// Planlanan süre (dakika)
        /// </summary>
        public int PlannedDurationMinutes { get; set; } = 25;

        /// <summary>
        /// İlişkili görev ID'si (opsiyonel)
        /// </summary>
        public int? TaskId { get; set; }

        /// <summary>
        /// İlişkili kategori ID'si (opsiyonel)
        /// </summary>
        public int? CategoryId { get; set; }

        /// <summary>
        /// Session notları
        /// </summary>
        public string? Notes { get; set; }
    }

    /// <summary>
    /// Pomodoro session güncelleme DTO'su
    /// </summary>
    public class UpdatePomodoroSessionDto
    {
        /// <summary>
        /// Session başlığı
        /// </summary>
        public string? Title { get; set; }

        /// <summary>
        /// Session açıklaması
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Session durumu
        /// </summary>
        public PomodoroSessionState? State { get; set; }

        /// <summary>
        /// Gerçek süre (dakika)
        /// </summary>
        public int? ActualDurationMinutes { get; set; }

        /// <summary>
        /// Session notları
        /// </summary>
        public string? Notes { get; set; }
    }

    /// <summary>
    /// Pomodoro session yanıt DTO'su
    /// </summary>
    public class PomodoroSessionDto
    {
        /// <summary>
        /// Session ID'si
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Session başlığı
        /// </summary>
        public required string Title { get; set; }

        /// <summary>
        /// Session açıklaması
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Session tipi
        /// </summary>
        public PomodoroSessionType SessionType { get; set; }

        /// <summary>
        /// Session durumu
        /// </summary>
        public PomodoroSessionState State { get; set; }

        /// <summary>
        /// Planlanan süre (dakika)
        /// </summary>
        public int PlannedDurationMinutes { get; set; }

        /// <summary>
        /// Gerçek süre (dakika)
        /// </summary>
        public int? ActualDurationMinutes { get; set; }

        /// <summary>
        /// Session başlangıç zamanı
        /// </summary>
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
        public int TotalPauseMinutes { get; set; }

        /// <summary>
        /// Session sırası
        /// </summary>
        public int SessionNumber { get; set; }

        /// <summary>
        /// Tamamlanan session sayısı
        /// </summary>
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
        public string? Notes { get; set; }

        /// <summary>
        /// Session oluşturulma zamanı
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Session güncellenme zamanı
        /// </summary>
        public DateTime UpdatedAt { get; set; }

        /// <summary>
        /// Session aktif mi?
        /// </summary>
        public bool IsActive { get; set; }

        // ===== COMPUTED PROPERTIES =====

        /// <summary>
        /// Session'ın toplam süresi (dakika)
        /// </summary>
        public int TotalDurationMinutes { get; set; }

        /// <summary>
        /// Session'ın kalan süresi (dakika)
        /// </summary>
        public int RemainingMinutes { get; set; }

        /// <summary>
        /// Session'ın tamamlanma yüzdesi
        /// </summary>
        public int CompletionPercentage { get; set; }

        /// <summary>
        /// Session'ın aktif olup olmadığı
        /// </summary>
        public bool IsActiveSession { get; set; }

        /// <summary>
        /// Session'ın duraklatılıp duraklatılmadığı
        /// </summary>
        public bool IsPaused { get; set; }

        /// <summary>
        /// Session'ın tamamlanıp tamamlanmadığı
        /// </summary>
        public bool IsFinished { get; set; }

        // ===== RELATIONSHIPS =====

        /// <summary>
        /// Kullanıcı bilgisi
        /// </summary>
        public UserDto? User { get; set; }

        /// <summary>
        /// İlişkili görev bilgisi
        /// </summary>
        public TodoTaskDto? Task { get; set; }

        /// <summary>
        /// İlişkili kategori bilgisi
        /// </summary>
        public CategoryDto? Category { get; set; }
    }

    /// <summary>
    /// Pomodoro timer durumu DTO'su
    /// </summary>
    public class PomodoroTimerDto
    {
        /// <summary>
        /// Aktif session ID'si
        /// </summary>
        public int? ActiveSessionId { get; set; }

        /// <summary>
        /// Timer durumu
        /// </summary>
        public PomodoroSessionState State { get; set; }

        /// <summary>
        /// Kalan süre (saniye)
        /// </summary>
        public int RemainingSeconds { get; set; }

        /// <summary>
        /// Toplam süre (saniye)
        /// </summary>
        public int TotalSeconds { get; set; }

        /// <summary>
        /// Tamamlanma yüzdesi
        /// </summary>
        public int CompletionPercentage { get; set; }

        /// <summary>
        /// Session tipi
        /// </summary>
        public PomodoroSessionType SessionType { get; set; }

        /// <summary>
        /// Session başlığı
        /// </summary>
        public string? SessionTitle { get; set; }

        /// <summary>
        /// Timer aktif mi?
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// Timer duraklatıldı mı?
        /// </summary>
        public bool IsPaused { get; set; }

        /// <summary>
        /// Sonraki session tipi
        /// </summary>
        public PomodoroSessionType? NextSessionType { get; set; }
    }

    /// <summary>
    /// Pomodoro istatistikleri DTO'su
    /// </summary>
    public class PomodoroStatisticsDto
    {
        /// <summary>
        /// Toplam session sayısı
        /// </summary>
        public int TotalSessions { get; set; }

        /// <summary>
        /// Tamamlanan session sayısı
        /// </summary>
        public int CompletedSessions { get; set; }

        /// <summary>
        /// İptal edilen session sayısı
        /// </summary>
        public int CancelledSessions { get; set; }

        /// <summary>
        /// Toplam çalışma süresi (dakika)
        /// </summary>
        public int TotalWorkMinutes { get; set; }

        /// <summary>
        /// Toplam mola süresi (dakika)
        /// </summary>
        public int TotalBreakMinutes { get; set; }

        /// <summary>
        /// Ortalama session süresi (dakika)
        /// </summary>
        public double AverageSessionMinutes { get; set; }

        /// <summary>
        /// Bugünkü session sayısı
        /// </summary>
        public int TodaySessions { get; set; }

        /// <summary>
        /// Bu haftaki session sayısı
        /// </summary>
        public int ThisWeekSessions { get; set; }

        /// <summary>
        /// Bu ayki session sayısı
        /// </summary>
        public int ThisMonthSessions { get; set; }

        /// <summary>
        /// En uzun session süresi (dakika)
        /// </summary>
        public int LongestSessionMinutes { get; set; }

        /// <summary>
        /// En kısa session süresi (dakika)
        /// </summary>
        public int ShortestSessionMinutes { get; set; }

        /// <summary>
        /// Başarı oranı (%)
        /// </summary>
        public double SuccessRate { get; set; }
    }

    /// <summary>
    /// Pomodoro filtreleme DTO'su
    /// </summary>
    public class PomodoroFilterDto
    {
        /// <summary>
        /// Sayfa numarası
        /// </summary>
        public int Page { get; set; } = 1;

        /// <summary>
        /// Sayfa boyutu
        /// </summary>
        public int PageSize { get; set; } = 20;

        /// <summary>
        /// Session tipi filtresi
        /// </summary>
        public PomodoroSessionType? SessionType { get; set; }

        /// <summary>
        /// Session durumu filtresi
        /// </summary>
        public PomodoroSessionState? State { get; set; }

        /// <summary>
        /// Başlangıç tarihi
        /// </summary>
        public DateTime? StartDate { get; set; }

        /// <summary>
        /// Bitiş tarihi
        /// </summary>
        public DateTime? EndDate { get; set; }

        /// <summary>
        /// Görev ID filtresi
        /// </summary>
        public int? TaskId { get; set; }

        /// <summary>
        /// Kategori ID filtresi
        /// </summary>
        public int? CategoryId { get; set; }

        /// <summary>
        /// Sıralama alanı
        /// </summary>
        public string SortBy { get; set; } = "createdAt";

        /// <summary>
        /// Artan sıralama
        /// </summary>
        public bool SortAscending { get; set; } = false;
    }

    /// <summary>
    /// Pomodoro session listesi yanıt DTO'su
    /// </summary>
    public class PomodoroSessionListDto
    {
        /// <summary>
        /// Session listesi
        /// </summary>
        public required List<PomodoroSessionDto> Sessions { get; set; }

        /// <summary>
        /// Toplam sayı
        /// </summary>
        public int TotalCount { get; set; }

        /// <summary>
        /// Sayfa numarası
        /// </summary>
        public int Page { get; set; }

        /// <summary>
        /// Sayfa boyutu
        /// </summary>
        public int PageSize { get; set; }

        /// <summary>
        /// Toplam sayfa sayısı
        /// </summary>
        public int TotalPages { get; set; }

        /// <summary>
        /// Sonraki sayfa var mı?
        /// </summary>
        public bool HasNextPage { get; set; }

        /// <summary>
        /// Önceki sayfa var mı?
        /// </summary>
        public bool HasPreviousPage { get; set; }
    }
} 