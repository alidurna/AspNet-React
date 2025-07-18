export interface AttachmentDto {
  id: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  taskId: number;
  userId: number;
}

export interface UploadLimitsDto {
  avatar: {
    maxSizeBytes: number;
    maxSizeFormatted: string;
    allowedTypes: string[];
  };
  attachment: {
    maxSizeBytes: number;
    maxSizeFormatted: string;
    allowedTypes: string[];
  };
} 