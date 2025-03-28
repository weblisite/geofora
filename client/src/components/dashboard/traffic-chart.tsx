import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { 
  Chart,
  LineController, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Tooltip, 
  Legend, 
  Filler
} from "chart.js";
import { formatNumber } from "@/lib/utils";

// Register Chart.js components
Chart.register(
  LineController, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Tooltip, 
  Legend, 
  Filler
);

type TimeRange = "daily" | "weekly" | "monthly";

// Chart data types
interface TrafficData {
  labels: string[];
  data: number[];
}

export default function TrafficChart() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");

  // Fetch traffic data based on selected time range
  const { data: trafficData, isLoading } = useQuery<TrafficData>({
    queryKey: [`/api/analytics/traffic/${timeRange}`],
  });

  useEffect(() => {
    if (!chartRef.current || !trafficData) return;

    // Destroy existing chart to prevent memory leaks
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Create gradient for area under the line
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: trafficData.labels,
        datasets: [{
          label: 'Traffic',
          data: trafficData.data,
          borderColor: '#6366f1',
          backgroundColor: gradient,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#6366f1',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#6366f1',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(30, 31, 53, 0.9)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(99, 102, 241, 0.3)',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return `Views: ${formatNumber(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              color: '#9ca3af'
            }
          },
          y: {
            grid: {
              color: 'rgba(75, 85, 99, 0.2)',
              drawBorder: false,
            },
            ticks: {
              color: '#9ca3af',
              callback: function(value) {
                return formatNumber(Number(value));
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [trafficData]);

  // Only use real data from the database
  const displayData = trafficData;

  return (
    <Glassmorphism className="p-4 rounded-lg border border-dark-400 h-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">Traffic Overview</h4>
        <div className="flex items-center space-x-2">
          <button 
            className={`px-2 py-1 text-xs rounded-full ${timeRange === 'daily' ? 'bg-primary-500/10 text-primary-400' : 'bg-dark-400 text-gray-300'}`}
            onClick={() => setTimeRange("daily")}
          >
            Daily
          </button>
          <button 
            className={`px-2 py-1 text-xs rounded-full ${timeRange === 'weekly' ? 'bg-primary-500/10 text-primary-400' : 'bg-dark-400 text-gray-300'}`}
            onClick={() => setTimeRange("weekly")}
          >
            Weekly
          </button>
          <button 
            className={`px-2 py-1 text-xs rounded-full ${timeRange === 'monthly' ? 'bg-primary-500/10 text-primary-400' : 'bg-dark-400 text-gray-300'}`}
            onClick={() => setTimeRange("monthly")}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="h-64 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-primary-500 rounded-full"></div>
          </div>
        ) : (
          <canvas ref={chartRef} />
        )}
      </div>
    </Glassmorphism>
  );
}
