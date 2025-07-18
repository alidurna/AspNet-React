import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MdDelete } from "react-icons/md";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import Input from "../ui/Input";
import LoadingSpinner from "../ui/LoadingSpinner";
import { tasksAPI, fileUploadAPI, type TodoTaskDto, type AttachmentDto, type UploadLimitsDto, type ApiResponse } from "../../services/api";
import { getFileIcon } from "../../utils/fileIcons";
import { useToast } from "../../hooks/useToast";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number | null;
}

const attachmentSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size > 0, "Dosya boş olamaz."),
});

type AttachmentFormData = z.infer<typeof attachmentSchema>;

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, taskId }) => {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useToast();
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploadLimits, setUploadLimits] = useState<any>(null);

  const { register, handleSubmit, reset } = useForm<AttachmentFormData>({
    resolver: zodResolver(attachmentSchema),
  });

  // Görev detaylarını yükle
  const { data: task, isLoading: isTaskLoading, error: taskError } = useQuery<ApiResponse<TodoTaskDto>, Error>({
    queryKey: ['task', taskId],
    queryFn: () => tasksAPI.getTaskById(taskId!),
    enabled: !!taskId && isOpen,
  });

  // Ekleri yükle
  const { data: fetchedAttachments, isLoading: isAttachmentsLoading, error: attachmentsError } = useQuery<AttachmentDto[], Error>({
    queryKey: ['attachments', taskId],
    queryFn: async () => {
      const response = await tasksAPI.getAttachmentsForTask(taskId!);
      if (!response.success) {
        throw new Error(response.message || "Ekler getirilirken bir hata oluştu.");
      }
      return response.data;
    },
    enabled: !!taskId && isOpen,
  });

  // Yükleme limitlerini çek
  const { data: limitsData, isLoading: isLimitsLoading, error: limitsError } = useQuery<UploadLimitsDto, Error>({
    queryKey: ['uploadLimits'],
    queryFn: async () => {
      const response = await fileUploadAPI.getUploadLimits();
      if (!response.success) {
        throw new Error(response.message || "Yükleme limitleri getirilirken bir hata oluştu.");
      }
      return response.data;
    },
  });

  // useEffect ile data'ları state'e set et
  useEffect(() => {
    if (fetchedAttachments) {
      setAttachments(fetchedAttachments);
    }
  }, [fetchedAttachments]);

  useEffect(() => {
    if (limitsData) {
      setUploadLimits(limitsData);
    }
  }, [limitsData]);

  // Error handling
  useEffect(() => {
    if (attachmentsError) {
      showError(attachmentsError.message || "Ekler getirilirken bir hata oluştu.");
    }
  }, [attachmentsError, showError]);

  useEffect(() => {
    if (limitsError) {
      showError(limitsError.message || "Yükleme limitleri getirilirken bir hata oluştu.");
    }
  }, [limitsError, showError]);

  const uploadAttachmentMutation = useMutation<ApiResponse<AttachmentDto>, Error, { taskId: number; file: File }>({ 
    mutationFn: ({ taskId, file }) => fileUploadAPI.uploadAttachment(taskId, file),
    onSuccess: (response: ApiResponse<AttachmentDto>) => {
      if (response.success) {
        showSuccess("Dosya başarıyla yüklendi!");
        queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
        reset();
      } else {
        showError(response.message || "Dosya yüklenirken bir hata oluştu.");
      }
    },
    onError: (error: Error) => {
      showError("Dosya yüklenirken bir hata oluştu.");
      console.error("Dosya yükleme hatası:", error);
    },
  });

  const deleteAttachmentMutation = useMutation<ApiResponse<object>, Error, number>({
    mutationFn: (attachmentId) => fileUploadAPI.deleteAttachment(attachmentId),
    onSuccess: (response: ApiResponse<object>) => {
      if (response.success) {
        showSuccess("Dosya başarıyla silindi!");
        queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
      } else {
        showError(response.message || "Dosya silinirken bir hata oluştu.");
      }
    },
    onError: (error: Error) => {
      showError("Dosya silinirken bir hata oluştu.");
      console.error("Dosya silme hatası:", error);
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
      setAttachments([]);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: AttachmentFormData) => {
    if (taskId) {
      uploadAttachmentMutation.mutate({ taskId, file: data.file });
    }
  };

  const handleDeleteAttachment = (attachmentId: number) => {
    deleteAttachmentMutation.mutate(attachmentId);
  };

  if (isTaskLoading || isAttachmentsLoading || isLimitsLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (taskError) {
    return <div className="text-red-500">Error: {taskError.message}</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Görev Detayları: {task?.data?.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Görev Bilgileri */}
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Açıklama: {task?.data?.description || "Yok"}</p>
            <p className="text-sm text-gray-500">Son Tarih: {task?.data?.dueDate ? new Date(task.data.dueDate).toLocaleDateString() : "Yok"}</p>
            <p className="text-sm text-gray-500">Öncelik: {task?.data?.priority}</p>
            <p className="text-sm text-gray-500">Durum: {task?.data?.status}</p>
            <p className="text-sm text-gray-500">İlerleme: {task?.data?.progress}%</p>
          </div>

          {/* Ekler Bölümü */}
          <div className="space-y-2 mt-4">
            <h4 className="font-semibold text-lg">Ekler</h4>
            {attachments.length === 0 ? (
              <p className="text-sm text-gray-500">Henüz ek yok.</p>
            ) : (
              <ul className="space-y-2">
                {attachments.map((attachment) => (
                  <li key={attachment.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center space-x-2">
                      <span className="text-primary-500">{getFileIcon(attachment.fileName)}</span>
                      <a
                        href={attachment.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {attachment.fileName} ({Math.round(attachment.fileSize / 1024)} KB)
                      </a>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAttachment(attachment.id)}
                      isLoading={deleteAttachmentMutation.isPending}
                    >
                      <MdDelete className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            {/* Dosya Yükleme Formu */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 mt-4">
              <Input
                type="file"
                {...register("file")}
                label="Yeni Ek Yükle"
              />
              {uploadLimits && (
                <p className="text-xs text-gray-500">
                  Max boyutu: {uploadLimits.attachment.maxSizeFormatted},
                  İzin verilen tipler: {uploadLimits.attachment.allowedTypes.join(", ")}
                </p>
              )}
              <Button type="submit" isLoading={uploadAttachmentMutation.isPending} className="mt-2">
                Ekle Yükle
              </Button>
            </form>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal; 