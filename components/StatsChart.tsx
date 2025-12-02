import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface StatsChartProps {
  data: number[];
}

export const StatsChart: React.FC<StatsChartProps> = ({ data }) => {
  const chartData = data.map((time, index) => ({
    attempt: index + 1,
    ms: time
  }));
  
  // 计算数据的最小值和最大值
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  
  // 将最小值向下取整到最近的10的倍数，最大值向上取整到最近的10的倍数
  const roundedMin = Math.floor(minValue / 10) * 10;
  const roundedMax = Math.ceil(maxValue / 10) * 10;
  
  // 计算间隔值并生成5条水平线的值
  const interval = (roundedMax - roundedMin) / 4;
  const horizontalLines = [roundedMin, roundedMin + interval, roundedMin + 2 * interval, roundedMin + 3 * interval, roundedMax];
  // 确保所有值都是10的倍数
  const adjustedLines = horizontalLines.map(value => Math.round(value / 10) * 10);

  return (
    <div className="h-48 md:h-64 w-full mt-4 md:mt-6 bg-white/5 rounded-xl p-3 md:p-4 pb-6 md:pb-8 border border-white/5">
      <h3 className="text-white/60 text-xs md:text-sm mb-2 md:mb-4 uppercase tracking-wider font-semibold">反应历史</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          {/* 使用ReferenceLine替代CartesianGrid，绘制5条水平线 */}
          {adjustedLines.map((value, index) => (
            <ReferenceLine 
              key={index} 
              y={value} 
              stroke="#334155" 
              strokeDasharray="3 3" 
              strokeWidth={1}
            />
          ))}
          <XAxis 
            dataKey="attempt" 
            stroke="#64748b" 
            tick={{fontSize: 12}} 
            tickLine={false}
            axisLine={false}
            dy={12}
          />
          <YAxis 
            stroke="#64748b" 
            tick={{fontSize: 12}} 
            tickLine={false}
            axisLine={false}
            domain={[adjustedLines[0], adjustedLines[4]]}
            ticks={adjustedLines}
            width={30}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#4ade80' }}
            formatter={(value: number) => [`${value} ms`, '反应时间']}
            cursor={{ stroke: '#475569', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="ms" 
            stroke="#4ade80" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#4ade80', strokeWidth: 0 }} 
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} 
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};