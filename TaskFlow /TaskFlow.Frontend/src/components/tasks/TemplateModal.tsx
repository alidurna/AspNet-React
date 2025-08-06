import React, { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '../ui/Dialog';
import Input from '../ui/Input';
import { Button } from '../ui/Button';
import Label from '../ui/Label';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { templateAPI, categoryAPI } from '../../services/api';
import Toast from '../ui/Toast';
import type { ApiResponse } from '../../types/common';
import type { 
    CreateTaskTemplateDto, 
    TaskTemplateDto, 
    UpdateTaskTemplateDto
} from '../../types/tasks/template.types';
import { TemplatePriority } from '../../types/tasks/template.types';
import type { CategoryDto } from '../../types/tasks/category.types';

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    template?: TaskTemplateDto; // Mevcut şablonu düzenlemek için
}

const templateSchema = z.object({
    title: z.string().min(3, "Şablon başlığı en az 3 karakter olmalıdır").max(200, "Şablon başlığı en fazla 200 karakter olmalıdır"),
    description: z.string().max(1000, "Açıklama en fazla 1000 karakter olmalıdır").optional().or(z.literal('')), // Empty string allowed
    priority: z.nativeEnum(TemplatePriority, { required_error: "Öncelik seçimi zorunludur" }),
    categoryId: z.number().int().optional().nullable().transform(e => (e === 0 ? null : e)), // 0'ı null'a çevir
    tags: z.string().max(500, "Etiketler en fazla 500 karakter olmalıdır").optional().or(z.literal('')), // Empty string allowed
    notes: z.string().max(1000, "Notlar en fazla 1000 karakter olmalıdır").optional().or(z.literal('')), // Empty string allowed
    estimatedHours: z.number().int().min(1, "Tahmini süre en az 1 saat olmalıdır").max(1000, "Tahmini süre en fazla 1000 saat olabilir").optional(),
});

type TemplateFormInputs = z.infer<typeof templateSchema>;

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, template }) => {
    const queryClient = useQueryClient();
    const isEditing = !!template;

    const { data: categoriesData } = useQuery<ApiResponse<CategoryDto[]>>({
        queryKey: ['categories'],
        queryFn: () => categoryAPI.getCategories(),
    });

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TemplateFormInputs>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            title: '',
            description: '',
            priority: TemplatePriority.Normal,
            categoryId: null,
            tags: '',
            notes: '',
            estimatedHours: 1,
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (template) {
                reset({
                    title: template.title,
                    description: template.description || '',
                    priority: template.priority,
                    categoryId: template.categoryId || null,
                    tags: template.tags || '',
                    notes: template.notes || '',
                    estimatedHours: template.estimatedHours,
                });
            } else {
                reset();
            }
        }
    }, [isOpen, template, reset]);

    const createTemplateMutation = useMutation<ApiResponse<TaskTemplateDto>, Error, CreateTaskTemplateDto>({
        mutationFn: templateAPI.createTemplate,
        onSuccess: () => {
            Toast.success("Şablon başarıyla oluşturuldu!");
            queryClient.invalidateQueries({ queryKey: ['taskTemplates'] });
            onClose();
        },
        onError: (error) => {
            Toast.error(`Şablon oluşturulurken hata oluştu: ${error.message}`);
        },
    });

    const updateTemplateMutation = useMutation<ApiResponse<TaskTemplateDto>, Error, { templateId: number, updateDto: UpdateTaskTemplateDto }>({
        mutationFn: ({ templateId, updateDto }) => templateAPI.updateTemplate(templateId, updateDto),
        onSuccess: () => {
            Toast.success("Şablon başarıyla güncellendi!");
            queryClient.invalidateQueries({ queryKey: ['taskTemplates'] });
            onClose();
        },
        onError: (error) => {
            Toast.error(`Şablon güncellenirken hata oluştu: ${error.message}`);
        },
    });

    const onSubmit: SubmitHandler<TemplateFormInputs> = async (data) => {
        try {
            const templateData = {
                ...data,
                priority: Number(data.priority), // Ensure priority is a number
                categoryId: data.categoryId === null ? undefined : data.categoryId, // Convert null to undefined for API
                estimatedHours: data.estimatedHours || 1, // Default to 1 if undefined/null
            };

            if (isEditing && template) {
                await updateTemplateMutation.mutateAsync({ templateId: template.id, updateDto: templateData });
            } else {
                await createTemplateMutation.mutateAsync(templateData as CreateTaskTemplateDto);
            }
        } catch (error) {
            console.error("Form gönderilirken hata oluştu:", error);
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={isEditing ? "Şablonu Düzenle" : "Yeni Şablon Oluştur"} size="lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <Label htmlFor="title">Başlık</Label>
                    <Input id="title" type="text" {...register("title")} />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>
                <div>
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea id="description" {...register("description")} rows={3} />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>
                <div>
                    <Label htmlFor="priority">Öncelik</Label>
                    <Select id="priority" {...register("priority", { valueAsNumber: true })}>
                        {Object.values(TemplatePriority)
                            .filter(value => typeof value === 'number')
                            .map((priorityValue) => (
                                <option key={priorityValue} value={priorityValue}>
                                    {TemplatePriority[priorityValue as number]}
                                </option>
                            ))}
                    </Select>
                    {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>}
                </div>
                <div>
                    <Label htmlFor="categoryId">Kategori</Label>
                    <Select id="categoryId" {...register("categoryId", { valueAsNumber: true })}>
                        <option value="0">Kategori Seçin (Opsiyonel)</option>
                        {categoriesData?.data?.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </Select>
                    {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
                </div>
                <div>
                    <Label htmlFor="tags">Etiketler (Virgülle Ayrılmış)</Label>
                    <Input id="tags" type="text" {...register("tags")} />
                    {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags.message}</p>}
                </div>
                <div>
                    <Label htmlFor="notes">Notlar</Label>
                    <Textarea id="notes" {...register("notes")} rows={3} />
                    {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>}
                </div>
                <div>
                    <Label htmlFor="estimatedHours">Tahmini Süre (Saat)</Label>
                    <Input id="estimatedHours" type="number" {...register("estimatedHours", { valueAsNumber: true })} min={1} max={1000} />
                    {errors.estimatedHours && <p className="text-red-500 text-sm mt-1">{errors.estimatedHours.message}</p>}
                </div>
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        İptal
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Oluştur'}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
};

export default TemplateModal;