import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import JobsSummaryCards from './components/JobsSummaryCards';
import IncomeCharts from './components/IncomeCharts';
import IncomeTable from './components/IncomeTable';
import IncomeModal from './components/IncomeModal';
import WithdrawalModal from './components/WithdrawalModal';
import WithdrawalsList from './components/WithdrawalsList';
import WithdrawalsPage from './components/WithdrawalsPage';
import { Wallet, ArrowDownRight, Plus } from 'lucide-react';
import GoalModal from './components/GoalModal';
import ExportModal from './components/ExportModal';
import SmartInsights from './components/SmartInsights';
import StudentsManagerModal from './components/StudentsManagerModal';
import StudentModal from './components/StudentModal';
import JobModal from './components/JobModal';
import AuthModal from './components/AuthModal';
import FirebaseModal from './components/FirebaseModal';
import AuthScreen from './components/AuthScreen';
import Toast from './components/Toast';
import ConfirmModal from './components/ConfirmModal';
import InstallPwaModal from './components/InstallPwaModal';
import {
  auth,
  isFirebaseConfigured,
  syncUserDataToCloud,
  subscribeToCloudData,
  fetchUserDataFromCloud
} from './firebase';
import {
  fetchUserDataFromSupabase,
  syncUserDataToSupabase,
  subscribeToSupabaseUserData
} from './supabase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  INITIAL_DATA,
  DEFAULT_JOBS,
  INITIAL_STUDENTS,
  DEFAULT_CURRENCY,
  CURRENCIES,
  CATEGORIES,
  ARABIC_MONTHS,
  normalizeDateString
} from './constants';

// Helper to merge local & remote records without losing local unsynced data
const mergeRecordsById = (baseArr = [], priorityArr = [], deletedIds = new Set()) => {
  const map = new Map();
  // 1. Base items
  (baseArr || []).forEach((item) => {
    if (item && item.id && !deletedIds.has(item.id)) map.set(item.id, item);
  });
  // 2. Priority items take precedence
  (priorityArr || []).forEach((item) => {
    if (item && item.id && !deletedIds.has(item.id)) map.set(item.id, item);
  });
  return Array.from(map.values());
};

