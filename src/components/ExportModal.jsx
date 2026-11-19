import React, { useRef } from 'react';
import { X, Download, Upload, RefreshCw, FileSpreadsheet, FileJson, AlertCircle } from 'lucide-react';
import { CATEGORIES } from '../constants';
import ModalWrapper from './ModalWrapper';

export default function ExportModal({
  isOpen,
  onClose,
  incomes,
  onImportData,
  onResetToSample,
  currency,
  showToast,
  openConfirm
}) {
  const fileInputRef = useRef(null);

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const headers = ['العنوان', 'المبلغ', 'العملة', 'الفئة', 'التاريخ', 'الحالة', 'دوري', 'العميل', 'الملاحظات'];
      const rows = incomes.map((item) => {
        const cat = CATEGORIES.find((c) => c.id === item.category)?.name || item.category;
        const statusName = item.status === 'received' ? 'مستلم' : 'معلق';
        const isRec = item.isRecurring ? 'نعم' : 'لا';
        return [
          `"${(item.title || '').replace(/"/g, '""')}"`,
          item.amount,
          currency.code,
          `"${cat}"`,
          item.date,
          `"${statusName}"`,
          `"${isRec}"`,
          `"${(item.client || '').replace(/"/g, '""')}"`,
          `"${(item.notes || '').replace(/"/g, '""')}"`,
        ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `monthly-income-backup-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('تم تصدير ملف الإكسيل بنجاح!', 'success');
    } catch {
      showToast('تعذر تصدير ملف الإكسيل', 'error');
    }
  };

  // Export to JSON
  const handleExportJSON = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(incomes, null, 2));
      const link = document.createElement('a');
      link.href = dataStr;
      link.download = `monthly-income-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      showToast('تم تصدير النسخة الاحتياطية بنجاح!', 'success');
    } catch {
      showToast('تعذر تصدير النسخة الاحتياطية', 'error');
    }
  };

  // Import JSON
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          onImportData(parsed);
          showToast('تم استيراد البيانات بنجاح واسترجاع السجلات!', 'success');
          onClose();
        } else {
          showToast('ملف غير صالح: يجب أن يحتوي الملف على مصفوفة من السجلات.', 'error');
        }
      } catch (err) {
        showToast('حدث خطأ أثناء قراءة الملف، تأكد من صحة صيغة JSON.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetClick = () => {
    openConfirm({
      title: 'تفريغ ومسح كافة البيانات',
      message: 'هل أنت متأكد من مسح وتصفير كافة السجلات والطلاب؟ ستبدأ بصفحة نظيفة تماماً.',
      confirmText: 'نعم، تفريغ الكل',
      isDanger: true,
      onConfirm: () => {
        onResetToSample();
        onClose();
      }
    });
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" className="p-6">
      {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                تصدير وإدارة البيانات
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                حفظ نسخة احتياطية أو استرجاع بياناتك
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

        {/* Options */}
        <div className="space-y-3">
          
          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition text-right group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  تصدير إلى ملف Excel / CSV
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  مناسب للفتح عبر برنامج الإكسيل وجداول البيانات
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
          </button>

          {/* JSON Export */}
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition text-right group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  تصدير نسخة احتياطية كاملة (JSON)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  لحفظ بياناتك واسترجاعها في أي وقت
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
          </button>

          {/* JSON Import */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition text-right group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    استيراد بيانات من ملف JSON
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    رفع ملف نسخة احتياطية سابقة
                  </p>
                </div>
              </div>
              <Upload className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition" />
            </button>
          </div>

          {/* Clear all data */}
          <button
            onClick={handleResetClick}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-dashed border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/50 transition text-right group text-rose-700 dark:text-rose-400 text-xs font-medium"
          >
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4" />
              <span>تفريغ وتصفير كافة السجلات الحالية</span>
            </div>
            <span className="text-[11px] opacity-75">مسح الكل</span>
          </button>

        </div>
    </ModalWrapper>
  );
}
