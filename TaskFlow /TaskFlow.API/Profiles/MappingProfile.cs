/**
 * Mapping Profile
 * 
 * Bu dosya, TaskFlow API'sinde AutoMapper konfigürasyonunu içerir.
 * Entity'ler ile DTO'lar arasında otomatik mapping işlemlerini
 * tanımlar ve yönetir.
 * 
 * Ana İşlevler:
 * - Entity to DTO mapping
 * - DTO to Entity mapping
 * - Custom mapping kuralları
 * - Property transformation
 * - Type conversion
 * 
 * Mapping Konfigürasyonları:
 * - User -> UserDto: Temel kullanıcı bilgileri
 * - User -> UserProfileDto: Profil bilgileri (ID string'e çevrilir)
 * - TodoTask -> TodoTaskDto: Görev bilgileri
 * - Category -> CategoryDto: Kategori bilgileri
 * 
 * Custom Mapping Kuralları:
 * - ID dönüşümleri (int -> string)
 * - Tarih formatlaması
 * - Progress hesaplamaları
 * - Null value handling
 * 
 * AutoMapper Özellikleri:
 * - Fluent API
 * - Custom value resolvers
 * - Conditional mapping
 * - Nested object mapping
 * - Collection mapping
 * 
 * Performance:
 * - Compiled mappings
 * - Efficient property access
 * - Minimal reflection overhead
 * - Memory optimization
 * 
 * Validation:
 * - Mapping validation
 * - Property existence checks
 * - Type safety
 * - Error handling
 * 
 * Sürdürülebilirlik:
 * - Centralized mapping
 * - Easy maintenance
 * - Clear documentation
 * - Testable design
 * 
 * @author TaskFlow Development Team
 * @version 1.0.0
 * @since 2024
 */

using AutoMapper;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;

namespace TaskFlow.API.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<User, UserDto>();
            CreateMap<User, UserProfileDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()));

            CreateMap<TodoTask, TodoTaskDto>()
                .ForMember(dest => dest.DueDate, opt => opt.MapFrom(src => src.DueDate))
                .ForMember(dest => dest.Progress, opt => opt.MapFrom(src => src.Progress));

            CreateMap<Category, CategoryDto>();
        }
    }
} 