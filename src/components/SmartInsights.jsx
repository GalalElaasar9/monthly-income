import React from 'react';
import { Lightbulb, ShieldCheck, Zap, Layers, Sparkles } from 'lucide-react';

export default function SmartInsights({
  receivedTotal,
  overallTotal,
  incomes,
  currency,
  categoryBreakdown
}) {
  if (incomes.length === 0) return null;

  // Recurring vs variable ratio
  const recurringTotal = incomes
    .filter((i) => i.isRecurring)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const recurringPercent = overallTotal > 0 ? Math.round((recurringTotal / overallTotal) * 100) : 0;
  
  // Daily average for 30-day month
  const dailyAverage = Math.round(overallTotal / 30);

  // Diversification check
  const distinctCategories = categoryBreakdown.filter((c) => c.total > 0).length;

  return (
    <div className="bg-gradient-to-r from-emerald-900/10 via-teal-900/10 to-slate-900/5 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900/40 rounded-3xl p-4 sm:p-6 border border-emerald-200/60 dark:border-emerald-800/40 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          رؤى وتحليلات مالية ذكية لهذا الشهر
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        
        {/* Diversification */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <Layers className="w-4 h-4 text-emerald-500" />
            <span>تنويع مصادر الدخل</span>
          </div>
          <div className="text-base font-bold text-slate-800 dark:text-slate-100">
            {distinctCategories > 2 ? 'ممتاز (مصادر متعددة)' : 'متوسط (مركّز)'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            دخلك موزع على {distinctCategories} فئات مختلفة، مما يقلل المخاطر المالية.
          </p>
        </div>

        {/* Stability / Recurring */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-500" />
            <span>معدل الدخل الثابت المستقر</span>
          </div>
          <div className="text-base font-bold text-slate-800 dark:text-slate-100">
            {recurringPercent}% دخل دوري ثابت
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {recurringTotal.toLocaleString('ar-EG')} {currency.symbol} تأتيك كدخل ثابت مستقر ومضمون شهرياً.
          </p>
        </div>

        {/* Daily Rate */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>متوسط الإيراد اليومي</span>
          </div>
          <div className="text-base font-bold text-slate-800 dark:text-slate-100">
            {dailyAverage.toLocaleString('ar-EG')} {currency.symbol} / اليوم
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            معدل إيرادك اليومي التقديري خلال أيام هذا الشهر (30 يوماً).
          </p>
        </div>

      </div>
    </div>
  );
}
