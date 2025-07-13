import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchAPI } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import {
  TaskFilterFormData,
  taskFilterSchema,
} from "../../schemas/taskSchemas";

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: TaskFilterFormData) => void;
}

const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
}) => {
  const { showSuccess, showError } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFilterFormData>({
    resolver: zodResolver(taskFilterSchema),
  });

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = async (data: TaskFilterFormData) => {
    try {
      const response = await searchAPI.advancedSearch(data);
      showSuccess("Arama başarıyla gerçekleştirildi!");
      onSearch(data);
      onClose();
    } catch (error) {
      showError("Arama sırasında bir hata oluştu.");
    }
  };

  if (!isOpen) return null;

  return <div>Gelişmiş Arama Modalı (Tasarım ve form buraya gelecek)</div>;
};

export default AdvancedSearchModal;
