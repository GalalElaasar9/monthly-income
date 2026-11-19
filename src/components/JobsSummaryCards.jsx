import React from 'react';
import {
  Briefcase,
  Building2,
  GraduationCap,
  Users,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit2
} from 'lucide-react';
import CategoryIcon from './CategoryIcon';

export default function JobsSummaryCards({
  jobs,
  currentMonthIncomes,
  students,
  currency,
  onOpenAddJob,
  onEditJob,
  onOpenStudentsModal,
  onOpenAddIncomeWithJob
}) {
  // Compute total for each job in the selected month
  const jobStats = jobs.map((job) => {
    const jobIncomes = currentMonthIncomes.filter((inc) => {
      if (inc.jobId && inc.jobId === job.id) return true;
      if (inc.category && inc.category === job.category) return true;
      if (job.id === 'job-center' && (inc.title?.includes('سنتر') || inc.client?.includes('سنتر') || inc.category === 'center')) return true;
      if (job.id === 'job-private' && (inc.title?.includes('فريلانس') || inc.title?.includes('خاص') || inc.category === 'private')) return true;
      if (job.id === 'job-company' && (inc.title?.includes('شركة') || inc.category === 'salary')) return true;
      if (job.id === 'job-online' && (inc.studentId || inc.studentName || inc.category === 'students')) return true;
      return false;
    });
    const received = jobIncomes
      .filter((inc) => inc.status === 'received')
      .reduce((sum, inc) => sum + inc.amount, 0);
    const pending = jobIncomes
      .filter((inc) => inc.status === 'pending')
      .reduce((sum, inc) => sum + inc.amount, 0);
    const total = received + pending;

    // For students job: count how many distinct students paid this month & grade breakdown
    let paidStudentCount = 0;
    let grade1Total = 0;
    let grade2Total = 0;

    if (job.type === 'students') {
      const paidStudentIds = new Set(
        jobIncomes.filter((inc) => inc.status === 'received' && inc.studentId).map((inc) => inc.studentId)
      );
      paidStudentCount = paidStudentIds.size;

      jobIncomes.forEach((inc) => {
        if (inc.status === 'received') {
          const std = students.find((s) => s.id === inc.studentId);
          const g = (std?.grade || '').toLowerCase();
          if (g.includes('أولى') || g.includes('1 ثانوي')) {
            grade1Total += inc.amount;
          } else if (g.includes('تانية') || g.includes('ثانية') || g.includes('2 ثانوي')) {
            grade2Total += inc.amount;
          }
        }
      });
    }

    return {
      ...job,
      received,
      pending,
      total,
      count: jobIncomes.length,
      paidStudentCount,
      grade1Total,
      grade2Total
    };
  });

  return (
    <div className="mb-8">
      {/* Header with responsive wrapping */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>توزيع الدخل حسب نوع الشغل والجهات</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              {jobs.length} جهات
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            مجموع ما حققته من كل شغل (الشركة، السنتر، الطلبة أونلاين، الشغل الخاص)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={onOpenStudentsModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-xs font-semibold transition"
          >
            <Users className="w-3.5 h-3.5" />
            <span>إدارة وتتبع الطلاب ({students.length})</span>
          </button>
          
          <button
            onClick={onOpenAddJob}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة جهة</span>
          </button>
        </div>
      </div>

      {/* Grid of Job Cards: 1 col on mobile, 2 cols on tablet, 4 cols on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {jobStats.map((job) => {
          const isStudentsJob = job.type === 'students';
          const studentCompletionRate = students.length > 0 && isStudentsJob
            ? Math.round((job.paidStudentCount / students.length) * 100)
            : 0;

          return (
            <div
              key={job.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm card-hover hover:shadow-xl hover:border-emerald-500/30 transition-all relative flex flex-col justify-between group"
            >
              <div>
                {/* Header of Card */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                      style={{ backgroundColor: `${job.color}18`, color: job.color }}
                    >
                      <CategoryIcon name={job.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        {job.title}
                      </h3>
                      <span className="text-[11px] text-slate-400 block line-clamp-1">
                        {job.description || (isStudentsJob ? 'اشتراكات الطلاب' : 'دخل شهري')}
                      </span>
                    </div>
                  </div>

                  {/* Always accessible on touch/mobile, hover on desktop */}
                  <button
                    onClick={() => onEditJob(job)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition sm:opacity-0 sm:group-hover:opacity-100"
                    title="تعديل بيانات جهة العمل"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Amount Display */}
                <div className="my-2">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {job.received > 0
                        ? job.received.toLocaleString('ar-EG')
                        : job.pending > 0
                        ? job.pending.toLocaleString('ar-EG')
                        : '0'}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {currency.symbol}
                    </span>
                    {job.pending > 0 && job.received > 0 && (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        (+{job.pending.toLocaleString('ar-EG')} معلق)
                      </span>
                    )}
                    {job.received === 0 && job.pending > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 font-bold">
                        معلق
                      </span>
                    )}
                  </div>
                </div>

                {/* Specific details for students vs regular jobs */}
                {isStudentsJob ? (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">سداد الطلاب:</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {job.paidStudentCount} من {students.length} ({studentCompletionRate}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all"
                        style={{ width: `${studentCompletionRate}%` }}
                      />
                    </div>

                    {/* Breakdown pills: أولى ثانوي وتانية ثانوي */}
                    <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-purple-100 dark:border-purple-900/50 text-[11px]">
                      <div className="bg-purple-50/70 dark:bg-purple-950/40 p-1.5 rounded-lg text-center">
                        <span className="text-slate-400 block text-[10px]">أولى ثانوي</span>
                        <span className="font-bold text-purple-700 dark:text-purple-300">
                          {job.grade1Total.toLocaleString('ar-EG')} {currency.symbol}
                        </span>
                      </div>
                      <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-1.5 rounded-lg text-center">
                        <span className="text-slate-400 block text-[10px]">تانية ثانوي</span>
                        <span className="font-bold text-indigo-700 dark:text-indigo-300">
                          {job.grade2Total.toLocaleString('ar-EG')} {currency.symbol}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <span>عدد الدفعات:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {job.count} {job.count === 1 ? 'دفعة' : 'دفعات'}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Action Button with comfortable touch padding */}
              <div className="mt-4 pt-2">
                {isStudentsJob ? (
                  <button
                    onClick={onOpenStudentsModal}
                    className="w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-semibold text-xs transition flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <span>تسجيل اشتراك طالب</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenAddIncomeWithJob(job.id)}
                    className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs transition flex items-center justify-center gap-1 active:scale-98"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-500" />
                    <span>تسجيل إيراد هنا</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
