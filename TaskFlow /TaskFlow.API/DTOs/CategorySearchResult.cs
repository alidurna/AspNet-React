using System;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    /// <summary>
    /// Kategori arama sonucu DTO'su
    /// </summary>
    public class CategorySearchResult
    {
        
        public int Id { get; set; }

        [SwaggerSchema("Kategori adı")]
        public string Name { get; set; } = string.Empty;

        [SwaggerSchema("Kategori açıklaması")]
        public string? Description { get; set; }

        [SwaggerSchema("Kategori rengi")]
        public string? Color { get; set; }

        [SwaggerSchema("Oluşturulma tarihi")]
        public DateTime CreatedAt { get; set; }

        
        public int TaskCount { get; set; }
    }
} 