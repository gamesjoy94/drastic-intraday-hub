
import { TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, change, trend, icon }: MetricCardProps) => {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-yellow-400';
  const trendBg = trend === 'up' ? 'bg-green-400/10' : trend === 'down' ? 'bg-red-400/10' : 'bg-yellow-400/10';

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className={`text-xs flex items-center gap-1 mt-1 ${trendColor} ${trendBg} px-2 py-1 rounded-full w-fit`}>
          {trend === 'up' && <TrendingUp className="w-3 h-3" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3" />}
          {change}
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardMetrics = () => {
  // Simulated trading metrics
  const metrics = [
    {
      title: "Daily P&L",
      value: "+$2,847.50",
      change: "+12.4%",
      trend: 'up' as const,
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      title: "Win Rate",
      value: "73.2%",
      change: "+2.1%",
      trend: 'up' as const,
      icon: <Target className="w-4 h-4" />
    },
    {
      title: "Active Positions",
      value: "3",
      change: "2 Long, 1 Short",
      trend: 'neutral' as const,
      icon: <Activity className="w-4 h-4" />
    },
    {
      title: "Total Portfolio",
      value: "$47,392.15",
      change: "+8.7%",
      trend: 'up' as const,
      icon: <TrendingUp className="w-4 h-4" />
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};

export default DashboardMetrics;
