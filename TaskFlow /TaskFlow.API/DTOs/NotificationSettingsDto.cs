namespace TaskFlow.API.DTOs
{
    /// <summary>
    /// Notification ayarları DTO'su
    /// </summary>
    public class NotificationSettingsDto
    {
        /// <summary>
        /// Email notification'ları açık mı?
        /// </summary>
        public bool EmailEnabled { get; set; } = false;

        /// <summary>
        /// SMS notification'ları açık mı?
        /// </summary>
        public bool SmsEnabled { get; set; } = false;

        /// <summary>
        /// Push notification'ları açık mı?
        /// </summary>
        public bool PushEnabled { get; set; } = false;

        /// <summary>
        /// Ses bildirimleri açık mı?
        /// </summary>
        public bool SoundEnabled { get; set; } = true;

        /// <summary>
        /// Email adresi
        /// </summary>
        public string? EmailAddress { get; set; }

        /// <summary>
        /// Telefon numarası
        /// </summary>
        public string? PhoneNumber { get; set; }

        /// <summary>
        /// Push notification token'ı
        /// </summary>
        public string? PushToken { get; set; }

        /// <summary>
        /// Session tamamlandığında bildirim gönder
        /// </summary>
        public bool NotifyOnSessionComplete { get; set; } = true;

        /// <summary>
        /// Session duraklatıldığında bildirim gönder
        /// </summary>
        public bool NotifyOnSessionPause { get; set; } = false;

        /// <summary>
        /// Günlük özet bildirimi gönder
        /// </summary>
        public bool NotifyDailySummary { get; set; } = false;

        /// <summary>
        /// Haftalık özet bildirimi gönder
        /// </summary>
        public bool NotifyWeeklySummary { get; set; } = false;

        /// <summary>
        /// Bildirim zamanı (saat)
        /// </summary>
        public int NotificationTime { get; set; } = 9; // Varsayılan: 09:00

        /// <summary>
        /// Bildirim zamanı (dakika)
        /// </summary>
        public int NotificationMinute { get; set; } = 0;

        /// <summary>
        /// Zaman dilimi
        /// </summary>
        public string TimeZone { get; set; } = "Europe/Istanbul";
    }
}
