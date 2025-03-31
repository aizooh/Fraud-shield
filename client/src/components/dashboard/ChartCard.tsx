import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { ChartData } from "@/types";

interface ChartCardProps {
  title: string;
  description: string;
  chartType: "bar" | "line" | "pie" | "doughnut";
  data: ChartData;
}

export default function ChartCard({ title, description, chartType, data }: ChartCardProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    chartInstance.current = new Chart(ctx, {
      type: chartType,
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
    
    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartType, data]);

  return (
    <Card className="shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full relative">
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
