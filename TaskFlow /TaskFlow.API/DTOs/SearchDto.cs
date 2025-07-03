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

using TaskFlow.API.Models;

namespace TaskFlow.API.DTOs;

/// <summary>
/// Genel arama isteği - Tüm varlıklarda (task, kategori, kullanıcı) arama için
/// </summary>
public class GlobalSearchRequest
{
    /// <summary>
    /// Arama terimi - Kullanıcının girdiği anahtar kelime
    /// </summary>
    public string Query { get; set; } = string.Empty;

    /// <summary>
    /// Maksimum sonuç sayısı - Her varlık türü için döndürülecek maksimum kayıt sayısı
    /// </summary>
    public int MaxResults { get; set; } = 10;

    /// <summary>
    /// Kullanıcı arama dahil mi - Diğer kullanıcıları da arama sonuçlarına dahil etmek için
    /// </summary>
    public bool IncludeUsers { get; set; } = false;

    /// <summary>
    /// Arama filtresi - Sadece belirli türdeki sonuçları getirmek için
    /// </summary>
    public SearchFilter? Filter { get; set; }
}

/// <summary>
/// Görev arama isteği - Görevlerde detaylı filtreleme ile arama için
/// </summary>
public class TaskSearchRequest
{
    /// <summary>
    /// Arama terimi - Başlık, açıklama veya kategori adında aranacak kelime
    /// </summary>
    public string? Query { get; set; }

    /// <summary>
    /// Öncelik filtresi - Belirli öncelik seviyesindeki görevleri filtrelemek için
    /// </summary>
    public Priority? Priority { get; set; }

    /// <summary>
    /// Tamamlanma durumu filtresi - Tamamlanan/tamamlanmayan görevleri filtrelemek için
    /// </summary>
    public bool? IsCompleted { get; set; }

    /// <summary>
    /// Kategori ID filtresi - Belirli kategorideki görevleri getirmek için
    /// </summary>
    public int? CategoryId { get; set; }

    /// <summary>
    /// Başlangıç tarihi - Bu tarihten sonra oluşturulan görevleri filtrelemek için
    /// </summary>
    public DateTime? StartDate { get; set; }

    /// <summary>
    /// Bitiş tarihi - Bu tarihten önce oluşturulan görevleri filtrelemek için
    /// </summary>
    public DateTime? EndDate { get; set; }

    /// <summary>
    /// Teslim tarihi başlangıç - Bu tarihten sonra teslim edilecek görevler için
    /// </summary>
    public DateTime? DueDateStart { get; set; }

    /// <summary>
    /// Teslim tarihi bitiş - Bu tarihten önce teslim edilecek görevler için
    /// </summary>
    public DateTime? DueDateEnd { get; set; }

    /// <summary>
    /// Sıralama alanı - Sonuçların hangi alana göre sıralanacağı
    /// Seçenekler: "title", "priority", "duedate", "createdat"
    /// </summary>
    public string? SortBy { get; set; } = "createdat";

    /// <summary>
    /// Sıralama yönü - Artan (asc) veya azalan (desc) sıralama
    /// </summary>
    public string SortOrder { get; set; } = "desc";

    /// <summary>
    /// Sayfa numarası - Sayfalama için hangi sayfa getirileceği (1'den başlar)
    /// </summary>
    public int Page { get; set; } = 1;

    /// <summary>
    /// Sayfa boyutu - Her sayfada kaç kayıt gösterileceği
    /// </summary>
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// Genel arama sonucu - Tüm varlık türlerindeki arama sonuçlarını içeren model
/// </summary>
public class GlobalSearchResponse
{
    /// <summary>
    /// Arama terimi - Kullanıcının aradığı kelime
    /// </summary>
    public string Query { get; set; } = string.Empty;

    /// <summary>
    /// Toplam sonuç sayısı - Tüm varlık türlerinden gelen toplam kayıt sayısı
    /// </summary>
    public int TotalResults { get; set; }

    /// <summary>
    /// Görev sonuçları - Arama kriterlerine uyan görevlerin listesi
    /// </summary>
    public List<TaskSearchResult> Tasks { get; set; } = new();

    /// <summary>
    /// Kategori sonuçları - Arama kriterlerine uyan kategorilerin listesi
    /// </summary>
    public List<CategorySearchResult> Categories { get; set; } = new();

    /// <summary>
    /// Kullanıcı sonuçları - Arama kriterlerine uyan kullanıcıların listesi
    /// </summary>
    public List<UserSearchResult> Users { get; set; } = new();

