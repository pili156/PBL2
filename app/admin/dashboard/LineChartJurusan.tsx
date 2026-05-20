"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function LineChartJurusan({ data }: { data: any[] }) {
  return (
    <div className="h-72 w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          {/* Garis bantu horizontal */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          
          {/* Sumbu X (Nama Jurusan) */}
          <XAxis 
            dataKey="jurusan" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            dy={10}
          />
          
          {/* Sumbu Y (Jumlah Dosen) */}
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            allowDecimals={false} // Agar angkanya bulat
          />
          
          {/* Tooltip saat di-hover */}
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
            formatter={(value) => [`${value} Dosen`, 'Total']}
          />
          
          {/* Garis Grafiknya */}
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#2563eb" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#ffffff', strokeWidth: 2, stroke: '#2563eb' }}
            activeDot={{ r: 6, fill: '#2563eb', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}