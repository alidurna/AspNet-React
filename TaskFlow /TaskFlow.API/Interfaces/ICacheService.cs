namespace TaskFlow.API.Interfaces;

/// <summary>
/// Cache servisi için genel arayüz - önbellek verilerini yönetir
/// Hem memory cache hem de distributed cache senaryolarını destekler
/// </summary>
public interface ICacheService
{
    /// <summary>
    /// Anahtar ile önbellekten veri getirir
    /// </summary>
    /// <typeparam name="T">Önbellekteki verinin tipi</typeparam>
    /// <param name="key">Cache anahtarı</param>
    /// <returns>Önbellekteki veri veya bulunamazsa null</returns>
    Task<T?> GetAsync<T>(string key) where T : class;
    
    /// <summary>
    /// Anahtar ile önbellekten veri getirir, yoksa factory ile oluşturur
    /// Cache-aside pattern implementasyonu
    /// </summary>
    /// <typeparam name="T">Önbellekteki verinin tipi</typeparam>
    /// <param name="key">Cache anahtarı</param>
    /// <param name="factory">Veri yoksa oluşturmak için kullanılacak method</param>
    /// <param name="expiration">Cache sona erme süresi (varsayılan: 30 dakika)</param>
    /// <returns>Önbellekteki veya yeni oluşturulan veri</returns>
    Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null) where T : class;
    
    /// <summary>
    /// Veriyi belirtilen süre ile önbelleğe ekler
    /// </summary>
    /// <typeparam name="T">Önbelleğe eklenecek verinin tipi</typeparam>
    /// <param name="key">Cache anahtarı</param>
    /// <param name="data">Önbelleğe eklenecek veri</param>
    /// <param name="expiration">Cache sona erme süresi (varsayılan: 30 dakika)</param>
    Task SetAsync<T>(string key, T data, TimeSpan? expiration = null) where T : class;
    
    /// <summary>
    /// Anahtar ile önbellekten veriyi siler
    /// </summary>
    /// <param name="key">Silinecek cache anahtarı</param>
    Task RemoveAsync(string key);
    
    /// <summary>
    /// Pattern'e uyan birden fazla cache kaydını siler
    /// Örnek: "users:*" tüm user cache'lerini siler
    /// </summary>
    /// <param name="pattern">Cache anahtarlarını eşleştirmek için pattern</param>
    Task RemoveByPatternAsync(string pattern);
    
    /// <summary>
    /// Tüm cache kayıtlarını temizler
    /// Dikkatli kullanılmalı - performans etkisi olabilir
    /// </summary>
    Task ClearAllAsync();
    
    /// <summary>
    /// Cache istatistiklerini getirir (hit rate, miss rate, vb.)
    /// Performans izleme için kullanılır
    /// </summary>
    Task<CacheStatistics> GetStatisticsAsync();
}

/// <summary>
/// Cache istatistik modeli
/// Performans analizi ve monitoring için kullanılır
/// </summary>
public class CacheStatistics
{
    /// <summary>Toplam cache istekleri</summary>
    public long TotalRequests { get; set; }
    
    /// <summary>Cache'te bulunan istekler (hit)</summary>
    public long CacheHits { get; set; }
    
    /// <summary>Cache'te bulunmayan istekler (miss)</summary>
    public long CacheMisses { get; set; }
    
    /// <summary>Cache hit oranı (yüzde)</summary>
    public double HitRate => TotalRequests > 0 ? (double)CacheHits / TotalRequests * 100 : 0;
    
    /// <summary>Cache miss oranı (yüzde)</summary>
    public double MissRate => TotalRequests > 0 ? (double)CacheMisses / TotalRequests * 100 : 0;
    
    /// <summary>Önbellekteki toplam kayıt sayısı</summary>
    public int CachedItemsCount { get; set; }
    
    /// <summary>Son sıfırlama zamanı</summary>
    public DateTime LastResetTime { get; set; } = DateTime.UtcNow;
} 