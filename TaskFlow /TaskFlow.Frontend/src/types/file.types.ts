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