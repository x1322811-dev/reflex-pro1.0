import React, { useEffect } from 'react';
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
  
  // 为了让图表看起来更美观，在最小值和最大值基础上增加一些边距
  const padding = (maxValue - minValue) * 0.1;
  const adjustedMin = Math.floor((minValue - padding) / 10) * 10;
  const adjustedMax = Math.ceil((maxValue + padding) / 10) * 10;
  
  // 计算间隔值并生成5条水平线的值，确保均等分布
  const interval = (adjustedMax - adjustedMin) / 4;
  const horizontalLines = [
    adjustedMin,
    adjustedMin + interval,
    adjustedMin + 2 * interval,
    adjustedMin + 3 * interval,
    adjustedMax
  ];

  // 使用useEffect添加CSS样式，防止图表区域被选中
  useEffect(() => {
    // 创建style元素
    const style = document.createElement('style');
    style.textContent = `
      /* 防止SVG元素被选中 */
      .stats-chart svg {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }
      /* 允许点被选中 */
      .stats-chart .recharts-dot,
      .stats-chart .recharts-active-dot {
        user-select: all;
        -webkit-user-select: all;
        -moz-user-select: all;
        -ms-user-select: all;
        pointer-events: all;
      }
    `;
    
    // 添加到head
    document.head.appendChild(style);
    
    // 清理
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="h-48 md:h-64 w-full mt-4 md:mt-6 bg-white/5 rounded-xl p-3 md:p-4 pb-6 md:pb-8 border border-white/5 stats-chart">
      <h3 className="text-white/60 text-xs md:text-sm mb-2 md:mb-4 uppercase tracking-wider font-semibold">反应历史</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          {/* 使用ReferenceLine替代CartesianGrid，绘制5条水平线 */}
          {horizontalLines.map((value, index) => (
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
            domain={[horizontalLines[0], horizontalLines[4]]}
            ticks={horizontalLines}
            width={40} // 增加宽度以确保数字完整显示
            tickFormatter={(value) => Math.round(value).toString()} // 四舍五入显示整数
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