import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, GraduationCap, DollarSign, Phone, FileText } from 'lucide-react';
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
  const [grade, setGrade] = useState('ثانوية عامة (3 ثانوي)');
  const [monthlyFee, setMonthlyFee] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editingStudent) {
      setName(editingStudent.name || '');
      setGrade(editingStudent.grade || 'ثانوية عامة (3 ثانوي)');
      setMonthlyFee(editingStudent.monthlyFee ? String(editingStudent.monthlyFee) : '');
      setPhone(editingStudent.phone || '');
      setNotes(editingStudent.notes || '');
    } else {
      setName('');
      setGrade('ثانوية عامة (3 ثانوي)');
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
      <form onSubmit={handleSubmit} className="space-y-3.5">
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              المرحلة الدراسية
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition"
            >
              <option value="أولى ثانوي (1 ثانوي)">أولى ثانوي (1 ثانوي)</option>
              <option value="تانية ثانوي (2 ثانوي)">تانية ثانوي (2 ثانوي)</option>
              <option value="ثانوية عامة (3 ثانوي)">ثانوية عامة (3 ثانوي)</option>
              <option value="إعدادي">مرحلة إعدادية</option>
              <option value="جامعي / كورس خاص">جامعي / كورس خاص</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              الاشتراك الشهري ({currency.symbol}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              step="any"
              placeholder="مثال: 500"
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            رقم الهاتف أو الواتساب
          </label>
          <input
            type="text"
            placeholder="010xxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            ملاحظات أو مواعيد المجموعة
          </label>
          <input
            type="text"
            placeholder="مثال: مجموعة يوم الاثنين والخميس"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition"
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
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{editingStudent ? 'حفظ التعديلات' : 'إضافة الطالب'}</span>
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
