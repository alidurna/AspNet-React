export enum TemplatePriority {
    Low = 0,
    Normal = 1,
    High = 2,
    Critical = 3,
}

export interface TaskTemplateDto {
    id: number;
    title: string;
    description?: string;
    priority: TemplatePriority;
    categoryId?: number;
    categoryName?: string;
    tags?: string;
    notes?: string;
    estimatedHours: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    userId: number;
    userName: string;
    usageCount: number;
}

export interface CreateTaskTemplateDto {
    title: string;
    description?: string;
    priority?: TemplatePriority;
    categoryId?: number;
    tags?: string;
    notes?: string;
    estimatedHours?: number;
}

export interface UpdateTaskTemplateDto {
    title?: string;
    description?: string;
    priority?: TemplatePriority;
    categoryId?: number;
    tags?: string;
    notes?: string;
    estimatedHours?: number;
    isActive?: boolean;
}

export interface TaskTemplateFilterDto {
    searchText?: string;
    categoryId?: number;
    priority?: TemplatePriority;
    isActive?: boolean;
    sortBy?: string;
    sortAscending?: boolean;
    page?: number;
    pageSize?: number;
}

export interface CreateTaskFromTemplateDto {
    templateId: number;
    customTitle?: string;
    customDescription?: string;
    customPriority?: TemplatePriority;
    customCategoryId?: number;
    dueDate?: string;
}