import React from 'react';
import {
  Smartphone,
  Download,
  Share,
  PlusSquare,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
  Zap,
  ShieldCheck
} from 'lucide-react';
import ModalWrapper from './ModalWrapper';

export default function InstallPwaModal({
  isOpen,
  onClose,
  canInstallPrompt,
  onTriggerInstall,
  isInstalled = false
}) {
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" className="p-0">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>تثبيت "مدخولي" كتطبيق موبايل</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              يعمل كـ App أصلي على هاتفك بشاشة كاملة وسرعة فائقة
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

      {/* Body */}
      <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        
        {/* Features Card */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2.5">
          <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>مميزات تثبيت التطبيق على هاتفك:</span>
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pr-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>أيقونة خاصة على الشاشة الرئيسية بجانب تطبيقاتك</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>يفتح بشاشة كاملة (Standalone) بدون شريط المتصفح</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>مزامنة سحابية لحظية ⚡ مع الكمبيوتر وأي جهاز آخر</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>تحديثات تلقائية وفورية دون الحاجة لتنزيل تحديث يدوي</span>
            </li>
          </ul>
        </div>

        {/* Action based on Device / State */}
        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              التطبيق مثبت بالفعل على جهازك! 🎉
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              يمكنك فتحه مباشرة من أيقونة "مدخولي" على شاشة هاتفك الرئيسية.
            </p>
          </div>
        ) : canInstallPrompt ? (
          /* One-click Install for Android / Chrome / Edge */
          <div className="space-y-3">
            <button
              onClick={() => {
                onTriggerInstall();
                onClose();
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>اضغط هنا لتثبيت التطبيق فوراً 📲</span>
            </button>
            <p className="text-[11px] text-center text-slate-400">
              سيظهر لك إشعار نظام Android أو المتصفح، اضغط "تثبيت" (Install) لإضافته لشاشتك.
            </p>
          </div>
        ) : isIOS ? (
          /* iOS Safari Guide */
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>خطوات التثبيت على أجهزة iPhone / iPad (سفاري):</span>
            </h4>
            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 list-decimal pr-4">
              <li className="leading-relaxed">
                اضغط على زر <strong>المشاركة</strong> (<Share className="w-3.5 h-3.5 inline mx-1 text-sky-500" /> Share) في أسفل شريط سفاري.
              </li>
              <li className="leading-relaxed">
                مرر لأسفل واختر <strong>"إضافة إلى الصفحة الرئيسية"</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-1 text-slate-700 dark:text-slate-200" /> Add to Home Screen).
              </li>
              <li className="leading-relaxed">
                اضغط على <strong>"إضافة"</strong> (Add) في الزاوية العلوية، وستظهر أيقونة التطبيق على شاشتك فوراً!
              </li>
            </ol>
          </div>
        ) : (
          /* General Browser Fallback Guide */
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              طريقة التثبيت من قائمة المتصفح:
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              1. اضغط على قائمة الخيارات (نقاط القائمة الثلاث <strong>⋮</strong>) في متصفحك.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              2. اختر <strong>"تثبيت التطبيق"</strong> (Install App) أو <strong>"إضافة إلى الشاشة الرئيسية"</strong> (Add to Home Screen).
            </p>
          </div>
        )}

      </div>
    </ModalWrapper>
  );
}
