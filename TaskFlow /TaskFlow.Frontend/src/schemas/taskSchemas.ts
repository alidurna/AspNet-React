/**
 * Task Validation Schemas - TaskFlow
 *
 * Zod kullanarak görev formları için validation schemas.
 * Create, update, search ve filter formları için type-safe validation.
 */

import { z } from "zod";

/**
 * Priority Enum Schema
 */
export const prioritySchema = z.enum(["Low", "Normal", "High", "Critical"], {
  errorMap: () => ({ message: "Geçerli bir öncelik seviyesi seçiniz" }),
});

/**
 * Create Task Form Validation Schema
 */
export const createTaskSchema = z
  .object({
    title: z
      .string()
      .min(1, "Görev başlığı gereklidir")
      .min(3, "Görev başlığı en az 3 karakter olmalıdır")
      .max(200, "Görev başlığı çok uzun"),

    description: z.string().max(2000, "Açıklama çok uzun").optional(),

    priority: prioritySchema.default("Normal"),

    categoryId: z
      .number({ errorMap: () => ({ message: "Kategori seçimi gereklidir" }) })
      .min(1, "Geçerli bir kategori seçiniz"),

    dueDate: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true;
        const date = new Date(val);
        return date > new Date();
      }, "Bitiş tarihi gelecekte olmalıdır"),

    reminderDate: z.string().optional(),

    startDate: z.string().optional(),

    tags: z
      .string()
      .max(500, "Etiketler çok uzun")
      .optional()
      .refine((val) => {
        if (!val) return true;
        const tags = val.split(",").map((tag) => tag.trim());
        return tags.every((tag) => tag.length <= 50);
      }, "Her etiket en fazla 50 karakter olabilir"),

    notes: z.string().max(1000, "Notlar çok uzun").optional(),

    estimatedMinutes: z
      .number()
      .min(1, "Tahmini süre en az 1 dakika olmalıdır")
      .max(10080, "Tahmini süre en fazla 1 hafta (10080 dakika) olabilir")
      .optional(),

    parentTaskId: z.number().optional(),
  })
  .refine(
    (data) => {
      // Reminder date due date'ten önce olmalı
      if (data.reminderDate && data.dueDate) {
        return new Date(data.reminderDate) < new Date(data.dueDate);
      }
      return true;
    },
    {
      message: "Hatırlatma tarihi bitiş tarihinden önce olmalıdır",
      path: ["reminderDate"],
    }
  )
  .refine(
    (data) => {
      // Start date due date'ten önce olmalı
      if (data.startDate && data.dueDate) {
        return new Date(data.startDate) <= new Date(data.dueDate);
      }
      return true;
    },
    {
      message: "Başlangıç tarihi bitiş tarihinden önce veya aynı gün olmalıdır",
      path: ["startDate"],
    }
  );

/**
 * Update Task Form Validation Schema
 * Note: createTaskSchema'nın refine'ları ZodEffects oluşturduğu için partial direkt çalışmaz
 * Bu yüzden basit bir update schema kullanıyoruz
 */
export const updateTaskSchema = z.object({
  id: z.number().min(1, "Geçerli bir görev ID gereklidir"),
  title: z
    .string()
    .min(3, "Görev başlığı en az 3 karakter olmalıdır")
    .max(200, "Görev başlığı çok uzun")
    .optional(),
  description: z.string().max(2000, "Açıklama çok uzun").optional(),
  priority: prioritySchema.optional(),
  categoryId: z.number().min(1, "Geçerli bir kategori seçiniz").optional(),
  dueDate: z.string().optional(),
  reminderDate: z.string().optional(),
  startDate: z.string().optional(),
  tags: z.string().max(500, "Etiketler çok uzun").optional(),
  notes: z.string().max(1000, "Notlar çok uzun").optional(),
  estimatedMinutes: z.number().min(1).max(10080).optional(),
  parentTaskId: z.number().optional(),
});

/**
 * Quick Task Creation Schema (sadece title ve category)
 */
export const quickTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Görev başlığı gereklidir")
    .min(3, "Görev başlığı en az 3 karakter olmalıdır")
    .max(200, "Görev başlığı çok uzun"),

  categoryId: z
    .number({ errorMap: () => ({ message: "Kategori seçimi gereklidir" }) })
    .min(1, "Geçerli bir kategori seçiniz"),

  priority: prioritySchema.default("Normal"),
});

/**
 * Task Filter Form Validation Schema
 */
