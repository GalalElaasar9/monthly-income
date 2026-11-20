import React from 'react';
import {
  Smartphone,
  Download,
  Share,
  PlusSquare,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  MoreVertical,
  ArrowRight
} from 'lucide-react';
import ModalWrapper from './ModalWrapper';

export default function InstallPwaModal({
  isOpen,
  onClose,
  canInstallPrompt,
  onTriggerInstall
}) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" className="p-0">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>تثبيت تطبيق "مدخولي"</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              كتطبيق أصلي على شاشة هاتفك الرئيسية
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

      {/* Body */}
      <div className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        
        {/* Direct One-Click Install Button if supported by browser */}
        {canInstallPrompt && (
          <div className="space-y-2">
            <button
              onClick={() => {
                onTriggerInstall();
                onClose();
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>اضغط هنا لتثبيت التطبيق فوراً 📲</span>
            </button>
            <p className="text-[11px] text-center text-emerald-600 dark:text-emerald-400 font-bold">
              سيظهر لك إشعار المتصفح، اضغط "تثبيت" (Install) لإضافته فوراً
            </p>
          </div>
        )}

        {/* Clear Step-by-Step Manual Guide (Works 100% on all Android & iPhone devices) */}
        <div className="space-y-3">
          
          {/* Android Guide */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center text-xs">
                🤖
              </span>
              <span>طريقة التثبيت على أندرويد (Google Chrome):</span>
            </div>

            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-decimal pr-4 leading-relaxed">
              <li>
                اضغط على زر القائمة (الثلاث نقاط <MoreVertical className="w-3.5 h-3.5 inline mx-0.5 text-slate-700 dark:text-slate-200" /> أعلى المتصفح).
              </li>
              <li>
                اختر <strong className="text-emerald-600 dark:text-emerald-400">"تثبيت التطبيق" (Install app)</strong> أو <strong className="text-emerald-600 dark:text-emerald-400">"إضافة إلى الشاشة الرئيسية"</strong>.
              </li>
              <li>
                اضغط <strong>"تثبيت"</strong> وسيظهر التطبيق كأيقونة مستقلة بجانب تطبيقاتك!
              </li>
            </ol>
          </div>

          {/* iPhone / iPad (Safari) Guide */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 flex items-center justify-center text-xs">
                🍏
              </span>
              <span>طريقة التثبيت على آيفون (Safari):</span>
            </div>

            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-decimal pr-4 leading-relaxed">
              <li>
                اضغط على زر المشاركة (<Share className="w-3.5 h-3.5 inline mx-0.5 text-sky-500" /> Share) أسفل شاشة سفاري.
              </li>
              <li>
                مرر لأسفل واختر <strong className="text-sky-600 dark:text-sky-400">"إضافة إلى الصفحة الرئيسية"</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-slate-700 dark:text-slate-200" /> Add to Home Screen).
              </li>
              <li>
                اضغط على <strong>"إضافة" (Add)</strong> في الزاوية العلوية، وستظهر أيقونة التطبيق على شاشتك فوراً!
              </li>
            </ol>
          </div>

        </div>

        {/* Benefits reminder */}
        <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1">
          <p className="font-bold">⚡ مميزات بعد التثبيت:</p>
          <p>• يعمل بشاشة كاملة مثل التطبيقات المحملة من المتجر بدون شريط المتصفح.</p>
          <p>• مزامنة فورية وتلقائية مع حسابك وبياناتك.</p>
        </div>

      </div>
    </ModalWrapper>
  );
}
