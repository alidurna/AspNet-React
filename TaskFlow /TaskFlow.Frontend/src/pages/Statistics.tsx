import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";

const Statistics: React.FC = () => {
  return (
    <DashboardLayout title="İstatistikler" breadcrumbs={[{ name: "İstatistikler" }]}> 
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-2xl font-bold mb-4">İstatistikler</h2>
        <p className="text-gray-600">Bu sayfa yakında istatistiksel verilerle güncellenecek.</p>
      </div>
    </DashboardLayout>
  );
};

export default Statistics; 