export const taskFilterSchema = z
  .object({
    searchText: z.string().max(200, "Arama metni çok uzun").optional(),

    isCompleted: z.boolean().optional(),

    categoryId: z.number().optional(),

    priority: z.string().optional(),

    dueDateFrom: z.string().optional(),

    dueDateTo: z.string().optional(),

    onlyParentTasks: z.boolean().optional(),

    sortBy: z
      .enum(["title", "priority", "dueDate", "createdAt", "updatedAt"])
      .optional(),

    sortAscending: z.boolean().optional(),

    page: z.number().min(1, "Sayfa numarası en az 1 olmalıdır").optional(),

    pageSize: z
      .number()
      .min(5, "Sayfa boyutu en az 5 olmalıdır")
      .max(100, "Sayfa boyutu en fazla 100 olabilir")
      .optional(),
  })
  .refine(
    (data) => {
      // dueDateTo dueDateFrom'dan sonra olmalı
      if (data.dueDateFrom && data.dueDateTo) {
        return new Date(data.dueDateTo) >= new Date(data.dueDateFrom);
      }
      return true;
    },
    {
      message: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır",
      path: ["dueDateTo"],
    }
  );

/**
 * Task Progress Update Schema
 */
export const taskProgressSchema = z.object({
  completionPercentage: z
    .number()
    .min(0, "Tamamlanma yüzdesi 0'dan küçük olamaz")
    .max(100, "Tamamlanma yüzdesi 100'den büyük olamaz"),

  notes: z.string().max(500, "Progress notu çok uzun").optional(),
});

/**
 * Task Completion Schema
 */
export const taskCompletionSchema = z.object({
  isCompleted: z.boolean(),

  completionNotes: z.string().max(500, "Tamamlama notu çok uzun").optional(),

  actualMinutes: z
    .number()
    .min(0, "Geçen süre negatif olamaz")
    .max(100000, "Geçen süre çok büyük")
    .optional(),
});

/**
 * Task Comment Schema
 */
export const taskCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Yorum içeriği gereklidir")
    .min(3, "Yorum en az 3 karakter olmalıdır")
    .max(1000, "Yorum çok uzun"),

  taskId: z.number().min(1, "Geçerli bir görev ID gereklidir"),
});

/**
 * Bulk Task Operations Schema
 */
export const bulkTaskOperationSchema = z.object({
  taskIds: z
    .array(z.number().min(1))
    .min(1, "En az bir görev seçilmelidir")
    .max(50, "En fazla 50 görev seçilebilir"),

  operation: z.enum([
    "complete",
    "incomplete",
    "delete",
    "archive",
    "changePriority",
    "changeCategory",
    "addTags",
    "removeTags",
  ]),

  // Optional parameters for specific operations
  newPriority: prioritySchema.optional(),
  newCategoryId: z.number().optional(),
  tagsToAdd: z.string().max(500).optional(),
  tagsToRemove: z.string().max(500).optional(),
});

/**
 * Task Search Schema
 */
export const taskSearchSchema = z.object({
  query: z
    .string()
    .min(1, "Arama terimi gereklidir")
    .min(2, "Arama terimi en az 2 karakter olmalıdır")
    .max(200, "Arama terimi çok uzun"),

  searchIn: z
    .array(z.enum(["title", "description", "tags", "notes"]))
    .min(1, "En az bir arama alanı seçilmelidir")
    .default(["title", "description"]),

  maxResults: z
    .number()
    .min(5, "En az 5 sonuç gösterilmelidir")
    .max(100, "En fazla 100 sonuç gösterilebilir")
    .default(20),
});

/**
 * Task Time Tracking Schema
 */
export const timeTrackingSchema = z
  .object({
    taskId: z.number().min(1, "Geçerli bir görev ID gereklidir"),

    startTime: z.string().datetime("Geçerli bir tarih-saat formatı giriniz"),

    endTime: z
      .string()
      .datetime("Geçerli bir tarih-saat formatı giriniz")
      .optional(),

    description: z.string().max(500, "Açıklama çok uzun").optional(),

    isBreak: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // End time start time'dan sonra olmalı
      if (data.endTime) {
        return new Date(data.endTime) > new Date(data.startTime);
      }
      return true;
    },
    {
      message: "Bitiş zamanı başlangıç zamanından sonra olmalıdır",
      path: ["endTime"],
    }
  );

// Export types for TypeScript
export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;
export type QuickTaskFormData = z.infer<typeof quickTaskSchema>;
export type TaskFilterFormData = z.infer<typeof taskFilterSchema>;
export type TaskProgressFormData = z.infer<typeof taskProgressSchema>;
export type TaskCompletionFormData = z.infer<typeof taskCompletionSchema>;
export type TaskCommentFormData = z.infer<typeof taskCommentSchema>;
export type BulkTaskOperationFormData = z.infer<typeof bulkTaskOperationSchema>;
export type TaskSearchFormData = z.infer<typeof taskSearchSchema>;
export type TimeTrackingFormData = z.infer<typeof timeTrackingSchema>;
export type Priority = z.infer<typeof prioritySchema>;
