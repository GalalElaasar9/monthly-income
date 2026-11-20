import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  Repeat,
  Plus,
  Tag,
  Briefcase,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CATEGORIES } from '../constants';
import CategoryIcon from './CategoryIcon';

export default function IncomeTable({
  incomes,
  jobs = [],
  currency,
  onEditIncome,
  onDeleteIncome,
  onToggleStatus,
  onOpenAddModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all, received, pending
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, amount-desc, amount-asc

  // Filter & Sort
  const filteredIncomes = useMemo(() => {
    return incomes
      .filter((item) => {
        const matchesSearch =
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.client && item.client.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.studentName && item.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

        const selectedJobObj = jobs.find((j) => j.id === selectedJobFilter);
        const matchesJob =
          selectedJobFilter === 'all' ||
          item.jobId === selectedJobFilter ||
          (!item.jobId && selectedJobObj && item.category === selectedJobObj.category) ||
          (selectedJobFilter === 'job-center' && (item.title?.includes('سنتر') || item.client?.includes('سنتر') || item.category === 'center')) ||
          (selectedJobFilter === 'job-private' && (item.title?.includes('فريلانس') || item.title?.includes('خاص') || item.category === 'private'));
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

        return matchesSearch && matchesJob && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [incomes, searchQuery, selectedJobFilter, statusFilter, sortBy]);

  const filteredTotal = filteredIncomes.reduce((acc, curr) => acc + curr.amount, 0);

  // Pagination: 8 items per page
  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedJobFilter, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredIncomes.length / ITEMS_PER_PAGE);
  const validCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedIncomes = filteredIncomes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden mb-12 transition-all">
      
      {/* Controls & Search Toolbar - Fully Responsive */}
      <div className="p-3.5 sm:p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col lg:flex-row gap-3 sm:gap-4 justify-between items-stretch lg:items-center">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-full lg:max-w-md">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث بالاسم، الطالب، جهة العمل، الملاحظات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
          
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            {/* Job Filter Dropdown */}
            <select
              value={selectedJobFilter}
              onChange={(e) => setSelectedJobFilter(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium rounded-xl px-2.5 sm:px-3 py-2 sm:py-2 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">جميع جهات العمل</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium rounded-xl px-2 sm:px-2.5 py-2 sm:py-2 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="date-desc">الأحدث أولاً</option>
              <option value="date-asc">الأقدم أولاً</option>
              <option value="amount-desc">الأعلى قيمة</option>
              <option value="amount-asc">الأقل قيمة</option>
            </select>
          </div>

          {/* Status Tabs */}
          <div className="grid grid-cols-3 sm:flex sm:items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs font-medium w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`py-1.5 px-2 sm:px-3 rounded-lg transition text-center ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setStatusFilter('received')}
              className={`py-1.5 px-2 sm:px-3 rounded-lg transition flex items-center justify-center gap-1 text-center ${
                statusFilter === 'received'
                  ? 'bg-emerald-500 text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-500'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>مستلم</span>
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`py-1.5 px-2 sm:px-3 rounded-lg transition flex items-center justify-center gap-1 text-center ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>معلق</span>
            </button>
          </div>

        </div>
      </div>

      {/* Empty State */}
      {filteredIncomes.length === 0 ? (
        <div className="py-14 sm:py-16 px-4 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <Tag className="w-7 h-7 sm:w-8 sm:h-8 opacity-40" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
            لا توجد سجلات دخل مطابقة
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
            {searchQuery || selectedJobFilter !== 'all' || statusFilter !== 'all'
              ? 'جرّب تغيير خيارات البحث أو الفلترة لعرض نتائج أكثر.'
              : 'لم تقم بتسجيل أي دخل في هذا الشهر حتى الآن.'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            تسجيل دخل لهذا الشهر
          </button>
        </div>
      ) : (
        /* Table View (100% Width with Smooth Horizontal Overflow Scroll & Sticky Header) */
        <div className="w-full overflow-x-auto scrollbar-thin max-h-[620px] overflow-y-auto">
          <table className="w-full text-right border-collapse min-w-[680px]">
            <thead className="sticky top-0 z-20 shadow-sm border-b border-slate-200 dark:border-slate-700/80">
              <tr className="text-xs font-bold text-slate-600 dark:text-slate-300">
                <th className="py-3.5 px-4 sm:px-6 bg-slate-100 dark:bg-slate-800">مصدر الدخل / الوصف</th>
                <th className="py-3.5 px-4 bg-slate-100 dark:bg-slate-800">جهة العمل</th>
                <th className="py-3.5 px-4 bg-slate-100 dark:bg-slate-800">التاريخ</th>
                <th className="py-3.5 px-4 bg-slate-100 dark:bg-slate-800">المبلغ</th>
                <th className="py-3.5 px-4 text-center bg-slate-100 dark:bg-slate-800">الحالة</th>
                <th className="py-3.5 px-4 text-center bg-slate-100 dark:bg-slate-800">الإجراءات</th>
              </tr>
            </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {paginatedIncomes.map((item) => {
                  const matchedJob =
                    jobs.find((j) => j.id === item.jobId) ||
                    jobs.find((j) => j.category === item.category) ||
                    (item.title?.includes('سنتر') || item.client?.includes('سنتر') ? jobs.find((j) => j.id === 'job-center') : null) ||
                    (item.title?.includes('فريلانس') || item.title?.includes('خاص') ? jobs.find((j) => j.id === 'job-private') : null);
                  const categoryMeta = CATEGORIES.find((c) => c.id === item.category) || {
                    name: item.category,
                    color: matchedJob?.color || '#10b981',
                    icon: matchedJob?.icon || 'Briefcase'
                  };
                  const isReceived = item.status === 'received';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition group"
                    >
                      {/* Title & Details */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm"
                            style={{
                              backgroundColor: `${matchedJob?.color || categoryMeta.color}18`,
                              color: matchedJob?.color || categoryMeta.color
                            }}
                          >
                            <CategoryIcon name={matchedJob?.icon || categoryMeta.icon} className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 dark:text-white">
                                {item.title}
                              </h4>
                              {item.isRecurring && (
                                <span
                                  title="دخل دوري متكرر كل شهر"
                                  className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                >
                                  <Repeat className="w-2.5 h-2.5" />
                                  دوري
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              {item.studentName ? (
                                <span className="font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                  🎓 الطالب: {item.studentName}
                                </span>
                              ) : item.client ? (
                                <span className="font-medium text-slate-600 dark:text-slate-300">
                                  🏢 {item.client}
                                </span>
                              ) : null}

                              {item.notes && (
                                <span className="truncate max-w-xs text-slate-400 dark:text-slate-500">
                                  • {item.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Job Stream Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {matchedJob ? (
                          <span
                            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{
                              backgroundColor: `${matchedJob.color}15`,
                              color: matchedJob.color,
                              border: `1px solid ${matchedJob.color}30`
                            }}
                          >
                            <CategoryIcon name={matchedJob.icon} className="w-3.5 h-3.5" />
                            <span>{matchedJob.title}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">عام</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap font-medium">
                        {item.date}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-baseline gap-1 font-bold">
                          <span className="text-base text-slate-900 dark:text-white">
                            {item.amount.toLocaleString('ar-EG')}
                          </span>
                          <span className="text-xs text-slate-400 font-normal">
                            {currency.symbol}
                          </span>
                        </div>
                      </td>

                      {/* Status Toggle Button */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => onToggleStatus(item.id)}
                          title="انقر لتغيير حالة الاستلام"
                          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold transition active:scale-95 border ${
                            isReceived
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {isReceived ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>مُستلم</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>معلق</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditIncome(item)}
                            title="تعديل هذا الدخل"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteIncome(item.id)}
                            title="حذف هذا الدخل"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
      )}

      {/* Pagination Bar (when filteredIncomes.length > 8) */}
      {totalPages > 1 && (
        <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 dark:text-slate-400 font-medium">
            عرض <span className="font-bold text-slate-800 dark:text-slate-200">{startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredIncomes.length)}</span> من أصل <span className="font-bold text-slate-800 dark:text-slate-200">{filteredIncomes.length}</span> بند دخْل
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage === 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1 font-bold shadow-sm active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                    validCurrentPage === pageNum
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/30'
                      : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-sm'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage === totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1 font-bold shadow-sm active:scale-95"
            >
              <span>التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Footer Bar */}
      {filteredIncomes.length > 0 && (
        <div className="p-3.5 sm:p-4 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <div>
            عرض <span className="font-bold text-slate-700 dark:text-slate-200">{filteredIncomes.length}</span> من أصل <span className="font-bold text-slate-700 dark:text-slate-200">{incomes.length}</span> بند دخْل
          </div>
          <div className="flex items-center gap-2">
            <span>إجمالي المعروض:</span>
            <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
              {filteredTotal.toLocaleString('ar-EG')} {currency.symbol}
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
