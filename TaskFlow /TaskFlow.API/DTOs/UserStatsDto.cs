namespace TaskFlow.API.DTOs
{
    public class UserStatsDto
    {
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int PendingTasks { get; set; }
        public int InProgressTasks { get; set; }
        public double TaskCompletionRate { get; set; }
        public double AverageCompletionDays { get; set; }
        public int TasksCompletedThisMonth { get; set; }
        public int TasksCompletedThisWeek { get; set; }
    }
} 