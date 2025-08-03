/**
 * API Services - Main Export
 * 
 * Modüler API services'lerin ana export dosyası.
 * Eski api.ts'in yerini alan refactored yapı.
 */

// Re-export base client and utilities
export { apiClient, tokenManager, setOnUnauthorizedCallback, type ApiResponse } from './apiClient';

// Re-export all API modules
export { authAPI, twoFactorAPI, captchaAPI, webAuthnAPI } from './authAPI';
export { userAPI, fileAPI, profileAPI } from './userAPI';
export { taskAPI } from './taskAPI';
export { categoryAPI as categoriesAPI } from './categoryAPI';
export { searchAPI } from './searchAPI';

// Import for default export
import { apiClient, tokenManager } from './apiClient';
import { authAPI, twoFactorAPI, captchaAPI, webAuthnAPI } from './authAPI';
import { userAPI, fileAPI } from './userAPI';
import { taskAPI } from './taskAPI';
import { categoryAPI } from './categoryAPI';
import { searchAPI } from './searchAPI';

// Legacy exports for backward compatibility
export const api = {
  // Auth
  ...authAPI,
  
  // User
  ...userAPI,
  
  // Tasks
  ...taskAPI,
  
  // Categories
  ...categoryAPI,
  
  // Search
  ...searchAPI,
  
  // Files
  ...fileAPI,
};

// Specific legacy exports
export const {
  authAPI: auth,
  twoFactorAPI: twoFactor,
  captchaAPI: captcha,
  webAuthnAPI: webAuthn,
} = { authAPI, twoFactorAPI, captchaAPI, webAuthnAPI };

export const {
  userAPI: users,
  fileAPI: files,
} = { userAPI, fileAPI };

export const {
  taskAPI: tasks,
} = { taskAPI };

export const {
  categoryAPI: categories,
} = { categoryAPI };

export const {
  searchAPI: search,
} = { searchAPI };

// Type re-exports
export type {
  UserStatsDto,
  PasswordResetRequestDto,
  PasswordResetDto,
} from '../../types/auth';

export type {
  TodoTaskDto,
  CreateTodoTaskDto,
  UpdateTodoTaskDto,
  TodoTaskFilterDto,
} from '../../types/tasks';

export type {
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../types/tasks';

export type {
  AttachmentDto,
  UploadLimitsDto,
} from '../../types/common';

// Default export for easier imports
export default {
  client: apiClient,
  token: tokenManager,
  auth: authAPI,
  users: userAPI,
  tasks: taskAPI,
  categories: categoryAPI,
  search: searchAPI,
  files: fileAPI,
  twoFactor: twoFactorAPI,
  captcha: captchaAPI,
  webAuthn: webAuthnAPI,
}; 