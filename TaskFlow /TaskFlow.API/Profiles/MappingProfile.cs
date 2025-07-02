using AutoMapper;
using TaskFlow.API.Models;
using TaskFlow.API.DTOs;

namespace TaskFlow.API.Profiles;

/// <summary>
/// AutoMapper mapping profile
/// Entity → DTO ve DTO → Entity dönüşümlerini tanımlar
/// </summary>
public class MappingProfile : Profile
{
    public MappingProfile()
    {
        ConfigureUserMappings();
        ConfigureCategoryMappings();
        ConfigureTaskMappings();
    }

    /// <summary>
    /// User entity mapping konfigürasyonu
    /// </summary>
    private void ConfigureUserMappings()
    {
        // User → UserDto
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.FullName, 
                      opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"))
            .ForMember(dest => dest.TotalTaskCount,
                      opt => opt.MapFrom(src => src.Tasks.Count))
            .ForMember(dest => dest.CompletedTaskCount,
                      opt => opt.MapFrom(src => src.Tasks.Count(t => t.IsCompleted)))
            .ForMember(dest => dest.PendingTaskCount,
                      opt => opt.MapFrom(src => src.Tasks.Count(t => !t.IsCompleted)));

        // Register DTO → User entity
        CreateMap<UserDto, User>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Tasks, opt => opt.Ignore())
            .ForMember(dest => dest.Categories, opt => opt.Ignore());
    }

    /// <summary>
    /// Category entity mapping konfigürasyonu
    /// </summary>
    private void ConfigureCategoryMappings()
    {
        // Category → CategoryDto
        CreateMap<Category, CategoryDto>()
            .ForMember(dest => dest.TotalTaskCount,
                      opt => opt.MapFrom(src => src.Tasks.Count))
            .ForMember(dest => dest.CompletedTaskCount,
                      opt => opt.MapFrom(src => src.Tasks.Count(t => t.IsCompleted)))
            .ForMember(dest => dest.PendingTaskCount,
                      opt => opt.MapFrom(src => src.Tasks.Count(t => !t.IsCompleted)))
            .ForMember(dest => dest.CompletionPercentage,
                      opt => opt.MapFrom(src => src.Tasks.Count > 0 
                          ? Math.Round((double)src.Tasks.Count(t => t.IsCompleted) / src.Tasks.Count * 100, 1)
                          : 0.0));

        // CategoryDto → Category
        CreateMap<CategoryDto, Category>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Tasks, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore());
    }

    /// <summary>
    /// TodoTask entity mapping konfigürasyonu
    /// </summary>
    private void ConfigureTaskMappings()
    {
        // TodoTask → TodoTaskDto
        CreateMap<TodoTask, TodoTaskDto>()
            .ForMember(dest => dest.CategoryName,
                      opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : "Kategori Yok"))
            .ForMember(dest => dest.CategoryColor,
                      opt => opt.MapFrom(src => src.Category != null ? src.Category.ColorCode : "#6B7280"))
            .ForMember(dest => dest.UserName,
                      opt => opt.MapFrom(src => src.User != null ? $"{src.User.FirstName} {src.User.LastName}" : ""))
            .ForMember(dest => dest.IsOverdue,
                      opt => opt.MapFrom(src => src.DueDate.HasValue && src.DueDate.Value < DateTime.UtcNow && !src.IsCompleted))
            .ForMember(dest => dest.DaysUntilDue,
                      opt => opt.MapFrom(src => src.DueDate.HasValue 
                          ? (int)(src.DueDate.Value - DateTime.UtcNow).TotalDays
                          : (int?)null))
            .ForMember(dest => dest.CompletionPercentage,
                      opt => opt.MapFrom(src => src.IsCompleted ? 100 : 0));

        // TodoTaskDto → TodoTask
        CreateMap<TodoTaskDto, TodoTask>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CompletedAt, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.Category, opt => opt.Ignore());

        // UpdateTaskProgressDto → TodoTask (partial update)
        CreateMap<UpdateTaskProgressDto, TodoTask>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
    }
} 