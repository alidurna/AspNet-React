/**
 * API Services - Main Export
 * 
 * Modüler API services'lerin ana export dosyası.
 * Eski api.ts'in yerini alan refactored yapı.
 */

// Re-export base client and utilities
export { apiClient, tokenManager, setOnUnauthorizedCallback, type ApiResponse } from './apiClient';

// Import all API modules
import { apiClient, tokenManager } from './apiClient';
import { authAPI, twoFactorAPI, webAuthnAPI } from './authAPI';
import { userAPI, fileAPI } from './userAPI';
import { taskAPI } from './taskAPI';
import { categoryAPI } from './categoryAPI';
import { searchAPI } from './searchAPI';
import { dependencyAPI } from './dependencyAPI';
import { templateAPI } from './templateAPI';

// Re-export all API modules as named exports
export { authAPI, twoFactorAPI, webAuthnAPI } from './authAPI';
export { userAPI, fileAPI } from './userAPI';
export { taskAPI } from './taskAPI';
export { categoryAPI } from './categoryAPI';
export { searchAPI } from './searchAPI';
export { dependencyAPI } from './dependencyAPI';
export { templateAPI } from './templateAPI';

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
  
  // Template
  ...templateAPI,
  
  // Dependencies
  ...dependencyAPI,
};

// Specific legacy exports
export const {
  authAPI: auth,
  twoFactorAPI: twoFactor,
  webAuthnAPI: webAuthn,
} = { authAPI, twoFactorAPI, webAuthnAPI };

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

export const {
  dependencyAPI: dependencies,
} = { dependencyAPI };

export const {
  templateAPI: templates,
} = { templateAPI };

// Explicit exports for direct access
export const captcha = authAPI.captchaAPI;
export const categoriesAPI = categoryAPI;

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
  captcha: captcha,
  webAuthn: webAuthnAPI,
  dependencies: dependencyAPI,
  templates: templateAPI,
}; 