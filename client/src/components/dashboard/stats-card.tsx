import { Glassmorphism } from "@/components/ui/glassmorphism";

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    positive: boolean;
  };
  icon: string;
  color: "primary" | "secondary" | "accent";
}

export default function StatsCard({ title, value, trend, icon, color }: StatsCardProps) {
  const colorMap = {
    primary: "primary",
    secondary: "secondary",
    accent: "accent",
  };

  const colorClass = colorMap[color];

  return (
    <Glassmorphism className="p-4 rounded-lg border border-dark-400 hover:border-primary-500/30 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-400">{title}</h4>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-${colorClass}-500/10 text-${colorClass}-400`}>
          <span className="material-icons text-sm">{icon}</span>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <p className={`text-xs ${trend.positive ? 'text-accent-400' : 'text-destructive'} flex items-center`}>
              <span className="material-icons text-xs mr-1">
                {trend.positive ? 'trending_up' : 'trending_down'}
              </span>
              <span>{trend.value}</span>
            </p>
          )}
        </div>
      </div>
    </Glassmorphism>
  );
}
