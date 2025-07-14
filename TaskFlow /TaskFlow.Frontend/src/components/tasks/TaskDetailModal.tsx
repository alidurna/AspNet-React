import React from 'react';
import { format } from 'date-fns';
import type { TodoTaskDto, ApiResponse } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fileUploadAPI } from '../../services/api';
import type { AttachmentDto } from '../../types/file.types';
import { useToast } from '../../hooks/useToast';
import Input from '../ui/Input';

/**
 * Görev Detay Modalı bileşeni, seçilen bir görevin tüm detaylarını görüntülemek ve dosya eklerini yönetmek için kullanılır.
 * Bu modal, görevin başlığını, açıklamasını, son teslim tarihini, önceliğini, durumunu,
 * kategori adını, oluşturulma ve güncellenme tarihlerini, ilgili kullanıcı bilgilerini ve ekli dosyaları gösterir.
 * Ayrıca, modalı kapatmak, yeni dosya eklemek, mevcut dosyaları indirmek ve silmek için butonlar içerir.
 */
interface TaskDetailModalProps {
  task: TodoTaskDto;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  // Görev eklerini çekmek için React Query kullanımı
  const { data: attachmentsData, isLoading: isLoadingAttachments, error: attachmentsError } = useQuery<
    ApiResponse<AttachmentDto[]>,
    Error
  >({
    queryKey: ['taskAttachments', task.id],
    queryFn: async ({ queryKey }) => {
      const [, taskId] = queryKey;
      return fileUploadAPI.getAttachmentsForTask(taskId as number);
    },
    enabled: !!task.id, // Task ID mevcutsa sorguyu etkinleştir
  });

  // Dosya yükleme mutasyonu
  const uploadAttachmentMutation = useMutation({
    mutationFn: (file: File) => fileUploadAPI.uploadAttachment({
      taskId: task.id,
      file: file,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskAttachments', task.id] });
      showSuccess('Dosya başarıyla yüklendi.');
      setSelectedFile(null);
    },
    onError: (error) => {
      showError(`Dosya yüklenirken hata oluştu: ${(error as Error).message}`);
    },
  });

  // Dosya silme mutasyonu
  const deleteAttachmentMutation = useMutation({
    mutationFn: (attachmentId: number) => fileUploadAPI.deleteTaskAttachments(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskAttachments', task.id] });
      showSuccess('Dosya başarıyla silindi.');
    },
    onError: (error) => {
      showError(`Dosya silinirken hata oluştu: ${(error as Error).message}`);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUploadFile = () => {
    if (selectedFile) {
      uploadAttachmentMutation.mutate(selectedFile);
    }
  };

  const handleDownloadFile = (filePath: string, fileName: string) => {
    const fullPath = `http://localhost:5281${filePath}`; // Backend URL'sini ve yolu birleştir
    const link = document.createElement('a');
    link.href = fullPath;
    link.setAttribute('download', fileName); // Dosya adını ayarlayarak indirme tetikle
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDeleteAttachment = (attachmentId: number) => {
    deleteAttachmentMutation.mutate(attachmentId);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <Card className="p-6 w-full max-w-lg dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Görev Detayları
        </h2>
        <div className="space-y-3 text-gray-700 dark:text-gray-300">
          <div>
            <strong className="block text-gray-800 dark:text-white">Başlık:</strong>
            <p>{task.title}</p>
          </div>
          {task.description && (
            <div>
              <strong className="block text-gray-800 dark:text-white">Açıklama:</strong>
              <p>{task.description}</p>
            </div>
          )}
          <div>
            <strong className="block text-gray-800 dark:text-white">Durum:</strong>
            <p>{task.status}</p>
          </div>
          <div>
            <strong className="block text-gray-800 dark:text-white">Öncelik:</strong>
            <p>{task.priority}</p>
          </div>
          {task.dueDate && (
            <div>
              <strong className="block text-gray-800 dark:text-white">Son Tarih:</strong>
              <p>{format(new Date(task.dueDate), 'dd.MM.yyyy HH:mm')}</p>
            </div>
          )}
          {task.categoryName && (
            <div>
              <strong className="block text-gray-800 dark:text-white">Kategori:</strong>
              <p>{task.categoryName}</p>
            </div>
          )}
          <div>
            <strong className="block text-gray-800 dark:text-white">Oluşturulma Tarihi:</strong>
            <p>{format(new Date(task.createdAt), 'dd.MM.yyyy HH:mm')}</p>
          </div>
          <div>
            <strong className="block text-gray-800 dark:text-white">Son Güncelleme:</strong>
            <p>{format(new Date(task.updatedAt), 'dd.MM.yyyy HH:mm')}</p>
          </div>
          {task.creatorUserName && (
            <div>
              <strong className="block text-gray-800 dark:text-white">Oluşturan:</strong>
              <p>{task.creatorUserName}</p>
            </div>
          )}
          {task.assignedUserName && (
            <div>
              <strong className="block text-gray-800 dark:text-white">Atanan:</strong>
              <p>{task.assignedUserName}</p>
            </div>
          )}

          {/* Dosya Yönetimi Bölümü */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">Ekli Dosyalar</h3>
            {isLoadingAttachments ? (
              <p>Dosyalar yükleniyor...</p>
            ) : attachmentsError ? (
              <p className="text-red-500">Ekli dosyalar yüklenirken hata oluştu: {(attachmentsError as Error).message}</p>
            ) : (attachmentsData?.data?.length ?? 0) === 0 ? (
              <p className="text-gray-500">Henüz ekli dosya bulunmamaktadır.</p>
            ) : (
              <ul className="space-y-2">
                {attachmentsData?.data.map((attachment) => (
                  <li key={attachment.id} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    <a
                      href={`http://localhost:5281${attachment.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {attachment.fileName} ({formatBytes(attachment.fileSize)})
                    </a>
                    <div className="space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownloadFile(attachment.filePath, attachment.fileName)}
                      >
                        İndir
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAttachment(attachment.id)} // attachment.id ile silme
                      >
                        Sil
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <Input
                type="file"
                onChange={handleFileChange}
                className="flex-grow"
              />
              <Button
                onClick={handleUploadFile}
                disabled={!selectedFile || uploadAttachmentMutation.isPending}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {uploadAttachmentMutation.isPending ? 'Yükleniyor...' : 'Dosya Yükle'}
              </Button>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Dosya boyutunu okunabilir formata dönüştüren yardımcı fonksiyon
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default TaskDetailModal; 