export default function App() {
  // 1. Toast Notification State
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success', title = '') => {
    setToast({ message, type, title });
  };

  // 2. Custom Confirmation Modal State
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'نعم، متأكد',
    isDanger: true,
    onConfirm: () => {}
  });

  const openConfirm = ({ title, message, confirmText = 'نعم، متأكد', isDanger = true, onConfirm }) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      confirmText,
      isDanger,
      onConfirm
    });
  };

  // 3. User Authentication State (Gate check)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('monthly_income_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [cloudUser, setCloudUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deletedIds, setDeletedIds] = useState(() => new Set());

  // Cloud sync catch helper with informative, user-friendly warnings
  const handleCloudSyncCatch = (err) => {
    console.warn('Cloud sync error:', err);
  };

  // Helper to determine active sync user ID across devices
  const getEffectiveUserId = () => {
    const raw = cloudUser?.email || currentUser?.email || 'galalelaaser101@gmail.com';
    return (raw && raw !== 'user@example.com' ? raw : 'galalelaaser101@gmail.com').toLowerCase().trim();
  };

  // Central multi-backend synchronization dispatcher
  const syncToAllBackends = (dataPayload) => {
    const syncId = getEffectiveUserId();
    // 1. Primary: Supabase Realtime (Instant WebSocket sync, no quotas, 100% free)
    syncUserDataToSupabase(syncId, dataPayload, currentUser?.email || cloudUser?.email || '')
      .catch((err) => console.warn('Supabase sync error:', err));

    // 2. Secondary fallback: Firebase (best-effort)
    if (cloudUser) {
      syncUserDataToCloud(cloudUser.uid, dataPayload).catch((err) => {
        console.warn('Firebase background fallback info:', err);
      });
    }
  };

  // 4. Incomes State - 100% Clean, zero dummy records
  const [incomes, setIncomes] = useState(() => {
    try {
      const saved = localStorage.getItem('monthly_income_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        const clean = parsed.filter(i => !['inc-1', 'inc-2', 'inc-3', 'inc-4', 'inc-5', 'inc-6', 'inc-7', 'inc-101', 'inc-102', 'inc-103', 'inc-201', 'inc-202', 'inc-301', 'inc-302'].includes(i.id));
        return clean;
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  // 5. Jobs State - User's 4 core work streams
  const [jobs, setJobs] = useState(() => {
    try {
      const saved = localStorage.getItem('monthly_income_jobs');
      return saved ? JSON.parse(saved) : DEFAULT_JOBS;
    } catch (e) {
      return DEFAULT_JOBS;
    }
  });

  // 6. Students State - 100% Clean, zero dummy students
  const [students, setStudents] = useState(() => {
    try {
      const saved = localStorage.getItem('monthly_income_students');
      if (saved) {
        const parsed = JSON.parse(saved);
        const clean = parsed.filter(s => !['std-1', 'std-2', 'std-3', 'std-4', 'std-5', 'std-6'].includes(s.id));
        return clean;
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  // 7. Withdrawals & Expenses State (سحب المبالغ والمصروفات)
  const [withdrawals, setWithdrawals] = useState(() => {
    try {
      const saved = localStorage.getItem('monthly_income_withdrawals');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // 8. Selected Month (YYYY-MM) - Defaults to the user's current month
  const [selectedMonth, setSelectedMonth] = useState(() => {
    try {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    } catch {
      return '2026-11';
    }
  });

  // 9. Fixed Currency: Egyptian Pound (ج.م)
  const currency = DEFAULT_CURRENCY;

  // 10. Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('monthly_income_dark_mode');
      return saved !== null ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });

  // 11. Monthly Goal
  const [monthlyGoal, setMonthlyGoal] = useState(() => {
    try {
      const saved = localStorage.getItem('monthly_income_goal');
      return saved !== null ? parseFloat(saved) : 35000;
    } catch (e) {
      return 35000;
    }
  });

  // Active Navigation Tab: 'incomes' | 'withdrawals'
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem('monthly_income_active_tab') || 'incomes';
    } catch {
      return 'incomes';
    }
  });

  const handleSwitchTab = (tab) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('monthly_income_active_tab', tab);
    } catch {}
  };

  // Modals visibility
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [initialJobIdForModal, setInitialJobIdForModal] = useState('');

  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [editingWithdrawal, setEditingWithdrawal] = useState(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // PWA Install States & Events
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone PWA mode
    if (
      (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) ||
      (typeof navigator !== 'undefined' && navigator.standalone === true)
    ) {
      setIsAppInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      showToast('تم تثبيت تطبيق مدخولي على هاتفك بنجاح! 📱🎉', 'success');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('جارٍ تثبيت التطبيق على جهازك...', 'info');
      }
      setDeferredPrompt(null);
    } else {
      setIsInstallModalOpen(true);
    }
  };

  // Lock background body scroll whenever any modal/popup is open
  const isAnyModalOpen =
    isIncomeModalOpen ||
    isWithdrawalModalOpen ||
    confirmConfig.isOpen ||
    isGoalModalOpen ||
    isExportModalOpen ||
    isAuthModalOpen ||
    isFirebaseModalOpen ||
    isStudentsModalOpen ||
    isStudentModalOpen ||
    isJobModalOpen ||
    isInstallModalOpen;

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isAnyModalOpen]);

  // Check Firebase Auth state & Real-time Subscription
  useEffect(() => {
    if (!auth) return;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCloudUser(user);
      if (user) {
        setCurrentUser((prev) => {
          const updated = prev || {
            name: user.displayName || user.email?.split('@')[0] || 'مستخدم',
            email: user.email,
            role: 'مستخدم سحابي',
            avatar: (user.displayName || user.email || 'م').charAt(0).toUpperCase(),
            uid: user.uid,
            isCloud: true
          };
          try {
            localStorage.setItem('monthly_income_user', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const [isInitialCloudLoaded, setIsInitialCloudLoaded] = useState(false);

  // 1. 100% Automatic Background Cloud Sync & Realtime Subscription via Supabase
  useEffect(() => {
    let isMounted = true;
    const syncId = getEffectiveUserId();

    const runAutomaticInitialSync = async () => {
      setIsSyncing(true);
      try {
        // Read directly from localStorage to ensure we never miss unsynced local data
        let localIncomes = incomes;
        let localStudents = students;
        let localWithdrawals = withdrawals;
        let localJobs = jobs;
        let localGoal = monthlyGoal;

        try {
          const savedInc = localStorage.getItem('monthly_income_data');
          if (savedInc) {
            const parsed = JSON.parse(savedInc);
            if (Array.isArray(parsed) && parsed.length > localIncomes.length) localIncomes = parsed;
          }
          const savedStd = localStorage.getItem('monthly_income_students');
          if (savedStd) {
            const parsed = JSON.parse(savedStd);
            if (Array.isArray(parsed) && parsed.length > localStudents.length) localStudents = parsed;
          }
          const savedWtd = localStorage.getItem('monthly_income_withdrawals');
          if (savedWtd) {
            const parsed = JSON.parse(savedWtd);
            if (Array.isArray(parsed) && parsed.length > localWithdrawals.length) localWithdrawals = parsed;
          }
        } catch (e) {}

        const remoteData = await fetchUserDataFromSupabase(syncId);
        if (!isMounted) return;

        const hasLocalData = localIncomes.length > 0 || localStudents.length > 0 || localWithdrawals.length > 0;
        const hasRemoteData = remoteData && (
          (Array.isArray(remoteData.incomes) && remoteData.incomes.length > 0) ||
          (Array.isArray(remoteData.students) && remoteData.students.length > 0) ||
          (Array.isArray(remoteData.withdrawals) && remoteData.withdrawals.length > 0)
        );

        if (hasRemoteData) {
          // Cloud already has data! Merge local with remote safely
          const mergedIncomes = mergeRecordsById(remoteData.incomes, localIncomes, deletedIds);
          const mergedStudents = mergeRecordsById(remoteData.students, localStudents, deletedIds);
          const mergedWithdrawals = mergeRecordsById(remoteData.withdrawals, localWithdrawals, deletedIds);
          const mergedJobs = (remoteData.jobs && remoteData.jobs.length > 0) ? remoteData.jobs : localJobs;
          const mergedGoal = remoteData.monthlyGoal || localGoal;

          setIncomes(mergedIncomes);
          setStudents(mergedStudents);
          setWithdrawals(mergedWithdrawals);
          setJobs(mergedJobs);
          setMonthlyGoal(mergedGoal);

          localStorage.setItem('monthly_income_data', JSON.stringify(mergedIncomes));
          localStorage.setItem('monthly_income_students', JSON.stringify(mergedStudents));
          localStorage.setItem('monthly_income_withdrawals', JSON.stringify(mergedWithdrawals));
          localStorage.setItem('monthly_income_jobs', JSON.stringify(mergedJobs));
          localStorage.setItem('monthly_income_goal', String(mergedGoal));

          // If this device had new records not yet in cloud, auto-push merged set to cloud in background
          const hasLocalExtras = (mergedIncomes.length > (remoteData.incomes?.length || 0)) ||
                                 (mergedStudents.length > (remoteData.students?.length || 0)) ||
                                 (mergedWithdrawals.length > (remoteData.withdrawals?.length || 0));
          if (hasLocalExtras) {
            await syncUserDataToSupabase(syncId, {
              incomes: mergedIncomes,
              students: mergedStudents,
              withdrawals: mergedWithdrawals,
              jobs: mergedJobs,
              monthlyGoal: mergedGoal,
              currency: currency.code
            }, currentUser?.email || cloudUser?.email || '');
          }
        } else if (hasLocalData) {
          // Supabase is empty, but this device has local data! Auto-upload to cloud in background
          await syncUserDataToSupabase(syncId, {
            incomes: localIncomes,
            jobs: localJobs,
            students: localStudents,
            withdrawals: localWithdrawals,
            monthlyGoal: localGoal,
            currency: currency.code
          }, currentUser?.email || cloudUser?.email || '');
        }
      } catch (err) {
        console.warn('Auto Supabase sync on mount:', err);
      } finally {
        if (isMounted) {
          setIsSyncing(false);
          setIsInitialCloudLoaded(true);
        }
      }
    };

    runAutomaticInitialSync();

    // 2. Real-time Subscription to listen for changes from Mobile / Other devices via WebSockets
    const unsubscribeSupabase = subscribeToSupabaseUserData(syncId, (remoteData) => {
      if (!isMounted || !remoteData) return;
      
      // Merge remote updates with current local records so pending/offline local records are never erased
      if (Array.isArray(remoteData.incomes)) {
        setIncomes((currentLocal) => {
          const merged = mergeRecordsById(remoteData.incomes, currentLocal, deletedIds);
          try {
            localStorage.setItem('monthly_income_data', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
      if (Array.isArray(remoteData.students)) {
        setStudents((currentLocal) => {
          const merged = mergeRecordsById(remoteData.students, currentLocal, deletedIds);
          try {
            localStorage.setItem('monthly_income_students', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
      if (Array.isArray(remoteData.withdrawals)) {
        setWithdrawals((currentLocal) => {
          const merged = mergeRecordsById(remoteData.withdrawals, currentLocal, deletedIds);
          try {
            localStorage.setItem('monthly_income_withdrawals', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
      if (Array.isArray(remoteData.jobs) && remoteData.jobs.length > 0) {
        setJobs(remoteData.jobs);
        try {
          localStorage.setItem('monthly_income_jobs', JSON.stringify(remoteData.jobs));
        } catch (e) {}
      }
      if (remoteData.monthlyGoal) {
        setMonthlyGoal(remoteData.monthlyGoal);
        try {
          localStorage.setItem('monthly_income_goal', String(remoteData.monthlyGoal));
        } catch (e) {}
      }
    });

    return () => {
      isMounted = false;
      unsubscribeSupabase();
    };
  }, [currentUser, cloudUser]);

  // Explicit Manual Push: Push current device state to Cloud
  const handleManualPushToCloud = async () => {
    setIsSyncing(true);
    const syncId = getEffectiveUserId();
    try {
      await syncUserDataToSupabase(syncId, {
        incomes,
        jobs,
        students,
        withdrawals,
        monthlyGoal,
        currency: currency.code
      }, currentUser?.email || cloudUser?.email || '');

      if (cloudUser) {
        syncUserDataToCloud(cloudUser.uid, {
          incomes,
          jobs,
          students,
          withdrawals,
          monthlyGoal,
          currency: currency.code
        }).catch(() => {});
      }

      showToast(`تم رفع ومزامنة كافة بيانات هذا الجهاز بنجاح (${incomes.length} إيراد، ${students.length} طالب، ${withdrawals.length} سحب) ⚡`, 'success');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء الرفع إلى السحابة: ' + (err.message || 'خطأ غير معروف'), 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Explicit Manual Pull: Fetch latest data from Cloud and update this device
  const handleManualPullFromCloud = async () => {
    setIsSyncing(true);
    const syncId = getEffectiveUserId();
    try {
      const remoteData = await fetchUserDataFromSupabase(syncId);
      if (remoteData) {
        if (Array.isArray(remoteData.incomes)) {
          setIncomes(remoteData.incomes);
          localStorage.setItem('monthly_income_data', JSON.stringify(remoteData.incomes));
        }
        if (Array.isArray(remoteData.students)) {
          setStudents(remoteData.students);
          localStorage.setItem('monthly_income_students', JSON.stringify(remoteData.students));
        }
        if (Array.isArray(remoteData.withdrawals)) {
          setWithdrawals(remoteData.withdrawals);
          localStorage.setItem('monthly_income_withdrawals', JSON.stringify(remoteData.withdrawals));
        }
        if (Array.isArray(remoteData.jobs) && remoteData.jobs.length > 0) {
          setJobs(remoteData.jobs);
          localStorage.setItem('monthly_income_jobs', JSON.stringify(remoteData.jobs));
        }
        if (remoteData.monthlyGoal) {
          setMonthlyGoal(remoteData.monthlyGoal);
          localStorage.setItem('monthly_income_goal', String(remoteData.monthlyGoal));
        }
        showToast(`تم تحديث وجلب البيانات من السحابة بنجاح (${remoteData.incomes?.length || 0} إيراد، ${remoteData.students?.length || 0} طالب)! 🔄`, 'success');
      } else {
        showToast('لم يتم العثور على بيانات مخزنة في السحابة لهذا الحساب.', 'info');
      }
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء جلب البيانات من السحابة: ' + (err.message || 'خطأ غير معروف'), 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Local Storage Persistence (Safe local updates without blindly overwriting cloud on mount)
  useEffect(() => {
    localStorage.setItem('monthly_income_data', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('monthly_income_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('monthly_income_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('monthly_income_withdrawals', JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem('monthly_income_goal', String(monthlyGoal));
  }, [monthlyGoal]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('monthly_income_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('monthly_income_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('monthly_income_currency', currency.code);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('monthly_income_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Calculations for selected month
  const currentMonthIncomes = useMemo(() => {
    const normSelected = normalizeDateString(selectedMonth);
    return incomes.filter((item) => {
      if (!item || !item.date) return false;
      const normDate = normalizeDateString(item.date);
      return normDate.startsWith(normSelected);
    });
  }, [incomes, selectedMonth]);

  const receivedTotal = useMemo(() => {
    return currentMonthIncomes
      .filter((i) => i.status === 'received')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [currentMonthIncomes]);

  const pendingTotal = useMemo(() => {
    return currentMonthIncomes
      .filter((i) => i.status === 'pending')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [currentMonthIncomes]);

  const overallTotal = receivedTotal + pendingTotal;

  // Withdrawals Calculations for selected month
  const currentMonthWithdrawals = useMemo(() => {
    const normSelected = normalizeDateString(selectedMonth);
    return withdrawals.filter((w) => {
      if (!w || !w.date) return false;
      const normDate = normalizeDateString(w.date);
      return normDate.startsWith(normSelected);
    });
  }, [withdrawals, selectedMonth]);

  const totalWithdrawn = useMemo(() => {
    return currentMonthWithdrawals.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
  }, [currentMonthWithdrawals]);

  const netRemaining = receivedTotal - totalWithdrawn;

  const itemCount = {
    received: currentMonthIncomes.filter((i) => i.status === 'received').length,
    pending: currentMonthIncomes.filter((i) => i.status === 'pending').length,
  };

  // Category breakdown for current month
  const categoryBreakdown = useMemo(() => {
    const map = {};
    CATEGORIES.forEach((c) => {
      map[c.id] = 0;
    });

    currentMonthIncomes.forEach((item) => {
      if (map[item.category] !== undefined) {
        map[item.category] += item.amount;
      } else {
        map[item.category] = (map[item.category] || 0) + item.amount;
      }
    });

    return Object.keys(map).map((catId) => ({
      category: catId,
      total: map[catId],
    }));
  }, [currentMonthIncomes]);

  // Monthly Trend Data
  const monthlyTrendData = useMemo(() => {
    const [yStr, mStr] = selectedMonth.split('-');
    const currentYear = parseInt(yStr, 10);
    const currentMonth = parseInt(mStr, 10);

    const months = [];
    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;
      while (m <= 0) {
        m += 12;
        y -= 1;
      }
      const key = `${y}-${String(m).padStart(2, '0')}`;
      const label = `${ARABIC_MONTHS[m - 1]} ${y === currentYear ? '' : y}`;
      
      const monthTotal = incomes
        .filter((item) => item.date && item.date.startsWith(key))
        .reduce((acc, curr) => acc + curr.amount, 0);

      months.push({
        key,
        monthLabel: label,
        total: monthTotal,
      });
    }
    return months;
  }, [incomes, selectedMonth]);

  // Current Month Name in Arabic
  const currentMonthName = useMemo(() => {
    const monthIndex = parseInt(selectedMonth.split('-')[1], 10) - 1;
    return ARABIC_MONTHS[monthIndex] || '';
  }, [selectedMonth]);

  // Income Operations
  const handleSaveIncome = (incomeData) => {
    const safeDate = normalizeDateString(incomeData.date) || new Date().toISOString().split('T')[0];
    const safeItem = {
      ...incomeData,
      date: safeDate
    };

    // If the record belongs to another month, switch to it so the user sees it immediately
    if (safeDate.length >= 7) {
      const itemMonth = safeDate.slice(0, 7);
      if (itemMonth !== selectedMonth) {
        setSelectedMonth(itemMonth);
      }
    }

    let updatedList;
    setIncomes((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === safeItem.id);
      let updated;
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = safeItem;
      } else {
        updated = [safeItem, ...prev];
      }
      updatedList = updated;
      try {
        localStorage.setItem('monthly_income_data', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (updatedList) {
      syncToAllBackends({ incomes: updatedList });
    }

    showToast(editingIncome ? 'تم حفظ التعديلات بنجاح' : 'تم تسجيل الدخل الجديد بنجاح!', 'success');
  };

  const handleDeleteIncome = (id) => {
    const target = incomes.find((i) => i.id === id);
    openConfirm({
      title: 'حذف بند الدخل',
      message: `هل أنت متأكد من حذف البند "${target?.title || ''}"؟`,
      confirmText: 'نعم، حذف',
      isDanger: true,
      onConfirm: () => {
        setDeletedIds((prev) => new Set([...prev, id]));
        const updated = incomes.filter((i) => i.id !== id);
        setIncomes(updated);
        try {
          localStorage.setItem('monthly_income_data', JSON.stringify(updated));
        } catch (e) {}
        syncToAllBackends({ incomes: updated });
        showToast('تم حذف البند بنجاح', 'info');
      }
    });
  };

  const handleToggleStatus = (id) => {
    let nextToastText = '';
    const updated = incomes.map((item) => {
      if (item.id === id) {
        const nextStatus = item.status === 'received' ? 'pending' : 'received';
        nextToastText = nextStatus === 'received'
          ? `تم تحويل "${item.title}" إلى مُستلم ✅`
          : `تم تحويل "${item.title}" إلى قيد الانتظار ⏳`;
        return { ...item, status: nextStatus };
      }
      return item;
    });

    setIncomes(updated);
    try {
      localStorage.setItem('monthly_income_data', JSON.stringify(updated));
    } catch (e) {}

    syncToAllBackends({ incomes: updated });

    if (nextToastText) showToast(nextToastText, 'info');
  };

  // Student Operations
  const handleSaveStudent = (studentData) => {
    let updatedList;
    setStudents((prev) => {
      const index = prev.findIndex((s) => s.id === studentData.id);
      let updated;
      if (index >= 0) {
        updated = [...prev];
        updated[index] = studentData;
      } else {
        updated = [...prev, studentData];
      }
      updatedList = updated;
      try {
        localStorage.setItem('monthly_income_students', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (updatedList) {
      syncToAllBackends({ students: updatedList });
    }
  };

  const handleDeleteStudent = (id) => {
    setDeletedIds((prev) => new Set([...prev, id]));
    const updated = students.filter((s) => s.id !== id);
    setStudents(updated);
    try {
      localStorage.setItem('monthly_income_students', JSON.stringify(updated));
    } catch (e) {}
    syncToAllBackends({ students: updated });
    showToast('تم حذف الطالب بنجاح', 'info');
  };

  // Fast One-Click Student Payment Recording
  const handleRecordStudentPayment = (student) => {
    const newIncome = {
      id: `inc-${Date.now()}`,
      jobId: 'job-online',
      studentId: student.id,
      studentName: student.name,
      title: `اشتراك شهر ${currentMonthName} - الطالب ${student.name}`,
      amount: student.monthlyFee,
      category: 'students',
      date: `${selectedMonth}-01`,
      status: 'received',
      isRecurring: false,
      client: student.name,
      notes: `تم السداد لمرحلة ${student.grade}`
    };

    let updatedList;
    setIncomes((prev) => {
      const updated = [newIncome, ...prev];
      updatedList = updated;
      try {
        localStorage.setItem('monthly_income_data', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (updatedList) {
      syncToAllBackends({ incomes: updatedList });
    }
  };

  // Job Operations
  const handleSaveJob = (jobData) => {
    let updatedList;
    setJobs((prev) => {
      const index = prev.findIndex((j) => j.id === jobData.id);
      let updated;
      if (index >= 0) {
        updated = [...prev];
        updated[index] = jobData;
      } else {
        updated = [...prev, jobData];
      }
      updatedList = updated;
      try {
        localStorage.setItem('monthly_income_jobs', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (updatedList) {
      syncToAllBackends({ jobs: updatedList });
    }
  };

  // Withdrawal Operations (سحب المبالغ والمصروفات)
  const handleSaveWithdrawal = (withdrawalData) => {
    const safeDate = normalizeDateString(withdrawalData.date) || new Date().toISOString().split('T')[0];
    const safeItem = {
      ...withdrawalData,
      date: safeDate
    };

    // If the withdrawal belongs to another month, switch to it so the user sees it immediately
    if (safeDate.length >= 7) {
      const itemMonth = safeDate.slice(0, 7);
      if (itemMonth !== selectedMonth) {
        setSelectedMonth(itemMonth);
      }
    }

    let updatedList;
    setWithdrawals((prev) => {
      const existingIndex = prev.findIndex((w) => w.id === safeItem.id);
      let updated;
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = safeItem;
      } else {
        updated = [safeItem, ...prev];
      }
      updatedList = updated;
      try {
        localStorage.setItem('monthly_income_withdrawals', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (updatedList) {
      syncToAllBackends({ withdrawals: updatedList });
    }

    setIsWithdrawalModalOpen(false);
    showToast(
      editingWithdrawal ? 'تم حفظ تعديلات عملية السحب بنجاح' : 'تم تسجيل عملية السحب بنجاح!',
      'success'
    );
  };

  const handleDeleteWithdrawal = (id) => {
    setDeletedIds((prev) => new Set([...prev, id]));
    const updated = withdrawals.filter((w) => w.id !== id);
    setWithdrawals(updated);
    try {
      localStorage.setItem('monthly_income_withdrawals', JSON.stringify(updated));
    } catch (e) {}
    syncToAllBackends({ withdrawals: updated });
    showToast('تم حذف عملية السحب بنجاح', 'info');
  };

  const handleOpenAddIncomeWithJob = (jobId) => {
    setEditingIncome(null);
    setInitialJobIdForModal(jobId);
    setIsIncomeModalOpen(true);
  };

  // Logout Handler
  const handleLogout = () => {
    setIsAuthModalOpen(false);
    setIsFirebaseModalOpen(false);

    openConfirm({
      title: 'تسجيل الخروج',
      message: 'هل تريد تسجيل الخروج؟ ستتم إعادتك لشاشة تسجيل الدخول.',
      confirmText: 'تسجيل خروج',
      isDanger: false,
      onConfirm: async () => {
        setIsAuthModalOpen(false);
        setIsFirebaseModalOpen(false);
        setIsIncomeModalOpen(false);
        setIsWithdrawalModalOpen(false);
        setIsGoalModalOpen(false);
        setIsExportModalOpen(false);
        setIsStudentsModalOpen(false);
        setIsStudentModalOpen(false);
        setIsJobModalOpen(false);
        setIsInstallModalOpen(false);

        if (auth) {
          try {
            await signOut(auth);
          } catch (e) {}
        }
        setCloudUser(null);
        setCurrentUser(null);
        try {
          localStorage.removeItem('monthly_income_user');
        } catch (e) {}
        showToast('تم تسجيل الخروج بنجاح', 'info');
      }
    });
  };

  // GATE CHECK: If user is not logged in, show AuthScreen only!
  const isAuthenticated = !!currentUser || !!cloudUser;

  if (!isAuthenticated) {
    return (
      <>
        <Toast toast={toast} onClose={() => setToast(null)} />
        <AuthScreen
          onLoginSuccess={(user) => {
            setIsAuthModalOpen(false);
            setIsFirebaseModalOpen(false);
            setCurrentUser(user);
          }}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          showToast={showToast}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Confirmation Modal Container */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        isDanger={confirmConfig.isDanger}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Navigation Header */}
      <Navbar
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentUser={currentUser}
        cloudUser={cloudUser}
        isSyncing={isSyncing}
        activeTab={activeTab}
        onSwitchTab={handleSwitchTab}
        withdrawalsCount={currentMonthWithdrawals.length}
        incomesCount={currentMonthIncomes.length}
        onOpenCloudSync={() => {
          if (cloudUser) {
            setIsAuthModalOpen(true);
          } else {
            setIsFirebaseModalOpen(true);
          }
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAddModal={() => {
          setEditingIncome(null);
          setInitialJobIdForModal('');
          setIsIncomeModalOpen(true);
        }}
        onOpenAddWithdrawal={() => {
          setEditingWithdrawal(null);
          setIsWithdrawalModalOpen(true);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-[1550px] w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-8 animate-fade-in">
        
        {/* Top Page Navigation Tabs */}
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex w-full sm:w-auto p-1.5 bg-slate-200/70 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => handleSwitchTab('incomes')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 ${
                activeTab === 'incomes'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md shadow-slate-900/5 ring-1 ring-slate-900/5'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wallet className="w-4 h-4 shrink-0" />
              <span>الإيرادات والدخل</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'incomes'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : 'bg-slate-300/60 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}>
                {currentMonthIncomes.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab('withdrawals')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 ${
                activeTab === 'withdrawals'
                  ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-md shadow-slate-900/5 ring-1 ring-slate-900/5'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 shrink-0" />
              <span>المسحوبات والمصروفات</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'withdrawals'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                  : 'bg-slate-300/60 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}>
                {currentMonthWithdrawals.length}
              </span>
            </button>
          </div>

          {/* Context CTA Button */}
          {activeTab === 'incomes' ? (
            <button
              type="button"
              onClick={() => {
                setEditingIncome(null);
                setInitialJobIdForModal('');
                setIsIncomeModalOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل دخل جديد</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditingWithdrawal(null);
                setIsWithdrawalModalOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-rose-500/20 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل سحب جديد</span>
            </button>
          )}
        </div>

        {activeTab === 'incomes' ? (
          <>
            {/* KPI Stats Cards */}
            <StatsCards
              receivedTotal={receivedTotal}
              pendingTotal={pendingTotal}
              overallTotal={overallTotal}
              totalWithdrawn={totalWithdrawn}
              netRemaining={netRemaining}
              withdrawalsCount={currentMonthWithdrawals.length}
              onOpenWithdrawalModal={() => {
                setEditingWithdrawal(null);
                setIsWithdrawalModalOpen(true);
              }}
              onSwitchToWithdrawals={() => handleSwitchTab('withdrawals')}
              monthlyGoal={monthlyGoal}
              onOpenGoalModal={() => setIsGoalModalOpen(true)}
              currency={currency}
              categoryBreakdown={categoryBreakdown}
              itemCount={itemCount}
            />

            {/* Specialized Job Breakdown Cards (Company, Center, Online Students, Private Work) */}
            <JobsSummaryCards
              jobs={jobs}
              currentMonthIncomes={currentMonthIncomes}
              students={students}
              currency={currency}
              onOpenAddJob={() => {
                setEditingJob(null);
                setIsJobModalOpen(true);
              }}
              onEditJob={(job) => {
                setEditingJob(job);
                setIsJobModalOpen(true);
              }}
              onOpenStudentsModal={() => setIsStudentsModalOpen(true)}
              onOpenAddIncomeWithJob={handleOpenAddIncomeWithJob}
            />

            {/* Smart Financial Insights */}
            <SmartInsights
              receivedTotal={receivedTotal}
              overallTotal={overallTotal}
              incomes={currentMonthIncomes}
              currency={currency}
              categoryBreakdown={categoryBreakdown}
            />

            {/* Charts Section */}
            <IncomeCharts
              currentMonthIncomes={currentMonthIncomes}
              monthlyTrendData={monthlyTrendData}
              currency={currency}
              categoryBreakdown={categoryBreakdown}
            />

            {/* Detailed Incomes Table */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  سجل مدفوعات وإيرادات شهر {currentMonthName}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  فلترة وتصفية حسب كل جهة عمل (شركة، سنتر، طلبة، شغل خاص)
                </p>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                اضغط على علامة الحالة للتغيير الفوري بين (مستلم / معلق)
              </span>
            </div>

            <IncomeTable
              incomes={currentMonthIncomes}
              jobs={jobs}
              currency={currency}
              onEditIncome={(income) => {
                setEditingIncome(income);
                setIsIncomeModalOpen(true);
              }}
              onDeleteIncome={handleDeleteIncome}
              onToggleStatus={handleToggleStatus}
              onOpenAddModal={() => {
                setEditingIncome(null);
                setIsIncomeModalOpen(true);
              }}
            />
          </>
        ) : (
          /* Dedicated Withdrawals Page */
          <WithdrawalsPage
            withdrawals={currentMonthWithdrawals}
            receivedTotal={receivedTotal}
            netRemaining={netRemaining}
            currentMonthName={currentMonthName}
            selectedMonth={selectedMonth}
            currency={currency}
            onOpenAddWithdrawal={() => {
              setEditingWithdrawal(null);
              setIsWithdrawalModalOpen(true);
            }}
            onEditWithdrawal={(item) => {
              setEditingWithdrawal(item);
              setIsWithdrawalModalOpen(true);
            }}
            onDeleteWithdrawal={handleDeleteWithdrawal}
            onSwitchToIncomes={() => handleSwitchTab('incomes')}
            openConfirm={openConfirm}
            showToast={showToast}
          />
        )}

      </main>

      {/* Modals & Dialogs */}
      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        onSave={handleSaveIncome}
        editingIncome={editingIncome}
        defaultDate={
          new Date().toISOString().split('T')[0].startsWith(selectedMonth)
            ? new Date().toISOString().split('T')[0]
            : `${selectedMonth}-01`
        }
        currency={currency}
        jobs={jobs}
        students={students}
        initialJobId={initialJobIdForModal}
        onOpenAddStudent={() => {
          setEditingStudent(null);
          setIsStudentModalOpen(true);
        }}
      />

      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        onSaveWithdrawal={handleSaveWithdrawal}
        editingWithdrawal={editingWithdrawal}
        defaultDate={`${selectedMonth}-01`}
        currency={currency}
        showToast={showToast}
      />

      <StudentsManagerModal
        isOpen={isStudentsModalOpen}
        onClose={() => setIsStudentsModalOpen(false)}
        students={students}
        currentMonthIncomes={currentMonthIncomes}
        selectedMonth={selectedMonth}
        currency={currency}
        onOpenAddStudent={() => {
          setEditingStudent(null);
          setIsStudentModalOpen(true);
        }}
        onEditStudent={(std) => {
          setEditingStudent(std);
          setIsStudentModalOpen(true);
        }}
        onDeleteStudent={handleDeleteStudent}
        onRecordStudentPayment={handleRecordStudentPayment}
        openConfirm={openConfirm}
        showToast={showToast}
      />

      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSaveStudent={handleSaveStudent}
        editingStudent={editingStudent}
        currency={currency}
        showToast={showToast}
      />

      <JobModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onSaveJob={handleSaveJob}
        editingJob={editingJob}
        currency={currency}
        showToast={showToast}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        cloudUser={cloudUser}
        isSyncing={isSyncing}
        onManualPushToCloud={handleManualPushToCloud}
        onManualPullFromCloud={handleManualPullFromCloud}
        onOpenCloudLogin={() => {
          setIsAuthModalOpen(false);
          setIsFirebaseModalOpen(true);
        }}
        incomesCount={incomes.length}
        studentsCount={students.length}
        withdrawalsCount={withdrawals.length}
        onSaveUser={setCurrentUser}
        onLogout={handleLogout}
      />

      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        cloudUser={cloudUser}
        setCloudUser={setCloudUser}
        onSyncToCloud={handleManualPushToCloud}
        isSyncing={isSyncing}
        showToast={showToast}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        currentGoal={monthlyGoal}
        onSaveGoal={(goal) => {
          setMonthlyGoal(goal);
          try {
            localStorage.setItem('monthly_income_goal', String(goal));
          } catch (e) {}
          syncToAllBackends({ monthlyGoal: goal });
          showToast('تم حفظ وتحديث الهدف الشهري!', 'success');
        }}
        currency={currency}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        incomes={incomes}
        students={students}
        withdrawals={withdrawals}
        jobs={jobs}
        monthlyGoal={monthlyGoal}
        onImportData={(data) => {
          if (Array.isArray(data)) {
            setIncomes(data);
            localStorage.setItem('monthly_income_data', JSON.stringify(data));
            syncToAllBackends({ incomes: data });
          } else if (data && typeof data === 'object') {
            if (Array.isArray(data.incomes)) {
              setIncomes(data.incomes);
              localStorage.setItem('monthly_income_data', JSON.stringify(data.incomes));
            }
            if (Array.isArray(data.students)) {
              setStudents(data.students);
              localStorage.setItem('monthly_income_students', JSON.stringify(data.students));
            }
            if (Array.isArray(data.withdrawals)) {
              setWithdrawals(data.withdrawals);
              localStorage.setItem('monthly_income_withdrawals', JSON.stringify(data.withdrawals));
            }
            if (Array.isArray(data.jobs) && data.jobs.length > 0) {
              setJobs(data.jobs);
              localStorage.setItem('monthly_income_jobs', JSON.stringify(data.jobs));
            }
            if (data.monthlyGoal) {
              setMonthlyGoal(data.monthlyGoal);
            }
            syncToAllBackends({
              incomes: data.incomes || [],
              students: data.students || [],
              withdrawals: data.withdrawals || [],
              jobs: data.jobs || jobs,
              monthlyGoal: data.monthlyGoal || monthlyGoal
            });
          }
        }}
        onResetToSample={() => {
          setIncomes([]);
          setStudents([]);
          setWithdrawals([]);
          localStorage.removeItem('monthly_income_data');
          localStorage.removeItem('monthly_income_students');
          localStorage.removeItem('monthly_income_withdrawals');
          showToast('تم مسح وتصفير كافة البيانات بنجاح', 'info');
        }}
        currency={currency}
        showToast={showToast}
        openConfirm={openConfirm}
      />

      <InstallPwaModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        canInstallPrompt={!!deferredPrompt}
        onTriggerInstall={handleTriggerInstall}
        isInstalled={isAppInstalled}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 py-6 text-center text-xs text-slate-500">
        <p>تطبيق إدارة وتتبع الدخل ومصادر العمل والطلاب • تطبيق ويب تقدمي (PWA) & Supabase Realtime</p>
      </footer>

    </div>
  );
}
