import React from 'react';
import Card from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subvalue,
  icon: Icon,
  iconColor = 'text-[#13A89E]',
  iconBg = 'bg-[#E6F7F6]',
  trend,
  trendType = 'up', // 'up', 'down', 'neutral'
  badgeText,
  onClick
}) {
  return (
    <Card hoverEffect={!!onClick} onClick={onClick} className="p-5 relative overflow-hidden bg-white">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wider text-[#718096] uppercase">{title}</p>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-extrabold tracking-tight text-[#142B4A]">{value}</span>
            {subvalue && <span className="text-xs font-medium text-[#718096]">{subvalue}</span>}
          </div>
        </div>

        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
            <Icon className="w-6 h-6 stroke-[2]" />
          </div>
        )}
      </div>

      {(trend || badgeText) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {trend && (
            <div
              className={`flex items-center gap-1 font-semibold ${
                trendType === 'up'
                  ? 'text-[#16A37B]'
                  : trendType === 'down'
                  ? 'text-[#DC5555]'
                  : 'text-[#718096]'
              }`}
            >
              {trendType === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
              {trendType === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
              <span>{trend}</span>
            </div>
          )}
          {badgeText && (
            <span className="text-[#718096] font-medium ml-auto">{badgeText}</span>
          )}
        </div>
      )}
    </Card>
  );
}
