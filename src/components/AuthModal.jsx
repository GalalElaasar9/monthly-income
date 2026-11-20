import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  LogIn,
  ShieldCheck,
  Cloud,
  UploadCloud,
  DownloadCloud,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  ArrowUpRight
} from 'lucide-react';
import ModalWrapper from './ModalWrapper';

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  cloudUser,
  isSyncing,
  onManualPushToCloud,
  onManualPullFromCloud,
  onOpenCloudLogin,
  incomesCount = 0,
  studentsCount = 0,
  withdrawalsCount = 0,
  onSaveUser,
  onLogout
}) {
  const [name, setName] = useState(currentUser?.name || '');
  const [role, setRole] = useState(currentUser?.role || 'معلم ومحاضر مستقل');

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const userData = {
      ...(currentUser || {}),
      name: name.trim(),
      role: role.trim(),
      avatar: name.trim().charAt(0).toUpperCase()
    };

    onSaveUser(userData);
    onClose();
  };

  const isConnectedToCloud = !!cloudUser;
  const userEmail = cloudUser?.email || currentUser?.email || 'حساب محلي';
  const displayName = currentUser?.name || cloudUser?.displayName || userEmail.split('@')[0];

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg" className="p-0">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>الحساب والمزامنة السحابية</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              قاعدة بيانات فورية (Supabase Realtime) • مزامنة لحظية بين الهاتف والكمبيوتر ⚡
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

      {/* Modal Body */}
      <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        
        {/* User Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-lg flex items-center justify-center shadow-md shadow-emerald-500/25">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {displayName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {userEmail}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3" />
                  متزامن لحظياً (Supabase Realtime ⚡)
                </span>
              </div>
            </div>
          </div>

          {!isConnectedToCloud && onOpenCloudLogin && (
            <button
              onClick={onOpenCloudLogin}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition flex items-center gap-1 shrink-0"
            >
              <span>ربط السحابة</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Current Device Local Stats */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>البيانات المحفوظة على هذا المتصفح:</span>
            </span>
            <span className="text-[11px] text-slate-400">محدثة ومخزنة محلياً</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="block text-base font-black text-emerald-600 dark:text-emerald-400">
                {incomesCount}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                بند إيراد
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="block text-base font-black text-teal-600 dark:text-teal-400">
                {studentsCount}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                طالب مسجل
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="block text-base font-black text-amber-600 dark:text-amber-400">
                {withdrawalsCount}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                عملية سحب
              </span>
            </div>
          </div>
        </div>

        {/* Auto Sync Banner */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold block">المزامنة التلقائية مفعلة ⚡</span>
            <span className="text-[11px] opacity-80 block">
              أي عملية تسجيل أو تعديل تقوم بها على أي جهاز تُحفظ وتظهر فوراً على هاتفك وباقي أجهزتك تلقائياً دون أي تدخل منك.
            </span>
          </div>
        </div>

        {/* Cloud Sync Actions */}
        <div className="space-y-3 pt-1">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>أدوات المزامنة الاحتياطية (اختياري):</span>
            {isSyncing && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                <RefreshCw className="w-3 h-3 animate-spin" />
                جارٍ الاتصال بالسحابة...
              </span>
            )}
          </div>

          {/* Button 1: Push Local to Cloud */}
          <button
            type="button"
            disabled={isSyncing}
            onClick={onManualPushToCloud}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-[0.98] transition flex items-center justify-between gap-3 disabled:opacity-50 text-right"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <UploadCloud className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block text-sm font-bold">
                  رفع ومزامنة بيانات هذا الجهاز للسحابة ☁️⬆️
                </span>
                <span className="block text-[11px] text-emerald-100 font-normal">
                  ارفع كل السجلات من هنا للسحابة لتظهر فوراً على هاتفك وأي متصفح آخر
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 shrink-0 opacity-80" />
          </button>

          {/* Button 2: Pull Cloud to Local */}
          <button
            type="button"
            disabled={isSyncing}
            onClick={onManualPullFromCloud}
            className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-emerald-500/40 hover:border-emerald-500 text-slate-800 dark:text-white font-bold text-xs hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 active:scale-[0.98] transition flex items-center justify-between gap-3 disabled:opacity-50 text-right shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <DownloadCloud className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  سحب وتحديث البيانات من السحابة 🔄⬇️
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  اجلب أحدث البيانات المسجلة من السحابة لتحديث شاشة هذا المتصفح
                </span>
              </div>
            </div>
            <RefreshCw className={`w-4 h-4 text-emerald-600 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Security & Sync Note */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span className="text-[11px] leading-relaxed">
            بياناتك مشفرة ومحمية بقواعد أمان Firestore، ولا يمكن لأي شخص آخر الوصول إليها سوى صاحب هذا الحساب ({userEmail}).
          </span>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              if (onLogout) onLogout();
            }}
            className="flex-1 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition"
          >
            تسجيل الخروج
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold transition"
          >
            إغلاق
          </button>
        </div>

      </div>
    </ModalWrapper>
  );
}
