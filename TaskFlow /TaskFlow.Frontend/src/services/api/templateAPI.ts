import { apiClient } from "./apiClient";
import type { ApiResponse } from "../../types/common";
import type { 
    TaskTemplateDto, 
    CreateTaskTemplateDto, 
    UpdateTaskTemplateDto,
    TaskTemplateFilterDto,
    CreateTaskFromTemplateDto
} from "../../types/tasks";
import type { TodoTaskDto } from "../../types/tasks/task.types";

const BASE_URL = "/api/v1/TaskTemplates";

export const templateAPI = {
    /**
     * Yeni bir görev şablonu oluşturur.
     * @param createDto Oluşturulacak şablonun verileri.
     * @returns Oluşturulan şablonun DTO'su.
     */
    createTemplate: async (createDto: CreateTaskTemplateDto): Promise<ApiResponse<TaskTemplateDto>> => {
        const response = await apiClient.post<ApiResponse<TaskTemplateDto>>(
            `${BASE_URL}`,
            createDto
        );
        return response.data;
    },

    /**
     * Belirli bir görev şablonunu ID'ye göre getirir.
     * @param templateId Getirilecek şablonun ID'si.
     * @returns Şablonun DTO'su veya null.
     */
    getTemplateById: async (templateId: number): Promise<ApiResponse<TaskTemplateDto>> => {
        const response = await apiClient.get<ApiResponse<TaskTemplateDto>>(
            `${BASE_URL}/${templateId}`
        );
        return response.data;
    },

    /**
     * Görev şablonlarını filtre ve sayfalama seçenekleriyle getirir.
     * @param filter Filtreleme ve sayfalama kriterleri.
     * @returns Şablon listesi ve sayfalama bilgileri.
     */
    getTemplates: async (
        filter: TaskTemplateFilterDto
    ): Promise<ApiResponse<{ templates: TaskTemplateDto[]; pagination: any }>> => {
        const response = await apiClient.get<ApiResponse<{ templates: TaskTemplateDto[]; pagination: any }>>(
            `${BASE_URL}`, {
                params: filter
            }
        );
        return response.data;
    },

    /**
     * Mevcut bir görev şablonunu günceller.
     * @param templateId Güncellenecek şablonun ID'si.
     * @param updateDto Güncelleme verileri.
     * @returns Güncellenen şablonun DTO'su.
     */
    updateTemplate: async (
        templateId: number,
        updateDto: UpdateTaskTemplateDto
    ): Promise<ApiResponse<TaskTemplateDto>> => {
        const response = await apiClient.put<ApiResponse<TaskTemplateDto>>(
            `${BASE_URL}/${templateId}`,
            updateDto
        );
        return response.data;
    },

    /**
     * Belirli bir görev şablonunu siler.
     * @param templateId Silinecek şablonun ID'si.
     * @returns Başarı durumu.
     */
    deleteTemplate: async (templateId: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.delete<ApiResponse<any>>(
            `${BASE_URL}/${templateId}`
        );
        return response.data;
    },

    /**
     * Şablondan yeni bir görev oluşturur.
     * @param createDto Şablondan oluşturulacak görev verileri.
     * @returns Oluşturulan görev DTO'su.
     */
    createTaskFromTemplate: async (createDto: CreateTaskFromTemplateDto): Promise<ApiResponse<TodoTaskDto>> => {
        const response = await apiClient.post<ApiResponse<TodoTaskDto>>(
            `${BASE_URL}/create-task`,
            createDto
        );
        return response.data;
    },

    /**
     * En çok kullanılan görev şablonlarını getirir.
     * @param count Getirilecek şablon sayısı (varsayılan 5).
     * @returns En çok kullanılan şablonların listesi.
     */
    getMostUsedTemplates: async (count: number = 5): Promise<ApiResponse<TaskTemplateDto[]>> => {
        const response = await apiClient.get<ApiResponse<TaskTemplateDto[]>>(
            `${BASE_URL}/most-used`,
            {
                params: { count }
            }
        );
        return response.data;
    },

    /**
     * Belirli bir kategoriye ait görev şablonlarını getirir.
     * @param categoryId Kategori ID'si.
     * @returns Kategoriye ait şablonların listesi.
     */
    getTemplatesByCategory: async (categoryId: number): Promise<ApiResponse<TaskTemplateDto[]>> => {
        const response = await apiClient.get<ApiResponse<TaskTemplateDto[]>>(
            `${BASE_URL}/category/${categoryId}`
        );
        return response.data;
    },
};