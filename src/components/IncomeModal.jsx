import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Save,
  Calendar,
  Tag,
  DollarSign,
  Briefcase,
  Repeat,
  FileText,
  Users,
  GraduationCap,
  Building2,
  UserPlus,
  CheckCircle2,
  Clock,
  Check
} from 'lucide-react';
import { CATEGORIES, ARABIC_MONTHS, parseNumberInput } from '../constants';
import CategoryIcon from './CategoryIcon';
import ModalWrapper from './ModalWrapper';

export default function IncomeModal({
  isOpen,
  onClose,
  onSave,
  editingIncome,
  defaultDate,
  currency,
  jobs,
  students,
  onOpenAddStudent,
  initialJobId
}) {
  const [selectedJobId, setSelectedJobId] = useState('job-company');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('salary');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('received');
  const [isRecurring, setIsRecurring] = useState(false);
  const [client, setClient] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  // Month label for auto-title
  const currentMonthName = (() => {
    try {
      const monthIndex = parseInt(date.split('-')[1], 10) - 1;
      return ARABIC_MONTHS[monthIndex] || '';
    } catch {
      return '';
    }
  })();

  useEffect(() => {
    if (!isOpen) return;

    if (editingIncome) {
      setSelectedJobId(editingIncome.jobId || (jobs[0] ? jobs[0].id : ''));
      setSelectedStudentId(editingIncome.studentId || '');
      setTitle(editingIncome.title || '');
      setAmount(editingIncome.amount ? String(editingIncome.amount) : '');
      setCategory(editingIncome.category || 'salary');
      setDate(editingIncome.date || defaultDate);
      setStatus(editingIncome.status || 'received');
      setIsRecurring(editingIncome.isRecurring || false);
      setClient(editingIncome.client || '');
      setNotes(editingIncome.notes || '');
      setErrors({});
    } else {
      const activeJobId = initialJobId || (jobs[0] ? jobs[0].id : 'job-company');
      setSelectedJobId(activeJobId);
      setSelectedStudentId('');
      
      const foundJob = jobs.find((j) => j.id === activeJobId);
      const cat = foundJob?.category || 'salary';
      setCategory(cat);

      if (foundJob && foundJob.type === 'students') {
        setTitle('اشتراك طالب أونلاين');
        setAmount('');
        setClient('');
      } else if (foundJob && (foundJob.id === 'job-center' || cat === 'center')) {
        setTitle(`مستحقات السنتر - ${currentMonthName}`);
        setAmount(foundJob.defaultAmount > 0 ? String(foundJob.defaultAmount) : '');
        setClient('');
      } else if (foundJob && (foundJob.id === 'job-private' || cat === 'private')) {
        setTitle(`مشروع فريلانس - ${currentMonthName}`);
        setAmount(foundJob.defaultAmount > 0 ? String(foundJob.defaultAmount) : '');
        setClient('');
      } else if (foundJob && foundJob.defaultAmount > 0) {
        setTitle(`${foundJob.title} - ${currentMonthName}`);
        setAmount(String(foundJob.defaultAmount));
        setClient(foundJob.title);
      } else {
        setTitle(foundJob?.title ? `${foundJob.title} - ${currentMonthName}` : '');
        setAmount('');
        setClient('');
      }

      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setStatus('received');
      setIsRecurring(false);
      setNotes('');
      setErrors({});
    }
  }, [isOpen, editingIncome, initialJobId]);

  // When job changes
  const handleJobChange = (jobId) => {
    setSelectedJobId(jobId);
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const cat = job.category || 'salary';
    setCategory(cat);

    if (job.type === 'students') {
      setSelectedStudentId('');
      setTitle('اشتراك طالب');
      setAmount('');
      setClient('');
    } else if (job.id === 'job-center' || cat === 'center') {
      setSelectedStudentId('');
      setTitle(`مستحقات السنتر - ${currentMonthName}`);
      if (amount === '15000') setAmount('');
      if (client === 'وظيفة الشركة') setClient('');
    } else if (job.id === 'job-private' || cat === 'private') {
      setSelectedStudentId('');
      setTitle(`مشروع فريلانس - ${currentMonthName}`);
      if (amount === '15000' || amount === '2000') setAmount('');
      if (client === 'وظيفة الشركة' || client.includes('سنتر')) setClient('');
    } else if (job.id === 'job-company') {
      setSelectedStudentId('');
      setTitle(`${job.title} - ${currentMonthName}`);
      if (!amount || amount === '0') setAmount(String(job.defaultAmount || 15000));
      if (!client) setClient(job.title);
    } else {
      setSelectedStudentId('');
      setTitle(`${job.title} - ${currentMonthName}`);
      if (job.defaultAmount > 0) setAmount(String(job.defaultAmount));
    }
  };

  // When student selection changes
  const handleStudentSelect = (studentId) => {
    setSelectedStudentId(studentId);
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setTitle(`اشتراك شهر ${currentMonthName} - الطالب ${student.name}`);
      setAmount(String(student.monthlyFee));
      setClient(student.name);
      setNotes(`اشتراك مرحلة: ${student.grade}`);
    }
  };

  const currentJob = jobs.find((j) => j.id === selectedJobId);
  const isStudentJob = currentJob?.type === 'students';

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'يرجى إدخال عنوان أو مصدر الدخل';
    }
    const parsedAmount = parseNumberInput(amount);
    if (parsedAmount <= 0) {
      newErrors.amount = 'يرجى إدخال مبلغ صحيح أكبر من صفر';
    }
    if (!date) {
      newErrors.date = 'يرجى تحديد التاريخ';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const studentObj = students.find((s) => s.id === selectedStudentId);

    onSave({
      id: editingIncome ? editingIncome.id : `inc-${Date.now()}`,
      jobId: selectedJobId,
      studentId: isStudentJob ? selectedStudentId : null,
      studentName: isStudentJob && studentObj ? studentObj.name : null,
      title: title.trim(),
      amount: parsedAmount,
      category,
      date,
      status,
      isRecurring,
      client: client.trim(),
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              {editingIncome ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingIncome ? 'تعديل بيانات الدخل' : 'تسجيل دخل جديد'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                حدد جهة العمل (الشركة، السنتر، الطلبة أونلاين، أو شغل خاص)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {/* 1. Job Type Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              نوع العمل / جهة الدخل <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {jobs.map((job) => {
                const isSelected = selectedJobId === job.id;
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => handleJobChange(job.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition text-right ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${job.color}20`, color: job.color }}
                    >
                      <CategoryIcon name={job.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate font-bold">{job.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Special Student Select if Job is Students */}
          {isStudentJob && (
            <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-purple-900 dark:text-purple-300">
                  اختر الطالب الذي دفع الاشتراك:
                </label>
                <button
                  type="button"
                  onClick={onOpenAddStudent}
                  className="text-[11px] font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>+ إضافة طالب جديد</span>
                </button>
              </div>

              <select
                value={selectedStudentId}
                onChange={(e) => handleStudentSelect(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="">-- اضغط لاختيار الطالب من القائمة --</option>
                {students.map((std) => (
                  <option key={std.id} value={std.id}>
                    {std.name} — {std.grade} ({std.monthlyFee} {currency.symbol})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-purple-700/80 dark:text-purple-300/80 mt-1.5">
                💡 بمجرد اختيار الطالب سيتم تلقائياً ملء مبلغ الاشتراك واسم الطالب في العنوان.
              </p>
            </div>
          )}

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                عنوان أو تفاصيل البند <span className="text-rose-500">*</span>
              </label>
              {/* Quick title suggestions */}
              {currentJob?.category === 'center' && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setTitle(`مستحقات سنتر - ${currentMonthName}`)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 font-medium transition"
                  >
                    + مستحقات سنتر
                  </button>
                  <button
                    type="button"
                    onClick={() => setTitle(`حصص ومراجعات السنتر - ${currentMonthName}`)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 font-medium transition"
                  >
                    + حصص ومراجعات
                  </button>
                </div>
              )}
              {currentJob?.category === 'private' && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setTitle(`مشروع فريلانس - ${currentMonthName}`)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 hover:bg-amber-100 font-medium transition"
                  >
                    + مشروع فريلانس
                  </button>
                  <button
                    type="button"
                    onClick={() => setTitle(`استشارة وشغل خاص - ${currentMonthName}`)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 hover:bg-amber-100 font-medium transition"
                  >
                    + استشارة خاصة
                  </button>
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder={
                currentJob?.category === 'center'
                  ? 'مثال: مستحقات سنتر الأمل، مراجعات مكثفة...'
                  : currentJob?.category === 'private'
                  ? 'مثال: تصميم تطبيق، استشارة لشركة كذا...'
                  : 'مثال: راتب نوفمبر، مستحقات...'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-xs sm:text-sm text-slate-900 dark:text-white outline-none transition ${
                errors.title ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500'
              }`}
            />
            {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>}
          </div>

          {/* Client / Center Name for non-student jobs */}
          {!isStudentJob && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {currentJob?.category === 'center'
                  ? 'اسم السنتر / الأكاديمية (اختياري)'
                  : currentJob?.category === 'private'
                  ? 'اسم العميل / المشروع / المنصة (اختياري)'
                  : 'اسم جهة العمل أو الشركة (اختياري)'}
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    currentJob?.category === 'center'
                      ? 'مثال: سنتر الأقصى، سنتر الأوائل...'
                      : currentJob?.category === 'private'
                      ? 'مثال: منصة خمسات، شركة التقنية، العميل أحمد...'
                      : 'مثال: اسم الشركة...'
                  }
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>
            </div>
          )}

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                المبلغ ({currency.symbol}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full pl-3 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-sm font-bold text-slate-900 dark:text-white outline-none transition ${
                    errors.amount ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500'
                  }`}
                />
              </div>
              {errors.amount && <p className="text-[11px] text-rose-500 mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                تاريخ الاستلام <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full pl-3 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-xs sm:text-sm text-slate-900 dark:text-white outline-none transition ${
                    errors.date ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500'
                  }`}
                />
              </div>
              {errors.date && <p className="text-[11px] text-rose-500 mt-1">{errors.date}</p>}
            </div>
          </div>

          {/* Status & Recurring */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                حالة الاستلام
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('received')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 ${
                    status === 'received'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>مُستلم</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('pending')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 ${
                    status === 'pending'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/40'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>قيد الانتظار</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                تكرار دوري شهرياً
              </label>
              <button
                type="button"
                onClick={() => setIsRecurring(!isRecurring)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-right transition-all duration-200 active:scale-98 ${
                  isRecurring
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="text-[11px]">
                  <span className="font-bold block text-slate-900 dark:text-white">
                    دخل دوري متكرر
                  </span>
                  <span className="text-slate-400">
                    مثل الراتب الثابت كل شهر
                  </span>
                </div>

                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                    isRecurring
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'border-2 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isRecurring && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ملاحظات أو طريقة التحويل (فودافون كاش، انستاباي، كاش...)
            </label>
            <input
              type="text"
              placeholder="مثال: تم التحويل عبر فودافون كاش رقم..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:shadow-lg transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{editingIncome ? 'حفظ التعديلات' : 'تسجيل الدخل'}</span>
            </button>
          </div>

        </form>
    </ModalWrapper>
  );
}
