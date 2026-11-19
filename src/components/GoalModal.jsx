import React, { useState, useEffect } from 'react';
import { X, Target, Check } from 'lucide-react';
import ModalWrapper from './ModalWrapper';
import { parseNumberInput } from '../constants';

export default function GoalModal({
  isOpen,
  onClose,
  currentGoal,
  onSaveGoal,
  currency
}) {
  const [goal, setGoal] = useState('');

  useEffect(() => {
    if (isOpen) {
      setGoal(currentGoal ? String(currentGoal) : '');
    }
  }, [isOpen, currentGoal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseNumberInput(goal);
    onSaveGoal(parsed < 0 ? 0 : parsed);
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              تحديد الهدف الشهري
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              المبلغ الذي تطمح لتحقيقه هذا الشهر
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            قيمة الهدف ({currency.symbol})
          </label>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="مثال: 30000"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-base outline-none focus:ring-2 focus:ring-indigo-500 transition"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            حفظ الهدف
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
