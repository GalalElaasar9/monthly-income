import React, { useState } from 'react';
import {
  Wallet,
  Lock,
  Mail,
  User,
  LogIn,
  UserPlus,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Building2,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { auth, isFirebaseConfigured } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';

export default function AuthScreen({
  onLoginSuccess,
  darkMode,
  setDarkMode,
  showToast
}) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('معلم ومطور برمجيات');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isFirebaseActive = isFirebaseConfigured();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // If Firebase is configured, perform real Cloud Auth
      if (isFirebaseActive && auth) {
        if (isRegister) {
          const res = await createUserWithEmailAndPassword(auth, email, password);
          const userData = {
            name: name.trim() || email.split('@')[0],
            email: email.trim(),
            role: role.trim(),
            avatar: (name.trim() || email).charAt(0).toUpperCase(),
            uid: res.user.uid,
            isCloud: true
          };
          showToast('تم إنشاء الحساب ومزامنته بالسحابة بنجاح!', 'success');
          onLoginSuccess(userData);
        } else {
          const res = await signInWithEmailAndPassword(auth, email, password);
          const userData = {
            name: res.user.displayName || email.split('@')[0],
            email: email.trim(),
            role: 'مستخدم سحابي',
            avatar: email.charAt(0).toUpperCase(),
            uid: res.user.uid,
            isCloud: true
          };
          showToast('تم تسجيل الدخول بنجاح! مرحباً بعودتك.', 'success');
          onLoginSuccess(userData);
        }
      } else {
        // Local Account Authentication Gate
        if (isRegister && !name.trim()) {
          showToast('يرجى إدخال اسمك الكريم', 'error');
          setIsLoading(false);
          return;
        }

        const userData = {
          name: isRegister ? name.trim() : (name.trim() || 'أحمد محمد'),
          role: role.trim() || 'معلم ومحاضر مستقل',
          email: email.trim() || 'user@example.com',
          avatar: (name.trim() || 'أ').charAt(0).toUpperCase(),
          createdAt: new Date().toISOString()
        };

        showToast(isRegister ? 'تم إنشاء حسابك وتفعيله بنجاح!' : 'مرحباً بك مجدداً في مدخولي!', 'success');
        onLoginSuccess(userData);
      }
    } catch (err) {
      console.error(err);
      let errMsg = 'حدث خطأ أثناء تسجيل الدخول، تأكد من صحة البيانات.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        errMsg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'هذا البريد مسجل بالفعل، يمكنك تسجيل الدخول به.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';
      }
      showToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    if (!isFirebaseActive || !auth) {
      showToast('يرجى تفعيل وربط مفاتيح Firebase أولاً لتسجيل الدخول بـ Google', 'info');
      return;
    }

    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const res = await signInWithPopup(auth, provider);
      const userData = {
        name: res.user.displayName || res.user.email.split('@')[0],
        email: res.user.email,
        role: 'مستخدم معتمد',
        avatar: (res.user.displayName || res.user.email).charAt(0).toUpperCase(),
        uid: res.user.uid,
        isCloud: true
      };
      showToast('تم تسجيل الدخول بحساب Google بنجاح!', 'success');
      onLoginSuccess(userData);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        showToast('تم إلغاء نافذة تسجيل الدخول', 'info');
      } else if (err.code === 'auth/network-request-failed' || err.message?.includes('network') || err.message?.includes('reset')) {
        showToast('تعذر الاتصال بـ Google عبر الشبكة المحلية. يرجى استخدام البريد الإلكتروني وكلمة المرور أدناه.', 'error');
      } else {
        showToast('تعذر تسجيل الدخول بـ Google: ' + (err.message || 'خطأ في الاتصال'), 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fast Demo Login
  const handleQuickDemoLogin = () => {
    const demoUser = {
      name: 'أحمد محمد',
      role: 'معلم ومطور برمجيات',
      email: 'ahmed@example.com',
      avatar: 'أ',
      isDemo: true
    };
    showToast('تم تسجيل الدخول بالحساب التجريبي!', 'success');
    onLoginSuccess(demoUser);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      
      {/* Animated Background Gradients & Glows */}
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />
      <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none animate-pulse duration-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Dark / Light Toggle in corner */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-white transition backdrop-blur-md"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Card */}
      <div className="relative z-10 max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 p-6 sm:p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500">
        
        {/* Brand Logo & Headline */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25 animate-bounce-slow">
            <Wallet className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>مدخولي</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              بوابة الدخول الآمنة
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            سجل دخولك الآن لإدارة وتتبع دخلك الشهري، والطلاب، وجهات عملك
          </p>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
            <GraduationCap className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-300 block font-bold">متابعة الطلاب</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
            <Building2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-300 block font-bold">دخل متعدد</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
            <ShieldCheck className="w-4 h-4 text-teal-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-300 block font-bold">بيانات آمنة</span>
          </div>
        </div>

        {/* Tabs: Login vs Register */}
        <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-slate-700/70 mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 rounded-xl transition duration-200 ${
              !isRegister
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 rounded-xl transition duration-200 ${
              isRegister
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            إنشاء حساب جديد
          </button>
        </div>

        {/* Google Sign-in if Firebase is ready */}
        {isFirebaseActive && (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-800 text-xs font-bold text-white transition flex items-center justify-center gap-2.5 shadow"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>المتابعة عبر حساب Google</span>
            </button>

            <div className="relative text-center my-4">
              <span className="bg-slate-900 px-3 text-[10px] text-slate-500 relative z-10 font-bold">
                أو بالبريد وكلمة المرور
              </span>
              <div className="absolute inset-0 top-1/2 border-t border-slate-800" />
            </div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  الاسم بالكامل <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد محمد"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  الوظيفة / التخصص
                </label>
                <input
                  type="text"
                  placeholder="مثال: معلم فيزياء ومطور برمجيات"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              البريد الإلكتروني <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              كلمة المرور أو رمز الحماية (PIN) <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
            >
              {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span>{isLoading ? 'جارٍ التحقق...' : (isRegister ? 'إنشاء الحساب والدخول' : 'تسجيل الدخول الآن')}</span>
            </button>
          </div>

        </form>

      </div>

      <footer className="mt-8 text-center text-xs text-slate-500">
        تطبيق مدخولي • محمي بآليات التشفير والمزامنة السحابية
      </footer>

    </div>
  );
}
