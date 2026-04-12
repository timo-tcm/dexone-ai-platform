'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

const trendConfig = {
  up:     { icon: TrendingUp,   color: 'text-green-500' },
  down:   { icon: TrendingDown, color: 'text-red-500'   },
  stable: { icon: Minus,        color: 'text-gray-400'  },
};

export default function MetricCard({ label, value, unit, trend, trendValue }: MetricCardProps) {
  const TrendIcon = trend ? trendConfig[trend].icon : null;
  const trendColor = trend ? trendConfig[trend].color : '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-1">
      <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold text-gray-800">{value}</span>
        {unit && <span className="text-sm text-gray-400 mb-0.5">{unit}</span>}
      </div>
      {TrendIcon && trendValue && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          <TrendIcon size={12} />
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}
