import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, GraduationCap, DollarSign, Phone, FileText, Check } from 'lucide-react';
import ModalWrapper from './ModalWrapper';
import { parseNumberInput } from '../constants';

export default function StudentModal({
  isOpen,
  onClose,
  onSaveStudent,
  editingStudent,
  currency,
  showToast
}) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('أولى ثانوي');
  const [monthlyFee, setMonthlyFee] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editingStudent) {
      setName(editingStudent.name || '');
      // Normalize grade to either اولى ثانوي or تانية ثانوي
      const g = (editingStudent.grade || '').toLowerCase();
      if (g.includes('تانية') || g.includes('ثانية') || g.includes('2')) {
        setGrade('تانية ثانوي');
      } else {
        setGrade('أولى ثانوي');
      }
      setMonthlyFee(editingStudent.monthlyFee ? String(editingStudent.monthlyFee) : '');
      setPhone(editingStudent.phone || '');
      setNotes(editingStudent.notes || '');
    } else {
      setName('');
      setGrade('أولى ثانوي');
      setMonthlyFee('500');
      setPhone('');
      setNotes('');
    }
  }, [editingStudent, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('يرجى إدخال اسم الطالب', 'error');
      return;
    }
    const fee = parseNumberInput(monthlyFee);
    if (fee <= 0) {
      showToast('يرجى إدخال مبلغ اشتراك صحيح أكبر من صفر', 'error');
      return;
    }

    onSaveStudent({
      id: editingStudent ? editingStudent.id : `std-${Date.now()}`,
      name: name.trim(),
      grade: grade.trim(),
      monthlyFee: fee,
      phone: phone.trim(),
      notes: notes.trim(),
    });

    showToast(editingStudent ? 'تم تعديل بيانات الطالب بنجاح' : 'تمت إضافة الطالب الجديد بنجاح', 'success');
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingStudent ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تسجيل بيانات الطالب لتسهيل رصد الاشتراكات
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            اسم الطالب <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="مثال: أحمد محمود"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition"
            autoFocus
          />
        </div>

        {/* Grade Selection (Only 1st & 2nd Secondary with Modern Card Selector) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            المرحلة الدراسية <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {/* أولى ثانوي */}
            <button
              type="button"
              onClick={() => setGrade('أولى ثانوي')}
              className={`p-3 rounded-2xl border text-right transition-all duration-200 active:scale-95 flex items-center justify-between ${
                grade === 'أولى ثانوي'
                  ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/30 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                    grade === 'أولى ثانوي'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
                  }`}
                >
                  1
                </div>
                <div>
                  <span className="font-bold text-xs block">أولى ثانوي</span>
                  <span className="text-[10px] text-slate-400 block font-normal">الصف الأول</span>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  grade === 'أولى ثانوي'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'border-2 border-slate-300 dark:border-slate-600'
                }`}
              >
                {grade === 'أولى ثانوي' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>

            {/* تانية ثانوي */}
            <button
              type="button"
              onClick={() => setGrade('تانية ثانوي')}
              className={`p-3 rounded-2xl border text-right transition-all duration-200 active:scale-95 flex items-center justify-between ${
                grade === 'تانية ثانوي'
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                    grade === 'تانية ثانوي'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  2
                </div>
                <div>
                  <span className="font-bold text-xs block">تانية ثانوي</span>
                  <span className="text-[10px] text-slate-400 block font-normal">الصف الثاني</span>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  grade === 'تانية ثانوي'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'border-2 border-slate-300 dark:border-slate-600'
                }`}
              >
                {grade === 'تانية ثانوي' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          </div>
        </div>

        {/* Monthly Fee */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            قيمة الاشتراك الشهري ({currency.symbol}) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              inputMode="numeric"
              required
              placeholder="مثال: 500"
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(e.target.value)}
              className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            رقم الهاتف أو الواتساب
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="010xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            ملاحظات أو مواعيد المجموعة
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="مثال: مجموعة يوم الاثنين والخميس"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
        </div>

        {/* Actions CTA */}
        <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 hover:shadow-lg transition flex items-center gap-1.5 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{editingStudent ? 'حفظ التعديلات' : 'إضافة الطالب'}</span>
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
