import React from 'react';
import { ArrowDownRight, Plus, Trash2, Edit, Calendar, Tag, AlertCircle, FileText } from 'lucide-react';

export default function WithdrawalsList({
  withdrawals,
  currency,
  onOpenAddWithdrawal,
  onEditWithdrawal,
  onDeleteWithdrawal,
  openConfirm,
  showToast
}) {
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);

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
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden mb-12 transition-all">
      
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shadow-sm">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>سجل المسحوبات والمصروفات الشخصية</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                {withdrawals.length} عمليات سحب
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تتبع المبالغ التي سحبتها وأسباب صرفها لحساب صافي ميزانيتك بدقة
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddWithdrawal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل سحب جديد</span>
        </button>
      </div>

      {/* Body List */}
      {withdrawals.length === 0 ? (
        <div className="py-14 px-4 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <ArrowDownRight className="w-7 h-7 opacity-40" />
          </div>
          <h4 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
            لا توجد أي مسحوبات مسجلة لهذا الشهر
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            لم تقم بتسجيل أي مبالغ مسحوبة أو مصروفات شخصية خلال هذا الشهر حتى الآن.
          </p>
          <button
            onClick={onOpenAddWithdrawal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل سحب مبلغ الآن</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {withdrawals.map((item) => (
            <div
              key={item.id}
              className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              {/* Info */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.reason}
                    </h4>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.date}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <span>• {item.notes}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Amount & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60">
                <div className="text-left font-extrabold text-base text-rose-600 dark:text-rose-400 whitespace-nowrap">
                  <span>- {item.amount.toLocaleString('ar-EG')}</span>
                  <span className="text-xs font-normal text-slate-400 mr-1">{currency.symbol}</span>
                </div>

                <div className="flex items-center gap-1 mr-2 border-r border-slate-200 dark:border-slate-800 pr-2">
                  <button
                    onClick={() => onEditWithdrawal(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="تعديل عملية السحب"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="حذف عملية السحب"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Total */}
      {withdrawals.length > 0 && (
        <div className="p-3.5 sm:p-4 bg-rose-50/40 dark:bg-rose-950/20 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold">
          <span className="text-slate-600 dark:text-slate-300">
            إجمالي المسحوبات المصروفة هذا الشهر:
          </span>
          <span className="text-sm sm:text-base text-rose-600 dark:text-rose-400">
            {totalWithdrawn.toLocaleString('ar-EG')} {currency.symbol}
          </span>
        </div>
      )}

    </div>
  );
}
