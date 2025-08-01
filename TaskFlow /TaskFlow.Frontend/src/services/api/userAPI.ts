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
} from "../../types/auth.types";
import type { AttachmentDto, UploadLimitsDto } from "../../types/file.types";

/**
 * User Management API
 */
export const userAPI = {
  // Profile management
  getProfile: (): Promise<ApiResponse<UserProfile>> =>
    apiClient.get<ApiResponse<UserProfile>>("/users/profile").then(res => res.data),

  updateProfile: (profileData: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> =>
    apiClient.put<ApiResponse<UserProfile>>("/users/profile", profileData).then(res => res.data),

  // Statistics
  getStats: (): Promise<ApiResponse<UserStatsDto>> =>
    apiClient.get<ApiResponse<UserStatsDto>>("/users/stats").then(res => res.data),

  // Avatar management
  uploadAvatar: (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiClient.post<ApiResponse<{ avatarUrl: string }>>("/files/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data);
  },

  deleteAvatar: (): Promise<ApiResponse<object>> =>
    apiClient.delete<ApiResponse<object>>("/files/avatar").then(res => res.data),
};

/**
 * File Management API
 */
export const fileAPI = {
  // Upload limits
  getUploadLimits: (): Promise<ApiResponse<UploadLimitsDto>> =>
    apiClient.get<ApiResponse<UploadLimitsDto>>("/files/limits").then(res => res.data),

  // Task attachments
  uploadTaskAttachment: (taskId: number, file: File): Promise<ApiResponse<AttachmentDto>> => {
    const formData = new FormData();
    formData.append("attachment", file);
    return apiClient.post<ApiResponse<AttachmentDto>>(`/files/tasks/${taskId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data);
  },

  getTaskAttachments: (taskId: number): Promise<ApiResponse<AttachmentDto[]>> =>
    apiClient.get<ApiResponse<AttachmentDto[]>>(`/files/tasks/${taskId}/attachments`).then(res => res.data),

  deleteAttachment: (attachmentId: number): Promise<ApiResponse<object>> =>
    apiClient.delete<ApiResponse<object>>(`/files/attachments/${attachmentId}`).then(res => res.data),

  downloadAttachment: (attachmentId: number): Promise<Blob> =>
    apiClient.get(`/files/attachments/${attachmentId}/download`, { 
      responseType: 'blob' 
    }).then(res => res.data),
}; 