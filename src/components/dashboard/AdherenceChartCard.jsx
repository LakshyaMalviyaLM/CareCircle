import Card from '../common/Card';
import Badge from '../common/Badge';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { useCare } from '../../context/CareContext';
import { TrendingUp, Award } from 'lucide-react';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#142B4A] text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
        <p className="font-bold text-teal-300">{label}</p>
        <p className="font-semibold text-white">
          Adherence: <span className="text-emerald-400">{payload[0].value}%</span>
        </p>
        <div className="text-[11px] text-slate-300 pt-1 border-t border-white/10 flex justify-between gap-4">
          <span>Taken: {payload[0].payload.taken} doses</span>
          <span>Missed: {payload[0].payload.missed} doses</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function AdherenceChartCard() {
  const { weeklyAdherenceData } = useCare();

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#142B4A]">Medication Adherence</h3>
            <Badge variant="accent" size="sm">
              7-Day Track
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Weekly prescription compliance vs clinical threshold (90% target)
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#13A89E]"></span>
            <span className="text-slate-600">Daily Compliance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-400"></span>
            <span className="text-slate-600">Clinical Target (90%)</span>
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-64 w-full mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weeklyAdherenceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="adherenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#13A89E" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#13A89E" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
            />
            <YAxis
              domain={[60, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748B', fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={90} stroke="#F87171" strokeDasharray="4 4" strokeWidth={1.5} />
            <Area
              type="monotone"
              dataKey="adherence"
              stroke="#13A89E"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#adherenceGradient)"
              activeDot={{ r: 6, fill: '#142B4A', stroke: '#13A89E', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom KPI stats */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-center">
        <div className="p-2">
          <span className="text-[11px] text-slate-400 block font-medium uppercase">Weekly Average</span>
          <span className="text-lg font-bold text-[#142B4A]">93.1%</span>
        </div>
        <div className="p-2 border-x border-slate-100">
          <span className="text-[11px] text-slate-400 block font-medium uppercase">Trend</span>
          <span className="text-lg font-bold text-emerald-600 flex items-center justify-center gap-1">
            <TrendingUp className="w-4 h-4" /> +4.2%
          </span>
        </div>
        <div className="p-2">
          <span className="text-[11px] text-slate-400 block font-medium uppercase">Safety Score</span>
          <span className="text-lg font-bold text-[#13A89E] flex items-center justify-center gap-1">
            <Award className="w-4 h-4" /> Grade A
          </span>
        </div>
      </div>
    </Card>
  );
}
