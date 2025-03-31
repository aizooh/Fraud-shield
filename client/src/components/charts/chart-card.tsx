import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { ChartData } from '@/types';

interface ChartCardProps {
  title: string;
  description: string;
  chartType: 'bar' | 'line' | 'pie' | 'doughnut';
  chartData: ChartData;
  height?: number;
}

export default function ChartCard({ title, description, chartType, chartData, height = 300 }: ChartCardProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: chartType,
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
          },
        },
      });
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartType, chartData]);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
        <div className="chart-container mt-6" style={{ height: `${height}px` }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
}
