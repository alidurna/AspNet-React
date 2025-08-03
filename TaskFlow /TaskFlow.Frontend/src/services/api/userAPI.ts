/**
 * User API
 * 
 * Kullanıcı yönetimi ve profil ile ilgili API endpoints.
 */

import { apiClient, type ApiResponse } from './apiClient';
import type {
  UserProfile,
  UpdateProfileRequest,
  UserStatsDto,
} from "../../types/auth";
import type { AttachmentDto, UploadLimitsDto } from "../../types/common";

/**
 * User Management API
 */
export const userAPI = {
  // Profile management
  getProfile: (): Promise<ApiResponse<UserProfile>> =>
    apiClient.get<ApiResponse<UserProfile>>("/v1/users/profile").then(res => res.data),

  updateProfile: (profileData: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> =>
    apiClient.put<ApiResponse<UserProfile>>("/v1/users/profile", profileData).then(res => res.data),

  // Statistics
  getStats: (): Promise<ApiResponse<UserStatsDto>> =>
    apiClient.get<ApiResponse<UserStatsDto>>("/v1/users/statistics").then(res => res.data),

  getUserStats: (): Promise<ApiResponse<UserStatsDto>> =>
    apiClient.get<ApiResponse<UserStatsDto>>("/v1/users/statistics").then(res => res.data),

  // Avatar management
  uploadAvatar: (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiClient.post<ApiResponse<{ avatarUrl: string }>>("/v1/Files/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data);
  },

  deleteAvatar: (): Promise<ApiResponse<object>> =>
    apiClient.delete<ApiResponse<object>>("/v1/Files/avatar").then(res => res.data),
};

/**
 * Profile API (alias for userAPI)
 */
export const profileAPI = userAPI;

/**
 * File Management API
 */
export const fileAPI = {
  // Upload limits
  getUploadLimits: (): Promise<ApiResponse<UploadLimitsDto>> =>
    apiClient.get<ApiResponse<UploadLimitsDto>>("/v1/Files/limits").then(res => res.data),

  // Task attachments
  uploadTaskAttachment: (taskId: number, file: File): Promise<ApiResponse<AttachmentDto>> => {
    const formData = new FormData();
    formData.append("attachment", file);
    return apiClient.post<ApiResponse<AttachmentDto>>(`/v1/Files/attachment/task/${taskId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data);
  },

  getTaskAttachments: (taskId: number): Promise<ApiResponse<AttachmentDto[]>> =>
    apiClient.get<ApiResponse<AttachmentDto[]>>(`/v1/Files/attachments/task/${taskId}`).then(res => res.data),

  deleteAttachment: (attachmentId: number): Promise<ApiResponse<object>> =>
    apiClient.delete<ApiResponse<object>>(`/v1/Files/attachment/${attachmentId}`).then(res => res.data),

  downloadAttachment: (attachmentId: number): Promise<Blob> =>
    apiClient.get(`/v1/Files/attachment/${attachmentId}`, { 
      responseType: 'blob' 
    }).then(res => res.data),
}; 