    /// <summary>
    /// Arama zamanı - Aramanın yapıldığı zaman damgası
    /// </summary>
    public DateTime SearchTime { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Görev arama sonucu - Görev araması için sayfalama bilgileri içeren model
/// </summary>
public class TaskSearchResponse
{
    /// <summary>
    /// Arama terimi - Kullanıcının aradığı kelime
    /// </summary>
    public string? Query { get; set; }

    /// <summary>
    /// Görev listesi - Arama kriterlerine uyan görevlerin detaylı bilgileri
    /// </summary>
    public List<TaskSearchResult> Tasks { get; set; } = new();

    /// <summary>
    /// Toplam kayıt sayısı - Filtreleme sonucu toplam görev sayısı
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Mevcut sayfa - Kullanıcının görüntülediği sayfa numarası
    /// </summary>
    public int Page { get; set; }

    /// <summary>
    /// Sayfa boyutu - Her sayfada gösterilen kayıt sayısı
    /// </summary>
    public int PageSize { get; set; }

    /// <summary>
    /// Toplam sayfa sayısı - Tüm sonuçları göstermek için gereken sayfa sayısı
    /// </summary>
    public int TotalPages { get; set; }

    /// <summary>
    /// Sonraki sayfa var mı - Bir sonraki sayfanın olup olmadığı bilgisi
    /// </summary>
    public bool HasNextPage { get; set; }

    /// <summary>
    /// Önceki sayfa var mı - Bir önceki sayfanın olup olmadığı bilgisi
    /// </summary>
    public bool HasPrevPage { get; set; }
}

/// <summary>
/// Görev arama sonuç öğesi - Arama sonucunda dönen görev bilgileri
/// </summary>
public class TaskSearchResult
{
    /// <summary>
    /// Görev ID - Görevin benzersiz kimlik numarası
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Görev başlığı - Görevin kısa açıklayıcı başlığı
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Görev açıklaması - Görevin detaylı açıklaması
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Öncelik seviyesi - Görevin önem derecesi (Low, Medium, High, Critical)
    /// </summary>
    public Priority Priority { get; set; }

    /// <summary>
    /// Tamamlanma durumu - Görevin tamamlanıp tamamlanmadığı
    /// </summary>
    public bool IsCompleted { get; set; }

    /// <summary>
    /// Teslim tarihi - Görevin teslim edilmesi gereken tarih
    /// </summary>
    public DateTime? DueDate { get; set; }

    /// <summary>
    /// Oluşturulma tarihi - Görevin oluşturulduğu tarih ve saat
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Güncellenme tarihi - Görevin son güncellendiği tarih ve saat
    /// </summary>
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Kategori adı - Görevin ait olduğu kategorinin adı
    /// </summary>
    public string CategoryName { get; set; } = string.Empty;

    /// <summary>
    /// Kategori rengi - Görevin kategorisinin görsel renk kodu
    /// </summary>
    public string CategoryColor { get; set; } = string.Empty;
}

/// <summary>
/// Kategori arama sonuç öğesi - Arama sonucunda dönen kategori bilgileri
/// </summary>
public class CategorySearchResult
{
    /// <summary>
    /// Kategori ID - Kategorinin benzersiz kimlik numarası
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Kategori adı - Kategorinin görünen adı
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Kategori açıklaması - Kategorinin detaylı açıklaması
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Kategori rengi - Kategorinin görsel renk kodu (hex format)
    /// </summary>
    public string Color { get; set; } = string.Empty;

    /// <summary>
    /// Oluşturulma tarihi - Kategorinin oluşturulduğu tarih ve saat
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Görev sayısı - Bu kategoriye ait toplam görev sayısı
    /// </summary>
    public int TaskCount { get; set; }
}

/// <summary>
/// Kullanıcı arama sonuç öğesi - Arama sonucunda dönen kullanıcı bilgileri
/// </summary>
public class UserSearchResult
{
    /// <summary>
    /// Kullanıcı ID - Kullanıcının benzersiz kimlik numarası
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Ad - Kullanıcının adı
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Soyad - Kullanıcının soyadı
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// E-posta adresi - Kullanıcının e-posta adresi
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Profil resmi URL - Kullanıcının profil resmi yolu
    /// </summary>
    public string? ProfileImageUrl { get; set; }

    /// <summary>
    /// Tam ad - Ad ve soyadın birleşimi
    /// </summary>
    public string FullName => $"{FirstName} {LastName}".Trim();
}

/// <summary>
/// Arama önerileri yanıtı - Otomatik tamamlama için arama önerileri
/// </summary>
public class SearchSuggestionsResponse
{
    /// <summary>
    /// Öneriler listesi - Kullanıcının yazdığı metne uygun arama önerileri
    /// </summary>
    public List<string> Suggestions { get; set; } = new();

    /// <summary>
    /// Öneri sayısı - Döndürülen öneri sayısı
    /// </summary>
    public int Count => Suggestions.Count;
}

/// <summary>
/// Arama filtresi - Arama sonuçlarını filtrelemek için kullanılan enum
/// </summary>
public enum SearchFilter
{
    /// <summary>
    /// Hepsi - Tüm varlık türlerinde arama yap
    /// </summary>
    All = 0,

    /// <summary>
    /// Sadece görevler - Yalnızca görevlerde arama yap
    /// </summary>
    TasksOnly = 1,

    /// <summary>
    /// Sadece kategoriler - Yalnızca kategorilerde arama yap
    /// </summary>
    CategoriesOnly = 2,

    /// <summary>
    /// Sadece kullanıcılar - Yalnızca kullanıcılarda arama yap
    /// </summary>
    UsersOnly = 3
}

/// <summary>
/// Arama istatistikleri - Arama performansı ve sonuç istatistikleri
/// </summary>
public class SearchStatistics
{
    /// <summary>
    /// Arama süresi - Aramanın tamamlanma süresi (milisaniye)
    /// </summary>
    public long SearchDurationMs { get; set; }

    /// <summary>
    /// Önbellekten mi - Sonuçların önbellekten gelip gelmediği
    /// </summary>
    public bool FromCache { get; set; }

    /// <summary>
    /// Veritabanı sorgu sayısı - Yapılan veritabanı sorgu sayısı
    /// </summary>
    public int DatabaseQueries { get; set; }

    /// <summary>
    /// Toplam sonuç sayısı - Tüm varlık türlerinden gelen sonuç sayısı
    /// </summary>
    public int TotalResults { get; set; }
} 