// ****************************************************************************************************
//  ATTACHMENT.CS
//  --------------------------------------------------------------------------------------------------
//  Bu dosya, TaskFlow uygulamasının dosya yönetimi sisteminin ana entity modelidir. Görevlere eklenen
//  dosyaların (resimler, belgeler vb.) veritabanı bilgilerini tutar.
//  Entity Framework Core ile veritabanı mapping'i ve ilişkileri sağlar.
//
//  ANA BAŞLIKLAR:
//  - Attachment Identity ve Basic Information
//  - File Metadata (FileName, FilePath, ContentType, FileSize)
//  - User ve TodoTask Relationships
//  - Upload Date
//
//  GÜVENLİK:
//  - User isolation (UserId foreign key)
//  - Data validation constraints
//  - Relationship integrity
//  - Access control through relationships
//
//  HATA YÖNETİMİ:
//  - Required field validation
//  - String length constraints
//  - Relationship integrity
//
//  EDGE-CASE'LER:
//  - Orphaned records (ilişkili görevin silinmesi)
//  - Large file sizes (sadece metadata, dosya blob olarak saklanmaz)
//  - Duplicate file names (dosya yolu benzersiz olmalı)
//
//  YAN ETKİLER:
//  - File uploads consume storage (disk üzerinde)
//  - Deletion affects storage and database records
//  - Task operations affect attachments
//
//  PERFORMANS:
//  - Efficient database queries for metadata
//  - Optimized relationship loading
//
//  SÜRDÜRÜLEBİLİRLİK:
//  - Clear entity design
//  - Comprehensive documentation
//  - Extensible model structure
//  - Migration-friendly design
// ****************************************************************************************************
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskFlow.API.Models
{
    public class Attachment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string FilePath { get; set; } = string.Empty; // Dosyanın sunucu üzerindeki yolu

        [Required]
        [MaxLength(100)]
        public string ContentType { get; set; } = string.Empty;

        public long FileSize { get; set; } // Byte cinsinden dosya boyutu

        public DateTime UploadDate { get; set; }

        [Required]
        public int UserId { get; set; } // Yükleyen kullanıcı

        public virtual User User { get; set; } = null!;

        public int TodoTaskId { get; set; } // İlişkili görev ID'si

        public virtual TodoTask TodoTask { get; set; } = null!;
    }
} 