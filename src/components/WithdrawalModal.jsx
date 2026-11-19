import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, Save, DollarSign, Calendar, FileText, Tag, AlertCircle } from 'lucide-react';
import ModalWrapper from './ModalWrapper';
import { WITHDRAWAL_REASONS, parseNumberInput } from '../constants';

export default function WithdrawalModal({
  isOpen,
  onClose,
  onSaveWithdrawal,
  editingWithdrawal,
  defaultDate,
  currency,
  showToast
}) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('مصاريف شخصية وعائلية');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    if (editingWithdrawal) {
      setAmount(editingWithdrawal.amount ? String(editingWithdrawal.amount) : '');
      setReason(editingWithdrawal.reason || 'مصاريف شخصية وعائلية');
      setDate(editingWithdrawal.date || defaultDate);
      setNotes(editingWithdrawal.notes || '');
      setErrors({});
    } else {
      setAmount('');
      setReason('مصاريف شخصية وعائلية');
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setNotes('');
      setErrors({});
    }
  }, [isOpen, editingWithdrawal, defaultDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    const parsedAmount = parseNumberInput(amount);
    if (parsedAmount <= 0) {
      newErrors.amount = 'يرجى إدخال مبلغ سحب صحيح أكبر من صفر';
    }
    if (!reason.trim()) {
      newErrors.reason = 'يرجى تحديد أو كتابة سبب السحب';
    }
    if (!date) {
      newErrors.date = 'يرجى تحديد التاريخ';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSaveWithdrawal({
      id: editingWithdrawal ? editingWithdrawal.id : `wth-${Date.now()}`,
      amount: parsedAmount,
      reason: reason.trim(),
      date,
      notes: notes.trim(),
    });

    showToast(
      editingWithdrawal
        ? 'تم تعديل عملية السحب بنجاح'
        : `تم تسجيل سحب مبلغ ${parsedAmount.toLocaleString('ar-EG')} ${currency.symbol} بنجاح`,
      'info'
    );
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {editingWithdrawal ? 'تعديل عملية السحب' : 'تسجيل سحب فلوس / مصروفات'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              سجل المبلغ الذي قمت بسحبه وسبب السحب لمتابعة صافي دخلك
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
        
        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            المبلغ المسحوب ({currency.symbol}) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              min="0"
              placeholder="مثال: 2000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-base font-extrabold text-slate-900 dark:text-white outline-none transition ${
                errors.amount
                  ? 'border-rose-500 ring-1 ring-rose-500'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500'
              }`}
              autoFocus
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              {currency.symbol}
            </span>
          </div>
          {errors.amount && <p className="text-[11px] text-rose-500 mt-1">{errors.amount}</p>}
        </div>

        {/* Reason / Purpose */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            سبب السحب (سحبت ليه؟) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="مثال: مصاريف بيت، إيجار، قسط، كاش..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-xs sm:text-sm text-slate-900 dark:text-white outline-none transition ${
              errors.reason
                ? 'border-rose-500 ring-1 ring-rose-500'
                : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500'
            }`}
          />
          {errors.reason && <p className="text-[11px] text-rose-500 mt-1">{errors.reason}</p>}

          {/* Quick Reason Chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {WITHDRAWAL_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                  reason === r
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700 font-bold'
                    : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            تاريخ السحب <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500 transition"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            ملاحظات إضافية (اختياري)
          </label>
          <input
            type="text"
            placeholder="مثال: تم السحب من ماكينة ATM..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500 transition"
          />
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition flex items-center gap-1.5 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{editingWithdrawal ? 'حفظ التعديلات' : 'تسجيل السحب'}</span>
          </button>
        </div>

      </form>
    </ModalWrapper>
  );
}
