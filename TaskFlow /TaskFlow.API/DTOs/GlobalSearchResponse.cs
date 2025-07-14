using System;
using System.Collections.Generic;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    public class GlobalSearchResponse
    {
        [SwaggerSchema("Arama terimi")]
        public string Query { get; set; } = string.Empty;

        [SwaggerSchema("Toplam sonuç sayısı")]
        public int TotalResults { get; set; }

        [SwaggerSchema("Görev arama sonuçları")]
        public List<TaskSearchResult> Tasks { get; set; } = new();

        [SwaggerSchema("Kategori arama sonuçları")]
        public List<CategorySearchResult> Categories { get; set; } = new();

        [SwaggerSchema("Kullanıcı arama sonuçları")]
        public List<UserSearchResult> Users { get; set; } = new();

        [SwaggerSchema("Arama zamanı (UTC)")]
        public DateTime SearchTime { get; set; }
    }
} 