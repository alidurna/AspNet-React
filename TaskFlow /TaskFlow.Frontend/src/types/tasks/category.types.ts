export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
  colorCode?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  colorCode?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  colorCode?: string;
}

export interface CategoryFilterDto {
  name?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  pageNumber?: number;
  pageSize?: number;
} 