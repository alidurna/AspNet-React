using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    public class UserStatsDto
    {
        [SwaggerSchema("Toplam görev sayısı", Example = 42)]
        public int TotalTasks { get; set; }

        [SwaggerSchema("Tamamlanan görev sayısı", Example = 30)]
        public int CompletedTasks { get; set; }

        [SwaggerSchema("Bekleyen görev sayısı", Example = 10)]
        public int PendingTasks { get; set; }

        [SwaggerSchema("Devam eden görev sayısı", Example = 2)]
        public int InProgressTasks { get; set; }

        [SwaggerSchema("Tamamlanma oranı (%)", Example = 71.4)]
        public double TaskCompletionRate { get; set; }

        [SwaggerSchema("Ortalama tamamlanma süresi (gün)", Example = 3.5)]
        public double AverageCompletionDays { get; set; }

        [SwaggerSchema("Bu ay tamamlanan görev sayısı", Example = 8)]
        public int TasksCompletedThisMonth { get; set; }

        [SwaggerSchema("Bu hafta tamamlanan görev sayısı", Example = 3)]
        public int TasksCompletedThisWeek { get; set; }
    }
} 