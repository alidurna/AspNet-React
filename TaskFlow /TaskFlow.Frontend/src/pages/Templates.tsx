import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateAPI } from '../services/api';
import Toast from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import Card from "../components/ui/Card";
import { Dialog } from '../components/ui/Dialog';
import ConfirmModal from '../components/ui/ConfirmModal';
import Input from '../components/ui/Input';
import TemplateModal from '../components/tasks/TemplateModal'; // Yeni modal
import type { TaskTemplateDto, TaskTemplateFilterDto, CreateTaskFromTemplateDto } from '../types/tasks/template.types';
import { TemplatePriority } from '../types/tasks/template.types';
import type { TodoTaskDto } from '../types/tasks/task.types';
import { FaEdit, FaTrashAlt, FaPlus, FaTasks, FaDownload, FaFilter } from 'react-icons/fa';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import Label from '../components/ui/Label';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import type { CategoryDto } from '../types/tasks/category.types';
import type { ApiResponse } from '../types/common';

const Templates: React.FC = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplateDto | undefined>(undefined);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [templateToDeleteId, setTemplateToDeleteId] = useState<number | null>(null);
    const [isCreateTaskFromTemplateModalOpen, setIsCreateTaskFromTemplateModalOpen] = useState(false);
    const [selectedTemplateForTaskCreation, setSelectedTemplateForTaskCreation] = useState<TaskTemplateDto | undefined>(undefined);

    // Filtreleme state'leri
    const [filter, setFilter] = useState<TaskTemplateFilterDto>({
        page: 1,
        pageSize: 10,
        sortBy: "createdAt",
        sortAscending: false,
    });

    const { data: templatesData, isLoading, isError, error } = useQuery<ApiResponse<{ templates: TaskTemplateDto[]; pagination: any }>>({
        queryKey: ['taskTemplates', filter],
        queryFn: () => templateAPI.getTemplates(filter),
        enabled: !!user?.id, // Sadece kullanıcı ID'si varsa sorgula
    });

    const deleteTemplateMutation = useMutation<ApiResponse<any>, Error, number>({
        mutationFn: templateAPI.deleteTemplate,
        onSuccess: () => {
            Toast.success("Şablon başarıyla silindi!");
            queryClient.invalidateQueries({ queryKey: ['taskTemplates'] });
            setIsConfirmModalOpen(false);
        },
        onError: (error) => {
            Toast.error(`Şablon silinirken hata oluştu: ${error.message}`);
            setIsConfirmModalOpen(false);
        },
    });

    const createTaskFromTemplateMutation = useMutation<ApiResponse<TodoTaskDto>, Error, CreateTaskFromTemplateDto>({
        mutationFn: templateAPI.createTaskFromTemplate,
        onSuccess: () => {
            Toast.success("Görev şablondan başarıyla oluşturuldu!");
            queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Görevler listesini güncelle
            setIsCreateTaskFromTemplateModalOpen(false);
            setSelectedTemplateForTaskCreation(undefined);
        },
        onError: (error) => {
            Toast.error(`Şablondan görev oluşturulurken hata oluştu: ${error.message}`);
        },
    });

    const handleCreateTemplate = () => {
        setSelectedTemplate(undefined);
        setIsTemplateModalOpen(true);
    };

    const handleEditTemplate = (template: TaskTemplateDto) => {
        setSelectedTemplate(template);
        setIsTemplateModalOpen(true);
    };

    const handleDeleteTemplate = (templateId: number) => {
        setTemplateToDeleteId(templateId);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (templateToDeleteId !== null) {
            deleteTemplateMutation.mutate(templateToDeleteId);
        }
    };

    const handleCreateTaskFromTemplate = (template: TaskTemplateDto) => {
        setSelectedTemplateForTaskCreation(template);
        setIsCreateTaskFromTemplateModalOpen(true);
    };

    const onSubmitCreateTaskFromTemplate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedTemplateForTaskCreation) return;

        const formData = new FormData(event.currentTarget);
        const customTitle = formData.get('customTitle') as string;
        const customDescription = formData.get('customDescription') as string;
        const customPriority = formData.get('customPriority') ? Number(formData.get('customPriority')) : undefined;
        const customCategoryId = formData.get('customCategoryId') ? Number(formData.get('customCategoryId')) : undefined;
        const dueDate = formData.get('dueDate') as string;

        const createDto: CreateTaskFromTemplateDto = {
            templateId: selectedTemplateForTaskCreation.id,
            customTitle: customTitle || undefined,
            customDescription: customDescription || undefined,
            customPriority: customPriority,
            customCategoryId: customCategoryId,
            dueDate: dueDate || undefined,
        };

        await createTaskFromTemplateMutation.mutateAsync(createDto);
    };

    const handlePageChange = (newPage: number) => {
        setFilter(prev => ({ ...prev, page: newPage }));
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilter(prev => ({
            ...prev,
            [name]: value,
            page: 1, // Filtre değişince sayfayı sıfırla
        }));
    };

    const handleCheckboxFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFilter(prev => ({ 
            ...prev, 
            [name]: checked, 
            page: 1 
        }));
    };

    const getPriorityText = (priority: TemplatePriority) => {
        switch (priority) {
            case TemplatePriority.Low: return "Düşük";
            case TemplatePriority.Normal: return "Normal";
            case TemplatePriority.High: return "Yüksek";
            case TemplatePriority.Critical: return "Kritik";
            default: return "Bilinmiyor";
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full text-lg">Şablonlar yükleniyor...</div>;
    }

    if (isError) {
        return <div className="flex justify-center items-center h-full text-lg text-red-500">Hata: {error?.message || "Şablonlar yüklenemedi."}</div>;
    }

    const templates = templatesData?.data?.templates || [];
    const pagination = templatesData?.data?.pagination;

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Görev Şablonları</h1>
                <Button onClick={handleCreateTemplate} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <FaPlus />
                    <span>Yeni Şablon Oluştur</span>
                </Button>
            </div>

            {/* Filtre ve Arama Bölümü */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"><FaFilter className="mr-2"/>Filtreleme</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="searchText">Arama</Label>
                        <Input 
                            id="searchText" 
                            name="searchText" 
                            type="text" 
                            value={filter.searchText || ""}
                            onChange={handleFilterChange}
                            placeholder="Başlık, açıklama, etiket ara..."
                        />
                    </div>
                    <div>
                        <Label htmlFor="priority">Öncelik</Label>
                        <Select 
                            id="priority" 
                            name="priority" 
                            value={filter.priority || ""}
                            onChange={handleFilterChange}
                        >
                            <option value="">Tümü</option>
                            {Object.values(TemplatePriority)
                                .filter(value => typeof value === 'number')
                                .map((priorityValue) => (
                                    <option key={priorityValue} value={priorityValue}>
                                        {getPriorityText(priorityValue as TemplatePriority)}
                                    </option>
                                ))}
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="isActive">Aktif Şablonlar</Label>
                        <input 
                            type="checkbox" 
                            id="isActive" 
                            name="isActive" 
                            checked={filter.isActive ?? true} // Varsayılan olarak aktif şablonları göster
                            onChange={handleCheckboxFilterChange}
                            className="ml-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                </div>
            </div>

            {templates.length === 0 ? (
                <div className="text-center text-gray-600 dark:text-gray-400 py-10">
                    Henüz hiç şablonunuz yok. Yeni bir şablon oluşturarak başlayın!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <Card key={template.id} className="relative p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{template.title}</h3>
                                <div className="flex space-x-2">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleCreateTaskFromTemplate(template)}
                                        title="Bu Şablondan Görev Oluştur"
                                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                                    >
                                        <FaPlus /> <FaTasks className="ml-1"/>
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleEditTemplate(template)}
                                        title="Şablonu Düzenle"
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                    >
                                        <FaEdit />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleDeleteTemplate(template.id)}
                                        title="Şablonu Sil"
                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                                    >
                                        <FaTrashAlt />
                                    </Button>
                                </div>
                            </div>
                            {template.description && (
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">{template.description}</p>
                            )}
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                <p><strong>Öncelik:</strong> <span className={`font-medium ${template.priority === TemplatePriority.Critical ? 'text-red-500' : template.priority === TemplatePriority.High ? 'text-orange-500' : template.priority === TemplatePriority.Normal ? 'text-blue-500' : 'text-gray-500'}`}>{getPriorityText(template.priority)}</span></p>
                                {template.categoryName && <p><strong>Kategori:</strong> {template.categoryName}</p>}
                                {template.tags && <p><strong>Etiketler:</strong> {template.tags}</p>}
                                <p><strong>Tahmini Süre:</strong> {template.estimatedHours} saat</p>
                                <p><strong>Oluşturulma:</strong> {format(new Date(template.createdAt), 'dd MMM yyyy, HH:mm')}</p>
                                <p><strong>Son Güncelleme:</strong> {format(new Date(template.updatedAt), 'dd MMM yyyy, HH:mm')}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.TotalCount > 0 && ( 
                <div className="flex justify-center items-center space-x-4 mt-8">
                    <Button 
                        onClick={() => handlePageChange(pagination.Page - 1)}
                        disabled={!pagination.HasPreviousPage || isLoading}
                        variant="secondary"
                    >
                        Önceki
                    </Button>
                    <span className="text-gray-700 dark:text-gray-200">
                        Sayfa {pagination.Page} / {Math.ceil(pagination.TotalCount / pagination.PageSize)}
                    </span>
                    <Button 
                        onClick={() => handlePageChange(pagination.Page + 1)}
                        disabled={!pagination.HasNextPage || isLoading}
                        variant="secondary"
                    >
                        Sonraki
                    </Button>
                </div>
            )}

            <TemplateModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                template={selectedTemplate}
            />

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onConfirm={confirmDelete}
                onCancel={() => setIsConfirmModalOpen(false)}
                title="Şablonu Sil Onayı"
                message="Bu şablonu kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
                confirmButtonText="Sil"
                cancelButtonText="İptal"
            />

            {/* Şablondan Görev Oluşturma Modalı */}
            <Dialog
                isOpen={isCreateTaskFromTemplateModalOpen}
                onClose={() => setIsCreateTaskFromTemplateModalOpen(false)}
                title={`Şablondan Görev Oluştur: ${selectedTemplateForTaskCreation?.title || ''}`}
                size="lg"
            >
                <form onSubmit={onSubmitCreateTaskFromTemplate} className="space-y-4">
                    <div>
                        <Label htmlFor="customTitle">Görev Başlığı (Opsiyonel, Varsayılan: Şablon Başlığı)</Label>
                        <Input id="customTitle" name="customTitle" type="text" defaultValue={selectedTemplateForTaskCreation?.title} />
                    </div>
                    <div>
                        <Label htmlFor="customDescription">Açıklama (Opsiyonel)</Label>
                        <Textarea id="customDescription" name="customDescription" rows={3} defaultValue={selectedTemplateForTaskCreation?.description || ''} />
                    </div>
                    <div>
                        <Label htmlFor="customPriority">Öncelik (Opsiyonel)</Label>
                        <Select id="customPriority" name="customPriority" defaultValue={selectedTemplateForTaskCreation?.priority}>
                            <option value="">Şablon Önceliği Kullan</option>
                            {Object.values(TemplatePriority)
                                .filter(value => typeof value === 'number')
                                .map((priorityValue) => (
                                    <option key={priorityValue} value={priorityValue}>
                                        {getPriorityText(priorityValue as TemplatePriority)}
                                    </option>
                                ))}
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="customCategoryId">Kategori (Opsiyonel)</Label>
                        <Select id="customCategoryId" name="customCategoryId" defaultValue={selectedTemplateForTaskCreation?.categoryId || ''}>
                            <option value="">Şablon Kategorisi Kullan</option>
                            {templatesData?.data?.templates[0]?.categoryName && (
                                <option key={selectedTemplateForTaskCreation?.categoryId} value={selectedTemplateForTaskCreation?.categoryId}>
                                    {selectedTemplateForTaskCreation?.categoryName}
                                </option>
                            )}
                            {queryClient.getQueryData(['categories'])?.data?.map((category: CategoryDto) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="dueDate">Bitiş Tarihi (Opsiyonel)</Label>
                        <Input id="dueDate" name="dueDate" type="datetime-local" />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateTaskFromTemplateModalOpen(false)} disabled={createTaskFromTemplateMutation.isPending}>
                            İptal
                        </Button>
                        <Button type="submit" disabled={createTaskFromTemplateMutation.isPending}>
                            {createTaskFromTemplateMutation.isPending ? 'Oluşturuluyor...' : 'Görevi Oluştur'}
                        </Button>
                    </div>
                </form>
            </Dialog>
        </div>
    );
};

export default Templates;