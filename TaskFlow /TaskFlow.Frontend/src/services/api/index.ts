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
export { userAPI, fileAPI } from './userAPI';
export { taskAPI } from './taskAPI';
export { categoryAPI } from './categoryAPI';
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
  ...require('./authAPI').authAPI,
  
  // User
  ...require('./userAPI').userAPI,
  
  // Tasks
  ...require('./taskAPI').taskAPI,
  
  // Categories
  ...require('./categoryAPI').categoryAPI,
  
  // Search
  ...require('./searchAPI').searchAPI,
  
  // Files
  ...require('./userAPI').fileAPI,
};

// Specific legacy exports
export const {
  authAPI: auth,
  twoFactorAPI: twoFactor,
  captchaAPI: captcha,
  webAuthnAPI: webAuthn,
} = require('./authAPI');

export const {
  userAPI: users,
  fileAPI: files,
} = require('./userAPI');

export const {
  taskAPI: tasks,
} = require('./taskAPI');

export const {
  categoryAPI: categories,
} = require('./categoryAPI');

export const {
  searchAPI: search,
} = require('./searchAPI');

// Type re-exports
export type {
  UserStatsDto,
  PasswordResetRequestDto,
  PasswordResetDto,
} from '../../types/auth.types';

export type {
  TodoTaskDto,
  CreateTodoTaskDto,
  UpdateTodoTaskDto,
  TodoTaskFilterDto,
} from '../../types/task.types';

export type {
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../types/category.types';

export type {
  AttachmentDto,
  UploadLimitsDto,
} from '../../types/file.types';

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