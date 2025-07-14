/*
 * SearchDto.cs - Arama İşlemleri İçin DTO Modelleri
 * ================================================
 * Bu dosya TaskFlow uygulamasının gelişmiş arama özelliklerinde kullanılan
 * tüm Data Transfer Object (DTO) sınıflarını içerir.
 * 
 * İçerik:
 * - Arama istekleri (Request DTOs)
 * - Arama sonuçları (Response DTOs)  
 * - Arama önerileri (Suggestion DTOs)
 */

using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace TaskFlow.API.DTOs
{
    public class TaskSearchRequest
    {
        [SwaggerSchema("Aranacak anahtar kelime", Example = "sunum")]
        public string? Query { get; set; }

        [SwaggerSchema("Öncelik filtresi", Example = "High")]
        public string? Priority { get; set; }

        [SwaggerSchema("Tamamlanma durumu filtresi", Example = false)]
        public bool? IsCompleted { get; set; }

        [SwaggerSchema("Kategori ID filtresi", Example = 2)]
        public int? CategoryId { get; set; }

        [SwaggerSchema("Başlangıç tarihi filtresi", Example = "2024-07-01T00:00:00Z")]
        public DateTime? StartDate { get; set; }

        [SwaggerSchema("Bitiş tarihi filtresi", Example = "2024-07-31T23:59:59Z")]
        public DateTime? EndDate { get; set; }

        [SwaggerSchema("Sayfa numarası", Example = 1)]
        public int? Page { get; set; }

        [SwaggerSchema("Sayfa boyutu", Example = 20)]
        public int? PageSize { get; set; }
    }

    public class GlobalSearchRequest
    {
        [SwaggerSchema("Aranacak anahtar kelime", Example = "proje")]
        public string Query { get; set; } = string.Empty;

        [SwaggerSchema("Kullanıcılar da dahil edilsin mi?", Example = true)]
        public bool? IncludeUsers { get; set; }
    }
} 