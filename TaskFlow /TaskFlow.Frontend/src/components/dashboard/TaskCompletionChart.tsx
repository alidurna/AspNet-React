import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

/**
 * @interface TaskCompletionChartProps
 * @description Görev tamamlama grafiği bileşeninin prop'larını tanımlar.
 * @property {number} completedTasks - Tamamlanmış görev sayısı.
 * @property {number} totalTasks - Toplam görev sayısı.
 */
interface TaskCompletionChartProps {
  completedTasks: number;
  totalTasks: number;
}

/**
 * @function TaskCompletionChart
 * @description Kullanıcıya görev tamamlama istatistiklerini gösteren bir pasta grafik bileşeni.
 * Bu bileşen, tamamlanmış ve tamamlanmamış görevlerin oranını görselleştirir.
 * Recharts kütüphanesi kullanılarak interaktif ve duyarlı bir grafik sunulur.
 *
 * @param {TaskCompletionChartProps} props - completedTasks ve totalTasks içeren prop'lar.
 * @returns {JSX.Element} Görev tamamlama pasta grafiği.
 */
const TaskCompletionChart = ({ completedTasks, totalTasks }: TaskCompletionChartProps) => {
  // Tamamlanmamış görev sayısını hesaplar.
  const pendingTasks = totalTasks - completedTasks;

  // Grafik için veri dizisini oluşturur.
  // Her bir veri noktası, görev türünü (tamamlandı/beklemede) ve sayısını içerir.
  const data = [
    { name: 'Tamamlandı', value: completedTasks },
    { name: 'Beklemede', value: pendingTasks },
  ];

  // Pasta grafik dilimleri için renkleri tanımlar.
  const COLORS = ['#82ca9d', '#FF8042']; // Yeşil: tamamlandı, Turuncu: beklemede

  // Hiç görev yoksa veya tüm görevler tamamlanmışsa özel bir mesaj gösterir.
  if (totalTasks === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Henüz görev bulunmamaktadır.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name}: ${percent !== undefined ? (percent * 100).toFixed(0) : 'N/A'}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default TaskCompletionChart; 