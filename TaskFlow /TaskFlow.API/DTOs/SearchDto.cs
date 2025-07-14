using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    public class TaskSearchRequest
    {
        [SwaggerSchema("Aranacak anahtar kelime")]
        public string? Query { get; set; }

        [SwaggerSchema("Öncelik filtresi")]
        public string? Priority { get; set; }

        [SwaggerSchema("Tamamlanma durumu filtresi")]
        public bool? IsCompleted { get; set; }

        [SwaggerSchema("Kategori ID filtresi")]
        public int? CategoryId { get; set; }

        [SwaggerSchema("Başlangıç tarihi filtresi")]
        public DateTime? StartDate { get; set; }

        [SwaggerSchema("Bitiş tarihi filtresi")]
        public DateTime? EndDate { get; set; }

        [SwaggerSchema("Bitiş tarihi aralığı başlangıcı")]
        public DateTime? DueDateStart { get; set; }

        [SwaggerSchema("Bitiş tarihi aralığı bitişi")]
        public DateTime? DueDateEnd { get; set; }

        [SwaggerSchema("Sıralama alanı (örn: title, priority, duedate, createdat)")]
        public string? SortBy { get; set; }

        [SwaggerSchema("Sıralama yönü (asc/desc)")]
        public string? SortOrder { get; set; }

        [SwaggerSchema("Sayfa numarası")]
        public int Page { get; set; } = 1;

        [SwaggerSchema("Sayfa boyutu")]
        public int PageSize { get; set; } = 20;
    }

    public class GlobalSearchRequest
    {
        [SwaggerSchema("Aranacak anahtar kelime")]
        public string Query { get; set; } = string.Empty;

        [SwaggerSchema("Kullanıcılar da dahil edilsin mi?")]
        public bool? IncludeUsers { get; set; }

        [SwaggerSchema("Maksimum sonuç sayısı")]
        public int MaxResults { get; set; } = 20;
    }
} 