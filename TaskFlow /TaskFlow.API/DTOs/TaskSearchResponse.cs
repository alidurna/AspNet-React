using System.Collections.Generic;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    public class TaskSearchResponse
    {
        [SwaggerSchema("Arama terimi")]
        public string? Query { get; set; }

        [SwaggerSchema("Görevler listesi")]
        public List<TaskSearchResult> Tasks { get; set; } = new();

        [SwaggerSchema("Toplam görev sayısı")]
        public int TotalCount { get; set; }

        [SwaggerSchema("Sayfa numarası")]
        public int? Page { get; set; }

        [SwaggerSchema("Sayfa boyutu")]
        public int? PageSize { get; set; }

        [SwaggerSchema("Toplam sayfa sayısı")]
        public int? TotalPages { get; set; }

        [SwaggerSchema("Sonraki sayfa var mı?")]
        public bool HasNextPage { get; set; }

        [SwaggerSchema("Önceki sayfa var mı?")]
        public bool HasPrevPage { get; set; }
    }
} 