using System;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    /// <summary>
    /// Task arama sonucu DTO'su
    /// </summary>
    public class TaskSearchResult
    {
        
        public int Id { get; set; }

        [SwaggerSchema("Task başlığı")]
        public string Title { get; set; } = string.Empty;

        [SwaggerSchema("Task açıklaması")]
        public string? Description { get; set; }

        [SwaggerSchema("Öncelik")]
        public string Priority { get; set; } = string.Empty;

        
        public bool IsCompleted { get; set; }

        [SwaggerSchema("Bitiş tarihi")]
        public DateTime? DueDate { get; set; }

        [SwaggerSchema("Oluşturulma tarihi")]
        public DateTime CreatedAt { get; set; }

        [SwaggerSchema("Güncellenme tarihi")]
        public DateTime? UpdatedAt { get; set; }

        [SwaggerSchema("Kategori adı")]
        public string? CategoryName { get; set; }

        [SwaggerSchema("Kategori rengi")]
        public string? CategoryColor { get; set; }
    }
} 