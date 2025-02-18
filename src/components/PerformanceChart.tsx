
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceData {
  date: string;
  wpm: number;
  accuracy: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  return (
    <div className="w-full h-[300px] bg-black/30 p-4 rounded-xl backdrop-blur-sm border border-border/50">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="date" 
            stroke="#666"
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis yAxisId="left" stroke="#9b87f5" />
          <YAxis yAxisId="right" orientation="right" stroke="#0EA5E9" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              border: '1px solid #333',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="wpm"
            name="WPM"
            stroke="#9b87f5"
            activeDot={{ r: 8 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="accuracy"
            name="Accuracy %"
            stroke="#0EA5E9"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
