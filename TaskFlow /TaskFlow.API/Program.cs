/*
 * Program.cs - TaskFlow API Ana Giriş Noktası
 * ==========================================
 * 
 * Bu dosya ASP.NET Core uygulamasının başlangıç noktasıdır.
 * .NET 6+ ile gelen "Minimal API" yaklaşımı kullanılmıştır.
 * 
 * Önceki versiyonlarda (Startup.cs + Program.cs) şimdi tek dosyada birleştirilmiş.
 * Bu yapı daha basit ve okunabilir kod sağlar.
 */

// ===== 1. APPLICATION BUILDER OLUŞTURMA =====
// WebApplicationBuilder: ASP.NET Core uygulamasını yapılandırmak için kullanılır
// args: Komut satırından gelen parametreler (örn: --urls, --environment)
var builder = WebApplication.CreateBuilder(args);

// ===== 2. SERVİS KAYITLARI (DEPENDENCY INJECTION) =====
/*
 * builder.Services: Dependency Injection Container'a servis eklemek için kullanılır
 * Bu servislere controller'lar, middleware'ler ve diğer servisler erişebilir
 */

// OpenAPI (Swagger) servisini ekle
// Bu servis API dokümantasyonu oluşturur ve /swagger endpoint'i sağlar
// Geliştirme sırasında API'yi test etmek için kullanışlıdır
builder.Services.AddOpenApi();

// ===== 3. APPLICATION (PIPELINE) OLUŞTURMA =====
// builder.Build(): Yapılandırılmış servisleri kullanarak WebApplication örneği oluşturur
var app = builder.Build();

// ===== 4. HTTP REQUEST PIPELINE YAPILANDIRMASI =====
/*
 * Middleware'ler sırayla çalışır:
 * Request -> Middleware 1 -> Middleware 2 -> ... -> Endpoint -> Response
 * 
 * ÖNEMLİ: Middleware'lerin sırası kritiktir!
 */

// CORS, Authentication, Routing vb. buraya gelecek (ileriki adımlarda)

// Geliştirme ortamında OpenAPI (Swagger) UI'ı aktifleştir
if (app.Environment.IsDevelopment())
{
    // /swagger endpoint'inde Swagger UI kullanılabilir olur
    // Sadece Development ortamında aktif (güvenlik için)
    app.MapOpenApi();
}

// HTTPS yönlendirmesi - HTTP isteklerini HTTPS'e yönlendirir
// Güvenlik için önemli bir middleware
app.UseHttpsRedirection();

// ===== 5. ÖRNEK API ENDPOINT'İ (SİLİNECEK) =====
/*
 * Bu bölüm sadece template örneği olarak geldi
 * TaskFlow API'sini oluştururken bu kodları silip
 * gerçek endpoint'lerimizi ekleyeceğiz
 */

// Örnek veri - Hava durumu açıklamaları
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

// GET /weatherforecast endpoint'i tanımı
// Minimal API yaklaşımı: lambda function ile endpoint tanımlama
app.MapGet("/weatherforecast", () =>
{
    // 5 günlük hava tahmini oluştur
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            // Bugünden itibaren 'index' gün sonrası
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            // -20 ile 55 arası rastgele sıcaklık
            Random.Shared.Next(-20, 55),
            // Rastgele hava durumu açıklaması
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray(); // IEnumerable'ı array'e çevir
    
    return forecast; // JSON olarak döndürülür (otomatik serileştirme)
})
.WithName("GetWeatherForecast"); // OpenAPI'de endpoint ismi

// ===== 6. UYGULAMAYI BAŞLATMA =====
// HTTP sunucusunu başlat ve istekleri dinlemeye başla
// Bu satır blocking'dir - uygulama çalışır durumda kalır
app.Run();

// ===== 7. ÖRNEK MODEL SINIFI =====
/*
 * Record Type (C# 9+ özelliği):
 * - Immutable (değiştirilemez) veri yapısı
 * - Value-based equality (değer bazlı eşitlik)
 * - ToString, GetHashCode, Equals otomatik implement edilir
 * - API response'larda ideal
 */
record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    // Computed property: Celsius'tan Fahrenheit'a çevirme
    // => expression-bodied property syntax
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

/*
 * SONRAKI ADIMLAR:
 * ================
 * 1. WeatherForecast örneğini sileceğiz
 * 2. Entity Framework DbContext ekleyeceğiz
 * 3. TaskFlow modellerini (User, Task, Category) oluşturacağız
 * 4. Authentication middleware ekleyeceğiz
 * 5. CORS yapılandırması ekleyeceğiz
 * 6. Gerçek API endpoint'lerini ekleyeceğiz
 */
