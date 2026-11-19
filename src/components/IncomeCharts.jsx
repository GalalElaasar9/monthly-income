import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { PieChart as PieIcon, BarChart3, Info } from 'lucide-react';
import { CATEGORIES } from '../constants';

export default function IncomeCharts({
  currentMonthIncomes,
  monthlyTrendData,
  currency,
  categoryBreakdown
}) {
  // Prepare data for the Category Pie/Donut Chart
  const pieData = categoryBreakdown.map((item) => {
    const meta = CATEGORIES.find((c) => c.id === item.category);
    return {
      name: meta ? meta.name : item.category,
      value: item.total,
      color: meta ? meta.color : '#94a3b8'
    };
  }).filter((item) => item.value > 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">{label || payload[0].name}</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
            {payload[0].value.toLocaleString('ar-EG')} {currency.symbol}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mb-8">
      
      {/* Monthly Trend - 7 Cols on Desktop, Full on Tablet/Mobile */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 lg:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm card-hover">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                مؤشر نمو الدخل عبر الأشهر
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                مقارنة إجمالي الدخل خلال الأشهر السابقة والحالية
              </p>
            </div>
          </div>
        </div>

        <div className="h-60 sm:h-72 w-full">
          {monthlyTrendData && monthlyTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis
                  dataKey="monthLabel"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="total"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
              <Info className="w-8 h-8 mb-2 opacity-50" />
              <span>لا تتوفر بيانات كافية لعرض الرسم البياني التراكمي</span>
            </div>
          )}
        </div>
      </div>

      {/* Sources Distribution - 5 Cols on Desktop, Full on Tablet/Mobile */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 lg:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm card-hover flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <PieIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                توزيع مصادر الدخل
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                نسبة كل فئة من إجمالي دخل الشهر
              </p>
            </div>
          </div>
        </div>

        <div className="h-60 sm:h-72 w-full flex-1 flex items-center justify-center">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
              <PieIcon className="w-8 h-8 mb-2 opacity-40 text-purple-400" />
              <p>لا توجد مدخولات مسجلة لهذا الشهر حتى الآن.</p>
              <p className="mt-1 text-slate-400 text-[11px]">اضغط على زر "تسجيل دخل جديد" لإضافة أول بند.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
