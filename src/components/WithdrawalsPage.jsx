import React, { useState, useMemo } from 'react';
import {
  ArrowDownRight,
  Plus,
  Trash2,
  Edit,
  Calendar,
  Search,
  Filter,
  TrendingDown,
  Coins,
  ArrowUpRight,
  Sparkles,
  PieChart,
  FileText,
  AlertCircle,
  Receipt
} from 'lucide-react';

export default function WithdrawalsPage({
  withdrawals = [],
  receivedTotal = 0,
  netRemaining = 0,
  currentMonthName = '',
  selectedMonth = '',
  currency,
  onOpenAddWithdrawal,
  onEditWithdrawal,
  onDeleteWithdrawal,
  onSwitchToIncomes,
  openConfirm,
  showToast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, amount-desc, amount-asc

  // Total withdrawn this month
  const totalWithdrawn = useMemo(() => {
    return withdrawals.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
  }, [withdrawals]);

  // Max single withdrawal
  const highestWithdrawal = useMemo(() => {
    if (withdrawals.length === 0) return null;
    return [...withdrawals].sort((a, b) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0))[0];
  }, [withdrawals]);

  // Average withdrawal
  const averageWithdrawal = useMemo(() => {
    if (withdrawals.length === 0) return 0;
    return Math.round(totalWithdrawn / withdrawals.length);
  }, [totalWithdrawn, withdrawals]);

  // Percentage of received income withdrawn
  const withdrawnPercent = receivedTotal > 0
    ? Math.min(100, Math.round((totalWithdrawn / receivedTotal) * 100))
    : (totalWithdrawn > 0 ? 100 : 0);

  // Filtered and Sorted Withdrawals
  const filteredWithdrawals = useMemo(() => {
    let result = withdrawals.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      const matchReason = (item.reason || '').toLowerCase().includes(q);
      const matchNotes = (item.notes || '').toLowerCase().includes(q);
      const matchDate = (item.date || '').includes(q);
      const matchAmount = String(item.amount || '').includes(q);
      return matchReason || matchNotes || matchDate || matchAmount;
    });

    result.sort((a, b) => {
      if (sortBy === 'date-desc') return (b.date || '').localeCompare(a.date || '');
      if (sortBy === 'date-asc') return (a.date || '').localeCompare(b.date || '');
      if (sortBy === 'amount-desc') return (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0);
      if (sortBy === 'amount-asc') return (parseFloat(a.amount) || 0) - (parseFloat(b.amount) || 0);
      return 0;
    });

    return result;
  }, [withdrawals, searchQuery, sortBy]);

  const handleDeleteClick = (withdrawal) => {
    openConfirm({
      title: 'حذف عملية السحب',
      message: `هل أنت متأكد من حذف عملية سحب مبلغ ${withdrawal.amount.toLocaleString('ar-EG')} ${currency.symbol} (${withdrawal.reason})؟`,
      confirmText: 'نعم، حذف',
      isDanger: true,
      onConfirm: () => {
        onDeleteWithdrawal(withdrawal.id);
        showToast('تم حذف عملية السحب بنجاح', 'info');
      }
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-rose-500/20 shrink-0">
            <ArrowDownRight className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                إدارة المسحوبات والمصروفات الشخصية
              </h2>
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
                شهر {currentMonthName}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              صفحة مخصصة ومستقلة لتسجيل وتتبع كافة مبالغ السحب ومصروفاتك وحساب الصافي بدقة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onSwitchToIncomes}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition active:scale-95"
          >
            <span>صفحة الإيرادات والدخل</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </button>

          <button
            onClick={onOpenAddWithdrawal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-500/25 transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل سحب جديد</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        
        {/* Card 1: Total Withdrawn */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>إجمالي المسحوبات</span>
            </span>
            <span className="text-[11px] text-slate-400 font-bold">
              {withdrawnPercent}% من المحصل
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
              {totalWithdrawn.toLocaleString('ar-EG')}
            </span>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              {currency.symbol}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            المبالغ التي تم سحبها خلال هذا الشهر
          </p>
        </div>

        {/* Card 2: Net Remaining */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-emerald-500" />
              <span>صافي الرصيد المتبقي</span>
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl sm:text-3xl font-black ${
              netRemaining < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
            }`}>
              {netRemaining.toLocaleString('ar-EG')}
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {currency.symbol}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            المتبقي من الدخل المحصل ({receivedTotal.toLocaleString('ar-EG')} {currency.symbol})
          </p>
        </div>

        {/* Card 3: Operations Count & Average */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-slate-500" />
              <span>عدد عمليات السحب</span>
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {withdrawals.length}
            </span>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              عملية
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            {withdrawals.length > 0 ? `متوسط ${averageWithdrawal.toLocaleString('ar-EG')} ${currency.symbol} لكل عملية` : 'لا توجد عمليات مسجلة'}
          </p>
        </div>

        {/* Card 4: Highest Withdrawal */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>أكبر عملية سحب</span>
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {highestWithdrawal ? parseFloat(highestWithdrawal.amount).toLocaleString('ar-EG') : '0'}
            </span>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              {currency.symbol}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 truncate">
            {highestWithdrawal ? `${highestWithdrawal.reason} (${highestWithdrawal.date})` : 'لا توجد مسحوبات'}
          </p>
        </div>

      </div>

      {/* Cashflow Proportion Banner */}
      {receivedTotal > 0 && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-rose-500" />
              <span>معدل الصرف والمسحوبات مقابل الدخل المحصل</span>
            </span>
            <span className={withdrawnPercent > 80 ? 'text-rose-600 font-black' : 'text-emerald-600 font-black'}>
              تم صرف {withdrawnPercent}% من إجمالي المحصل
            </span>
          </div>

          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${Math.min(100, withdrawnPercent)}%` }}
              className={`h-full transition-all duration-500 ${
                withdrawnPercent > 80
                  ? 'bg-rose-500'
                  : withdrawnPercent > 50
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>إجمالي المسحوب: {totalWithdrawn.toLocaleString('ar-EG')} {currency.symbol}</span>
            <span>صافي الرصيد المتبقي: {netRemaining.toLocaleString('ar-EG')} {currency.symbol}</span>
          </div>
        </div>
      )}

      {/* Withdrawals List / Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Controls Bar: Search & Sort */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث في أسباب السحب، التواريخ، أو الملاحظات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-rose-500 transition"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap hidden sm:inline">
              الترتيب:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="date-desc">الأحدث تاريخاً أولاً</option>
              <option value="date-asc">الأقدم تاريخاً أولاً</option>
              <option value="amount-desc">المبلغ الأعلى أولاً</option>
              <option value="amount-asc">المبلغ الأقل أولاً</option>
            </select>
          </div>

        </div>

        {/* List Content */}
        {filteredWithdrawals.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-16 h-16 mx-auto mb-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
              <ArrowDownRight className="w-8 h-8 opacity-60" />
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
              {searchQuery ? 'لم يتم العثور على أي نتائج مطابقة' : 'لا توجد مسحوبات مسجلة لهذا الشهر'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
              {searchQuery
                ? 'جرّب البحث بكلمة أخرى أو قم بإلغاء نص البحث.'
                : 'اضغط على زر "تسجيل سحب جديد" لإضافة أول عملية سحب ومصروف شخصي لهذا الشهر.'}
            </p>
            {!searchQuery && (
              <button
                onClick={onOpenAddWithdrawal}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold shadow-md shadow-rose-500/25 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>تسجيل سحب جديد الآن</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredWithdrawals.map((item, index) => {
              const amountNum = parseFloat(item.amount) || 0;
              const percentOfTotal = totalWithdrawn > 0
                ? Math.round((amountNum / totalWithdrawn) * 100)
                : 0;

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  {/* Left: Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-sm">
                      <ArrowDownRight className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                          {item.reason}
                        </h4>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                          {percentOfTotal}% من المسحوبات
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.date}</span>
                        </span>

                        {item.notes && (
                          <span className="flex items-center gap-1 text-slate-400 italic">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{item.notes}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 self-end sm:self-auto w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800/60">
                    <div className="text-right sm:text-left">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-xl font-black text-rose-600 dark:text-rose-400">
                          {amountNum.toLocaleString('ar-EG')}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {currency.symbol}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditWithdrawal(item)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
                        title="تعديل عملية السحب"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition active:scale-95"
                        title="حذف عملية السحب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Footer info bar */}
        {filteredWithdrawals.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>عرض {filteredWithdrawals.length} من أصل {withdrawals.length} عملية سحب</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              المجموع المعروض: {filteredWithdrawals.reduce((s, w) => s + (parseFloat(w.amount) || 0), 0).toLocaleString('ar-EG')} {currency.symbol}
            </span>
          </div>
        )}

      </div>

    </div>
  );
}
