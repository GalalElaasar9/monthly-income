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
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>سجل ومتابعة اشتراكات الطلاب</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                {students.length} طالب
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              فصل ومتابعة دخل أولى وثانية ثانوي وإنذارات المتأخرين قبل نهاية الشهر
            </p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Stage Group Income Cards (فصل دخل كل مجموعة) */}
      <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>دخل وإحصائيات كل مرحلة على حدة:</span>
          </span>
          <span className="text-slate-400 text-[11px]">
            إجمالي الاشتراكات: {(collectedTotal + remainingTotal).toLocaleString('ar-EG')} {currency.symbol}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          
          {/* Card: أولى ثانوي */}
          <div
            onClick={() => setGradeFilter(gradeFilter === 'grade1' ? 'all' : 'grade1')}
            className={`p-3 rounded-2xl border cursor-pointer transition-all ${
              gradeFilter === 'grade1'
                ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/50 ring-2 ring-purple-500/20'
                : 'border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>مجموعة أولى ثانوي</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {gradeBreakdown.grade1.paid} من {gradeBreakdown.grade1.students.length} سددوا
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <div>
                <span className="text-slate-400 text-[11px] ml-1">المحصل:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {gradeBreakdown.grade1.collected.toLocaleString('ar-EG')} {currency.symbol}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] ml-1">المتبقي:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {gradeBreakdown.grade1.remaining.toLocaleString('ar-EG')} {currency.symbol}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
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
          </div>

          {/* Card: تانية ثانوي */}
          <div
            onClick={() => setGradeFilter(gradeFilter === 'grade2' ? 'all' : 'grade2')}
            className={`p-3 rounded-2xl border cursor-pointer transition-all ${
              gradeFilter === 'grade2'
                ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20'
                : 'border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>مجموعة تانية ثانوي</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {gradeBreakdown.grade2.paid} من {gradeBreakdown.grade2.students.length} سددوا
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <div>
                <span className="text-slate-400 text-[11px] ml-1">المحصل:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {gradeBreakdown.grade2.collected.toLocaleString('ar-EG')} {currency.symbol}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] ml-1">المتبقي:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {gradeBreakdown.grade2.remaining.toLocaleString('ar-EG')} {currency.symbol}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
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
          </div>

        </div>
      </div>

      {/* Grade Selector Tabs */}
      <div className="px-4 pt-3 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
        <button
          onClick={() => setGradeFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
            gradeFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          كل المراحل ({students.length})
        </button>
        <button
          onClick={() => setGradeFilter('grade1')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
            gradeFilter === 'grade1'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
          }`}
        >
          أولى ثانوي ({gradeBreakdown.grade1.students.length})
        </button>
        <button
          onClick={() => setGradeFilter('grade2')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
            gradeFilter === 'grade2'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
          }`}
        >
          تانية ثانوي ({gradeBreakdown.grade2.students.length})
        </button>
        {gradeBreakdown.grade3.students.length > 0 && (
          <button
            onClick={() => setGradeFilter('grade3')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
              gradeFilter === 'grade3'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
            }`}
          >
            ثانوية عامة ({gradeBreakdown.grade3.students.length})
          </button>
        )}
      </div>

      {/* Controls: Search & Add button & Status Tabs */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-2.5">
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

        {/* Filter Tabs - Full width and touch friendly */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium w-full overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 min-w-[50px] py-1.5 px-2 rounded-lg transition text-center whitespace-nowrap ${
              filter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold' : 'text-slate-500'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg transition text-center whitespace-nowrap ${
              filter === 'paid' ? 'bg-emerald-500 text-white shadow-sm font-bold' : 'text-slate-500'
            }`}
          >
            سددوا ({paidCount})
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-lg transition text-center whitespace-nowrap ${
              filter === 'unpaid' ? 'bg-amber-500 text-white shadow-sm font-bold' : 'text-slate-500'
            }`}
          >
            لم يسددوا ({unpaidCount})
          </button>
          {overdueCount > 0 && (
            <button
              onClick={() => setFilter('overdue')}
              className={`flex-1 min-w-[80px] py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 whitespace-nowrap ${
                filter === 'overdue'
                  ? 'bg-rose-600 text-white shadow-sm font-bold'
                  : 'text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-50'
              }`}
              title="الطلاب الذين لم يسددوا واقتربت نهاية الشهر (أقل من 5 أيام)"
            >
              <span>⚠️ إنذار ({overdueCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Students List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[48vh]">
        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-400" />
            <p>لا يوجد طلاب مطابقين للبحث أو الفلتر المحدد.</p>
          </div>
        ) : (
          filteredStudents.map((std) => (
            <div
              key={std.id}
              className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                std.isPaid
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/60'
                  : std.isOverdueWarning
                  ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-purple-300'
              }`}
            >
              {/* Student Info */}
              <div className="flex items-start gap-3">
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
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {std.name}
                    </h4>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {std.grade}
                    </span>

                    {/* Overdue Warning Alert Tag (قبل نهاية الشهر بـ 5 أيام) */}
                    {std.isOverdueWarning && (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/90 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                        <span>إنذار: اقتربت نهاية الشهر ولم يسدد</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {std.monthlyFee} {currency.symbol} شهرياً
                    </span>
                    {std.phone && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Phone className="w-3 h-3" />
                        {std.phone}
                      </span>
                    )}
                    {std.notes && (
                      <span className="text-slate-400 truncate max-w-xs">
                        • {std.notes}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60">
                {std.isPaid ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>سدد اشتراك الشهر</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRecordPaymentClick(std)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow transition active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>تسجيل سداد ({std.monthlyFee} {currency.symbol})</span>
                  </button>
                )}

                <div className="flex items-center gap-1 mr-1 border-r border-slate-200 dark:border-slate-800 pr-2">
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
