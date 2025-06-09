/*
 * Priority.cs - Görev Öncelik Enum'u
 * ==================================
 * 
 * Bu enum görevlerin öncelik seviyelerini tanımlar.
 * Entity Framework bu enum'u veritabanında integer olarak saklar.
 * 
 * ENUM KULLANIM AVANTAJLARI:
 * ==========================
 * - Type Safety: Sadece tanımlı değerler kullanılabilir
 * - IntelliSense: IDE otomatik tamamlama sağlar  
 * - Maintenance: Yeni öncelik seviyesi eklemek kolay
 * - Readability: Kod daha okunabilir (1 yerine Priority.High)
 * 
 * VERİTABANI MAPPING:
 * ==================
 * Low = 0, Normal = 1, High = 2, Critical = 3 (integer değerler)
 */

using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.Models;

/// <summary>
/// Görev öncelik seviyelerini tanımlayan enum
/// Veritabanında integer olarak saklanır (0, 1, 2, 3)
/// </summary>
public enum Priority
{
    /// <summary>
    /// Düşük öncelik - Acil olmayan, erteletilebilir görevler
    /// Değer: 0 (veritabanında)
    /// Örnek: "Kitap okumak", "Bahçe işleri"
    /// Renk önerisi: 🟢 Yeşil (#27AE60)
    /// </summary>
    [Display(Name = "Düşük", Description = "Acil olmayan görevler")]
    Low = 0,

    /// <summary>
    /// Normal öncelik - Günlük rutin görevler
    /// Değer: 1 (veritabanında)
    /// Örnek: "E-posta kontrolü", "Alışveriş"
    /// Renk önerisi: 🔵 Mavi (#3498DB)
    /// </summary>
    [Display(Name = "Normal", Description = "Günlük rutin görevler")]
    Normal = 1,

    /// <summary>
    /// Yüksek öncelik - Önemli ve zamanında tamamlanması gereken görevler
    /// Değer: 2 (veritabanında)
    /// Örnek: "Proje teslimi", "Önemli toplantı"
    /// Renk önerisi: 🟠 Turuncu (#F39C12)
    /// </summary>
    [Display(Name = "Yüksek", Description = "Önemli görevler")]
    High = 2,

    /// <summary>
    /// Kritik öncelik - Acil, hemen yapılması gereken görevler
    /// Değer: 3 (veritabanında)  
    /// Örnek: "Acil bug fix", "Deadline'ı geçmiş görev"
    /// Renk önerisi: 🔴 Kırmızı (#E74C3C)
    /// </summary>
    [Display(Name = "Kritik", Description = "Acil görevler")]
    Critical = 3
}

/*
 * ENUM KULLANIM ÖRNEKLERİ:
 * ========================
 * 
 * // Enum değeri atama
 * var task = new TodoTask 
 * {
 *     Title = "Proje teslimi",
 *     Priority = Priority.Critical
 * };
 * 
 * // Enum karşılaştırma
 * if (task.Priority >= Priority.High)
 * {
 *     // Yüksek öncelikli görev işlemleri
 * }
 * 
 * // LINQ filtreleme
 * var highPriorityTasks = tasks.Where(t => t.Priority >= Priority.High).ToList();
 * 
 * // Display attribute kullanımı
 * var displayName = Priority.Critical.GetDisplayName(); // "Kritik"
 * 
 * FRONTEND KULLANIMI:
 * ==================
 * - Badge/chip renklemesi için
 * - Sıralama için (Critical -> High -> Normal -> Low)
 * - Filtreleme dropdown'ları için
 * - Progress bar'larda priority gösterimi için
 * 
 * VERİTABANI BEST PRACTICES:
 * ==========================
 * - Enum değerleri explicit set edilmiş (0,1,2,3)
 * - Yeni öncelik seviyesi eklenirse en sona eklenmeli
 * - Mevcut değerler değiştirilmemeli (data consistency)
 */ 