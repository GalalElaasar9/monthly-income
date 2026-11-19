import React, { useState, useEffect } from 'react';
import { X, Briefcase, Save } from 'lucide-react';
import ModalWrapper from './ModalWrapper';

export default function JobModal({
  isOpen,
  onClose,
  onSaveJob,
  editingJob,
  currency,
  showToast
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('fixed'); // fixed, variable, students
  const [defaultAmount, setDefaultAmount] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Briefcase');
  const [color, setColor] = useState('#10b981');

  useEffect(() => {
    if (!isOpen) return;
    if (editingJob) {
      setTitle(editingJob.title || '');
      setType(editingJob.type || 'fixed');
      setDefaultAmount(editingJob.defaultAmount ? String(editingJob.defaultAmount) : '0');
      setDescription(editingJob.description || '');
      setIcon(editingJob.icon || 'Briefcase');
      setColor(editingJob.color || '#10b981');
    } else {
      setTitle('');
      setType('fixed');
      setDefaultAmount('0');
      setDescription('');
      setIcon('Briefcase');
      setColor('#10b981');
    }
  }, [editingJob, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('يرجى إدخال اسم العمل أو الجهة', 'error');
      return;
    }

    onSaveJob({
      id: editingJob ? editingJob.id : `job-${Date.now()}`,
      title: title.trim(),
      type,
      defaultAmount: parseFloat(defaultAmount) || 0,
      description: description.trim(),
      icon,
      color,
      category: type === 'students' ? 'students' : 'salary'
    });

    showToast(editingJob ? 'تم تعديل جهة العمل بنجاح' : 'تمت إضافة جهة العمل الجديدة بنجاح', 'success');
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingJob ? 'تعديل جهة / نوع العمل' : 'إضافة نوع شغل جديد'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              إضافة مصدر دخل جديد (مثل سنتر، شركة ثانية، تدريس)
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            اسم العمل / الجهة <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="مثال: سنتر الأمل، شركة التقنية، دروس أونلاين..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              نوع الدخل
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="fixed">راتب أو دخل ثابت شهرياً</option>
              <option value="students">اشتراكات طلبة (تجميعي)</option>
              <option value="variable">متغير / حسب المشاريع</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              المبلغ التقديري ({currency.symbol})
            </label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={defaultAmount}
              onChange={(e) => setDefaultAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            وصف مختصر
          </label>
          <input
            type="text"
            placeholder="مثال: دوام جزئي مسائي يومين في الأسبوع"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{editingJob ? 'حفظ التعديلات' : 'إضافة العمل'}</span>
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
