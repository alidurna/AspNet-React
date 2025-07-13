import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchAPI } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import * as taskSchemas from "../../schemas/taskSchemas";
import type { TaskSearchRequest } from "../../services/api";

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: TaskSearchRequest) => void;
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
  } = useForm<taskSchemas.TaskFilterFormData>({
    resolver: zodResolver(taskSchemas.taskFilterSchema),
  });

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = async (data: taskSchemas.TaskFilterFormData) => {
    try {
      const request: TaskSearchRequest = {
        query: data.searchText,
        priority: data.priority as any,
        isCompleted: data.isCompleted,
        categoryId: data.categoryId,
        dueDateStart: data.dueDateFrom,
        dueDateEnd: data.dueDateTo,
        sortBy: data.sortBy,
        sortOrder: data.sortAscending ? "asc" : "desc",
        page: data.page,
        pageSize: data.pageSize,
      };
      await searchAPI.searchTasks(request);
      showSuccess("Arama başarıyla gerçekleştirildi!");
      onSearch(request);
      onClose();
    } catch (error) {
      showError("Arama sırasında bir hata oluştu.");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.4)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',borderRadius:8,padding:24,minWidth:340,maxWidth:400,width:'100%',boxShadow:'0 2px 16px rgba(0,0,0,0.15)'}}>
        <h2 style={{fontSize:20,fontWeight:600,marginBottom:16}}>Gelişmiş Arama</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{marginBottom:12}}>
            <label>Arama Metni</label>
            <input type="text" {...register("searchText")} style={{width:'100%',padding:6,border:'1px solid #ccc',borderRadius:4}} />
            {errors.searchText && <div style={{color:'red',fontSize:12}}>{errors.searchText.message}</div>}
          </div>
          <div style={{marginBottom:12}}>
            <label>Kategori ID</label>
            <input type="number" {...register("categoryId", { valueAsNumber: true })} style={{width:'100%',padding:6,border:'1px solid #ccc',borderRadius:4}} />
            {errors.categoryId && <div style={{color:'red',fontSize:12}}>{errors.categoryId.message}</div>}
          </div>
          <div style={{marginBottom:12}}>
            <label>Öncelik</label>
            <select {...register("priority")} style={{width:'100%',padding:6,border:'1px solid #ccc',borderRadius:4}}>
              <option value="">Tümü</option>
              <option value="Low">Düşük</option>
              <option value="Normal">Normal</option>
              <option value="High">Yüksek</option>
              <option value="Critical">Kritik</option>
            </select>
            {errors.priority && <div style={{color:'red',fontSize:12}}>{errors.priority.message}</div>}
          </div>
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <div style={{flex:1}}>
              <label>Başlangıç Tarihi</label>
              <input type="date" {...register("dueDateFrom")} style={{width:'100%',padding:6,border:'1px solid #ccc',borderRadius:4}} />
            </div>
            <div style={{flex:1}}>
              <label>Bitiş Tarihi</label>
              <input type="date" {...register("dueDateTo")} style={{width:'100%',padding:6,border:'1px solid #ccc',borderRadius:4}} />
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <label>Tamamlandı mı?</label>
            <select {...register("isCompleted")} style={{width:'100%',padding:6,border:'1px solid #ccc',borderRadius:4}}>
              <option value="">Tümü</option>
              <option value="true">Evet</option>
              <option value="false">Hayır</option>
            </select>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20}}>
            <button type="button" onClick={onClose} style={{padding:'8px 16px',background:'#eee',border:'none',borderRadius:4}}>İptal</button>
            <button type="submit" style={{padding:'8px 16px',background:'#2563eb',color:'#fff',border:'none',borderRadius:4}}>Ara</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancedSearchModal;
