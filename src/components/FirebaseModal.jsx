import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  LogIn,
  UserPlus
} from 'lucide-react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import ModalWrapper from './ModalWrapper';

export default function FirebaseModal({
  isOpen,
  onClose,
  cloudUser,
  setCloudUser,
  onSyncToCloud,
  isSyncing,
  showToast
}) {
  const [authMode, setAuthMode] = useState('login'); // login, register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Email / Password Auth
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!auth) {
      showToast('خدمة السحابة غير مهيأة.', 'error');
      return;
    }

    try {
      if (authMode === 'login') {
        const res = await signInWithEmailAndPassword(auth, email, password);
        setCloudUser(res.user);
        showToast('تم تسجيل الدخول السحابي بنجاح!', 'success');
        setTimeout(() => onClose(), 800);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        setCloudUser(res.user);
        showToast('تم إنشاء الحساب ومزامنته بالسحابة بنجاح!', 'success');
        setTimeout(() => onClose(), 800);
      }
    } catch (err) {
      console.error(err);
      let msg = 'تعذر الدخول، تأكد من صحة البريد وكلمة المرور';
      if (err.code === 'auth/email-already-in-use') msg = 'هذا البريد مسجل بالفعل، يمكنك تسجيل الدخول به.';
      if (err.code === 'auth/weak-password') msg = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';
      if (err.code === 'auth/invalid-credential') msg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      showToast(msg, 'error');
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    if (!auth) {
      showToast('خدمة السحابة غير مهيأة.', 'error');
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      setCloudUser(res.user);
      showToast('تم تسجيل الدخول بحساب Google بنجاح!', 'success');
      setTimeout(() => onClose(), 800);
    } catch (err) {
      console.error(err);
      showToast('تعذر تسجيل الدخول بحساب Google: ' + err.message, 'error');
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setCloudUser(null);
      showToast('تم تسجيل الخروج من السحابة.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>المزامنة السحابية والفورية ⚡</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                قاعدة بيانات فورية (Supabase Realtime) • متصلة وتتزامن بين الموبايل والكمبيوتر
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Status Banner */}
          <div className="p-4 rounded-2xl border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold block">
                  المزامنة اللحظية الفورية نشطة ⚡
                </span>
                <span className="text-[11px] opacity-80">
                  أي تعديل على هاتفك يظهر فوراً على الكمبيوتر والعكس دون الحاجة لتحديث الصفحة.
                </span>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
              🟢 متزامن لحظياً
            </span>
          </div>

          {/* User Account / Login State */}
          <div className="space-y-4 pt-1">
            {cloudUser ? (
              /* Connected User Panel */
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">الحساب السحابي النشط:</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {cloudUser.email}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-rose-600 hover:underline font-bold"
                  >
                    تسجيل خروج
                  </button>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={onSyncToCloud}
                    disabled={isSyncing}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow transition flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'جارٍ المزامنة...' : 'رفع ومزامنة البيانات للسحابة الآن'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Cloud Sign-in Form */
              <div className="space-y-3.5">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 py-1.5 rounded-lg transition ${
                      authMode === 'login' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className={`flex-1 py-1.5 rounded-lg transition ${
                      authMode === 'register' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    إنشاء حساب سحابي
                  </button>
                </div>

                {/* Google Quick Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-2.5 shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>الدخول الفوري بحساب Google</span>
                </button>

                <div className="relative text-center my-2">
                  <span className="bg-white dark:bg-slate-900 px-3 text-[10px] text-slate-400 relative z-10 font-bold">
                    أو بالبريد وكلمة المرور
                  </span>
                  <div className="absolute inset-0 top-1/2 border-t border-slate-200 dark:border-slate-800" />
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-3">
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="البريد الإلكتروني"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      required
                      placeholder="كلمة المرور (6 أحرف على الأقل)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition flex items-center justify-center gap-1.5"
                  >
                    {authMode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    <span>{authMode === 'login' ? 'دخول ومزامنة' : 'إنشاء حساب ومزامنة'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Quick Steps Guide */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-500" />
              <span>كيف أفتح الموقع على هاتفي؟</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              <li>سجل دخولك هنا بالبريد الإلكتروني أو بحساب جوجل.</li>
              <li>انشر موقعك (عبر Vercel أو Netlify أو Firebase) برابط مجاني خاص بك.</li>
              <li>افتح الرابط من هاتفك وسجل الدخول بنفس الإيميل، وستجد كل مدخولاتك وطلابك متزامنة لحظياً!</li>
            </ol>
          </div>
        </div>
    </ModalWrapper>
  );
}
