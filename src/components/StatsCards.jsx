import React from 'react';
import {
  Wallet,
  Clock,
  TrendingUp,
  Target,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Plus,
  Coins,
  Receipt
} from 'lucide-react';
import { CATEGORIES } from '../constants';

export default function StatsCards({
  receivedTotal,
  pendingTotal,
  overallTotal,
  totalWithdrawn = 0,
  netRemaining = 0,
  withdrawalsCount = 0,
  onOpenWithdrawalModal,
  onSwitchToWithdrawals,
  monthlyGoal,
  onOpenGoalModal,
  currency,
  categoryBreakdown,
  itemCount
}) {
  const goalPercentage = monthlyGoal > 0 ? Math.min(Math.round((receivedTotal / monthlyGoal) * 100), 100) : 0;
  const rawGoalPercentage = monthlyGoal > 0 ? Math.round((receivedTotal / monthlyGoal) * 100) : 0;

  // Retention rate: how much of received income is left after withdrawals
  const retentionPercent = receivedTotal > 0
    ? Math.max(0, Math.round((netRemaining / receivedTotal) * 100))
    : (totalWithdrawn > 0 ? 0 : 100);

  // Find top contributing category
  const topCategoryItem = categoryBreakdown && categoryBreakdown.length > 0
    ? [...categoryBreakdown].sort((a, b) => b.total - a.total)[0]
    : null;
    
  const topCategoryMeta = topCategoryItem ? CATEGORIES.find(c => c.id === topCategoryItem.category) : null;
  const topCategoryPercent = overallTotal > 0 && topCategoryItem ? Math.round((topCategoryItem.total / overallTotal) * 100) : 0;

  return (
    <div className="space-y-4 sm:space-y-5 mb-8">
      
      {/* Primary Cashflow & Net Balance Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
        
        {/* 1. Net Remaining Balance (صافي الدخل المتبقي) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 dark:from-slate-900 dark:via-emerald-950/20 dark:to-teal-950/30 p-5 sm:p-6 border border-emerald-500/30 dark:border-emerald-500/30 shadow-md shadow-emerald-500/5 card-hover transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700/60 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>صافي الرصيد المتبقي (بعد السحب)</span>
            </span>

            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              متبقي {retentionPercent}%
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              الدخل المحصل ناقص إجمالي المبالغ المسحوبة
            </p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className={`text-3xl sm:text-4xl font-black tracking-tight ${
                netRemaining < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
              }`}>
                {netRemaining.toLocaleString('ar-EG')}
              </span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {currency.symbol}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
            <span>المحصل: <strong className="text-slate-800 dark:text-slate-200 font-bold">{receivedTotal.toLocaleString('ar-EG')}</strong> {currency.symbol}</span>
            <span>المسحوب: <strong className="text-rose-600 dark:text-rose-400 font-bold">{totalWithdrawn.toLocaleString('ar-EG')}</strong> {currency.symbol}</span>
          </div>
        </div>

        {/* 2. Total Withdrawals & Expenses (إجمالي المسحوبات والمصروفات) */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm card-hover hover:border-rose-500/40 hover:shadow-xl hover:shadow-rose-500/5 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 px-3 py-1 rounded-full flex items-center gap-1.5">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
              <span>إجمالي المسحوبات والمصروفات</span>
            </span>

            <button
              onClick={onOpenWithdrawalModal}
              className="flex items-center gap-1 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-md shadow-rose-500/20 transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>تسجيل سحب</span>
            </button>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              المبالغ الشخصية والمصروفات التي تم سحبها هذا الشهر
            </p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {totalWithdrawn.toLocaleString('ar-EG')}
              </span>
              <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                {currency.symbol}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
            <span>عدد عمليات السحب: <strong className="text-slate-700 dark:text-slate-300 font-bold">{withdrawalsCount} {withdrawalsCount === 1 ? 'عملية' : 'عمليات'}</strong></span>
            {onSwitchToWithdrawals && (
              <button
                type="button"
                onClick={onSwitchToWithdrawals}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 active:scale-95"
              >
                <span>عرض صفحة المسحوبات ⬅️</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Secondary 4 KPI Cards: Income Streams & Goal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        
        {/* 1. Received Income */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm card-hover hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              مُستلم بالفعل
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">إجمالي الدخل المحصل</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {receivedTotal.toLocaleString('ar-EG')}
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {currency.symbol}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>عدد الدفعات:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{itemCount.received} دفعة</span>
          </div>
        </div>

        {/* 2. Pending / Expected Income */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm card-hover hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              قيد الانتظار
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">مستحقات متوقعة للشهر</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {pendingTotal.toLocaleString('ar-EG')}
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {currency.symbol}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>دفعات معلقة:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{itemCount.pending} دفعة</span>
          </div>
        </div>

        {/* 3. Total Monthly Income (Received + Pending) */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm card-hover hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 px-2.5 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              إجمالي الدخل
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">المجموع الكلي للشهر</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {overallTotal.toLocaleString('ar-EG')}
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {currency.symbol}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>أكبر مساهمة:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
              {topCategoryMeta ? `${topCategoryMeta.name}` : 'لا توجد بيانات'}
            </span>
          </div>
        </div>

        {/* 4. Monthly Goal Progress */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm card-hover hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onOpenGoalModal}
              className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-indigo-100 transition active:scale-95"
            >
              <Target className="w-3.5 h-3.5" />
              <span>الهدف الشهري</span>
              <Edit2 className="w-2.5 h-2.5 mr-0.5" />
            </button>
            
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {rawGoalPercentage}%
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {monthlyGoal > 0 ? `الهدف: ${monthlyGoal.toLocaleString('ar-EG')} ${currency.symbol}` : 'حدد هدفك'}
            </p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {rawGoalPercentage >= 100 ? 'تم الإنجاز! 🎉' : `${goalPercentage}%`}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  rawGoalPercentage >= 100
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-indigo-500 to-blue-500'
                }`}
                style={{ width: `${Math.min(goalPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
