import React, { useState, useMemo } from 'react';
import {
  X,
  Users,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Phone,
  Edit2,
  Trash2,
  DollarSign,
  GraduationCap,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  Layers
} from 'lucide-react';
import ModalWrapper from './ModalWrapper';

export default function StudentsManagerModal({
  isOpen,
  onClose,
  students,
  currentMonthIncomes,
  selectedMonth,
  currency,
  onOpenAddStudent,
  onEditStudent,
  onDeleteStudent,
  onRecordStudentPayment,
  openConfirm,
  showToast
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, paid, unpaid, overdue
  const [gradeFilter, setGradeFilter] = useState('all'); // all, grade1, grade2, grade3, other

  // Check if current date is within 5 days before the end of the selected month
  const isMonthEndingSoon = useMemo(() => {
    try {
      const [y, m] = selectedMonth.split('-').map(Number);
      const daysInMonth = new Date(y, m, 0).getDate();
      const thresholdDay = daysInMonth - 5; // e.g. 25th in a 30-day month

      const now = new Date();
      const curYear = now.getFullYear();
      const curMonth = now.getMonth() + 1; // 1-based
      const curDay = now.getDate();

      // If selected month is in the past, it's already ended
      if (y < curYear || (y === curYear && m < curMonth)) {
        return true;
      }
      // If it is the current ongoing month, check if day >= threshold
      if (y === curYear && m === curMonth) {
        return curDay >= thresholdDay;
      }
      return false;
    } catch {
      return false;
    }
  }, [selectedMonth]);

  // Helper to normalize student grade into key groups
  const getGradeCategory = (gradeStr = '') => {
    const g = gradeStr.toLowerCase();
    if (g.includes('أولى') || g.includes('1 ثانوي')) return 'grade1';
    if (g.includes('تانية') || g.includes('ثانية') || g.includes('2 ثانوي')) return 'grade2';
    if (g.includes('ثانوية عامة') || g.includes('3 ثانوي') || g.includes('ثالثة')) return 'grade3';
    return 'other';
  };

  // Calculate payment status & overdue alert for each student
  const studentsWithStatus = useMemo(() => {
    return students.map((std) => {
      const paymentRecord = currentMonthIncomes.find(
        (inc) => inc.studentId === std.id && inc.status === 'received'
      );
      const isPaid = !!paymentRecord;
      const isOverdueWarning = !isPaid && isMonthEndingSoon;
      const gradeCat = getGradeCategory(std.grade);

      return {
        ...std,
        isPaid,
        paymentRecord,
        isOverdueWarning,
        gradeCat
      };
    });
  }, [students, currentMonthIncomes, isMonthEndingSoon]);

  // Income & Statistics breakdown by Grade Group
  const gradeBreakdown = useMemo(() => {
    const groups = {
      grade1: { label: 'أولى ثانوي', students: [], collected: 0, remaining: 0, paid: 0 },
      grade2: { label: 'تانية ثانوي', students: [], collected: 0, remaining: 0, paid: 0 },
      grade3: { label: 'ثانوية عامة', students: [], collected: 0, remaining: 0, paid: 0 },
      other: { label: 'مراحل أخرى', students: [], collected: 0, remaining: 0, paid: 0 }
    };

    studentsWithStatus.forEach((s) => {
      const cat = groups[s.gradeCat] ? s.gradeCat : 'other';
      groups[cat].students.push(s);
      if (s.isPaid) {
        groups[cat].paid += 1;
        groups[cat].collected += s.paymentRecord?.amount || s.monthlyFee;
      } else {
        groups[cat].remaining += s.monthlyFee;
      }
    });

    return groups;
  }, [studentsWithStatus]);

  // Filtered Students based on search, status, and grade
  const filteredStudents = useMemo(() => {
    return studentsWithStatus.filter((std) => {
      const matchSearch =
        std.name.toLowerCase().includes(search.toLowerCase()) ||
        (std.phone && std.phone.includes(search)) ||
        (std.grade && std.grade.toLowerCase().includes(search.toLowerCase()));

      if (!matchSearch) return false;

      // Grade filter
      if (gradeFilter !== 'all' && std.gradeCat !== gradeFilter) return false;

      // Status filter
      if (filter === 'paid') return std.isPaid;
      if (filter === 'unpaid') return !std.isPaid;
      if (filter === 'overdue') return std.isOverdueWarning;

      return true;
    });
  }, [studentsWithStatus, search, filter, gradeFilter]);

  // Overall Totals
  const paidCount = studentsWithStatus.filter((s) => s.isPaid).length;
  const unpaidCount = studentsWithStatus.length - paidCount;
  const overdueCount = studentsWithStatus.filter((s) => s.isOverdueWarning).length;

  const collectedTotal = studentsWithStatus
    .filter((s) => s.isPaid)
    .reduce((sum, s) => sum + (s.paymentRecord?.amount || s.monthlyFee), 0);
  const remainingTotal = studentsWithStatus
    .filter((s) => !s.isPaid)
    .reduce((sum, s) => sum + s.monthlyFee, 0);

  const handleDeleteClick = (student) => {
    openConfirm({
      title: 'حذف الطالب',
      message: `هل أنت متأكد من حذف الطالب "${student.name}"؟`,
      confirmText: 'نعم، حذف',
      isDanger: true,
      onConfirm: () => {
        onDeleteStudent(student.id);
        showToast(`تم حذف الطالب ${student.name} بنجاح`, 'info');
      }
    });
  };

  const handleRecordPaymentClick = (student) => {
    onRecordStudentPayment(student);
    showToast(`تم تسجيل سداد اشتراك الطالب "${student.name}" بمبلغ ${student.monthlyFee} ${currency.symbol}`, 'success');
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      {/* Header */}
      <div className="p-3.5 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shadow-sm shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                متابعة اشتراكات الطلاب
              </h3>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 shrink-0">
                {students.length} طالب
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              فصل ومتابعة دخل أولى وثانية ثانوي وإنذارات المتأخرين
            </p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Stage Group Income Cards (فصل دخل كل مجموعة جنباً إلى جنب في عمودين) */}
      <div className="p-3 sm:p-4 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-[11px] mb-2">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>إحصائيات المراحل (اضغط للفلترة):</span>
          </span>
          <span className="text-slate-400 text-[10px] sm:text-[11px]">
            الإجمالي: {(collectedTotal + remainingTotal).toLocaleString('ar-EG')} {currency.symbol}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Card: أولى ثانوي */}
          <button
            type="button"
            onClick={() => setGradeFilter(gradeFilter === 'grade1' ? 'all' : 'grade1')}
            className={`p-2 sm:p-2.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
              gradeFilter === 'grade1'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50 ring-2 ring-purple-500/20'
                : 'border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-purple-700 dark:text-purple-300 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span>أولى ثانوي</span>
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">
                {gradeBreakdown.grade1.paid}/{gradeBreakdown.grade1.students.length}
              </span>
            </div>

            <div className="mt-1.5 space-y-0.5 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">محصل:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {gradeBreakdown.grade1.collected.toLocaleString('ar-EG')} {currency.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">متبقي:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {gradeBreakdown.grade1.remaining.toLocaleString('ar-EG')} {currency.symbol}
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all"
                style={{
                  width: `${
                    gradeBreakdown.grade1.students.length > 0
                      ? Math.round((gradeBreakdown.grade1.paid / gradeBreakdown.grade1.students.length) * 100)
                      : 0
                  }%`
                }}
              />
            </div>
          </button>

          {/* Card: تانية ثانوي */}
          <button
            type="button"
            onClick={() => setGradeFilter(gradeFilter === 'grade2' ? 'all' : 'grade2')}
            className={`p-2 sm:p-2.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
              gradeFilter === 'grade2'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20'
                : 'border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span>تانية ثانوي</span>
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">
                {gradeBreakdown.grade2.paid}/{gradeBreakdown.grade2.students.length}
              </span>
            </div>

            <div className="mt-1.5 space-y-0.5 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">محصل:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {gradeBreakdown.grade2.collected.toLocaleString('ar-EG')} {currency.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">متبقي:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {gradeBreakdown.grade2.remaining.toLocaleString('ar-EG')} {currency.symbol}
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{
                  width: `${
                    gradeBreakdown.grade2.students.length > 0
                      ? Math.round((gradeBreakdown.grade2.paid / gradeBreakdown.grade2.students.length) * 100)
                      : 0
                  }%`
                }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Controls: Search & Add button & Status Tabs */}
      <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 space-y-2">
        {/* Row 1: Search + Add */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث باسم الطالب أو الهاتف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <button
            onClick={onOpenAddStudent}
            className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>طالب جديد</span>
          </button>
        </div>

        {/* Row 2: Status Filter Tabs - 4 equal columns */}
        <div className="grid grid-cols-4 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-[11px] font-bold text-center">
          <button
            onClick={() => setFilter('all')}
            className={`py-1.5 rounded-lg transition ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            الكل ({students.length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`py-1.5 rounded-lg transition ${
              filter === 'paid'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50'
            }`}
          >
            سددوا ({paidCount})
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`py-1.5 rounded-lg transition ${
              filter === 'unpaid'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50'
            }`}
          >
            متبقي ({unpaidCount})
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`py-1.5 rounded-lg transition flex items-center justify-center gap-0.5 ${
              filter === 'overdue'
                ? 'bg-rose-600 text-white shadow-sm'
                : overdueCount > 0
                ? 'text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-50'
                : 'text-slate-400'
            }`}
            title="الطلاب الذين لم يسددوا واقتربت نهاية الشهر"
          >
            <span>إنذار</span>
            {overdueCount > 0 && <span className="text-[10px]">({overdueCount})</span>}
          </button>
        </div>
      </div>

      {/* Students List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 max-h-[55vh]">
        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-400" />
            <p>لا يوجد طلاب مطابقين للبحث أو الفلتر المحدد.</p>
          </div>
        ) : (
          filteredStudents.map((std) => (
            <div
              key={std.id}
              className={`p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-2.5 ${
                std.isPaid
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/60'
                  : std.isOverdueWarning
                  ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-purple-300'
              }`}
            >
              {/* Student Info */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                    std.isPaid
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : std.isOverdueWarning
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300'
                  }`}
                >
                  {std.name.charAt(0)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {std.name}
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                      {std.grade}
                    </span>
                    {std.isOverdueWarning && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse shrink-0">
                        ⚠️ متأخر
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                    <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">
                      {std.monthlyFee} {currency.symbol}
                    </span>
                    {std.phone && (
                      <span className="text-slate-400 truncate text-[10px]">
                        • {std.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {std.isPaid ? (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>سدد</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleRecordPaymentClick(std)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] font-bold shadow-sm transition active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>سداد</span>
                  </button>
                )}

                <div className="flex items-center gap-0.5 mr-0.5 border-r border-slate-200 dark:border-slate-800 pr-1">
                  <button
                    onClick={() => onEditStudent(std)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="تعديل بيانات الطالب"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(std)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="حذف الطالب"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </ModalWrapper>
  );
}
