namespace TaskFlow.API.DTOs
{
    /// <summary>
    /// Görev şablonu DTO
    /// </summary>
    public class TaskTemplateDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Priority { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? Tags { get; set; }
        public string? Notes { get; set; }
        public int EstimatedHours { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int UsageCount { get; set; } = 0;
    }

    /// <summary>
    /// Görev şablonu oluşturma DTO
    /// </summary>
    public class CreateTaskTemplateDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Priority { get; set; } = 1;
        public int? CategoryId { get; set; }
        public string? Tags { get; set; }
        public string? Notes { get; set; }
        public int EstimatedHours { get; set; } = 1;
    }

    /// <summary>
    /// Görev şablonu güncelleme DTO
    /// </summary>
    public class UpdateTaskTemplateDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? Priority { get; set; }
        public int? CategoryId { get; set; }
        public string? Tags { get; set; }
        public string? Notes { get; set; }
        public int? EstimatedHours { get; set; }
        public bool? IsActive { get; set; }
    }

    /// <summary>
    /// Görev şablonu filtreleme DTO
    /// </summary>
    public class TaskTemplateFilterDto
    {
        public string? SearchText { get; set; }
        public int? CategoryId { get; set; }
        public int? Priority { get; set; }
        public bool? IsActive { get; set; }
        public string? SortBy { get; set; }
        public bool? SortAscending { get; set; }
        public int? Page { get; set; }
        public int? PageSize { get; set; }
    }

    /// <summary>
    /// Şablondan görev oluşturma DTO
    /// </summary>
    public class CreateTaskFromTemplateDto
    {
        public int TemplateId { get; set; }
        public string? CustomTitle { get; set; }
        public string? CustomDescription { get; set; }
        public int? CustomPriority { get; set; }
        public int? CustomCategoryId { get; set; }
        public DateTime? DueDate { get; set; }
    }
} 