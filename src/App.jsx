import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import JobsSummaryCards from './components/JobsSummaryCards';
import IncomeCharts from './components/IncomeCharts';
import IncomeTable from './components/IncomeTable';
import IncomeModal from './components/IncomeModal';
import WithdrawalModal from './components/WithdrawalModal';
import WithdrawalsList from './components/WithdrawalsList';
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
import {
  auth,
  isFirebaseConfigured,
  syncUserDataToCloud,
  subscribeToCloudData,
  fetchUserDataFromCloud
} from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  INITIAL_DATA,
  DEFAULT_JOBS,
  INITIAL_STUDENTS,
  DEFAULT_CURRENCY,
  CURRENCIES,
  CATEGORIES,
  ARABIC_MONTHS
} from './constants';

// Helper to merge local & remote records without losing local unsynced data
const mergeRecordsById = (localArr = [], remoteArr = []) => {
  const map = new Map();
  // 1. Remote items first
  (remoteArr || []).forEach((item) => {
    if (item && item.id) map.set(item.id, item);
  });
  // 2. Local items take priority so newly added items are never erased
  (localArr || []).forEach((item) => {
    if (item && item.id) map.set(item.id, item);
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
    isJobModalOpen;

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
    });
    return () => unsubscribeAuth();
  }, []);

  const [isInitialCloudLoaded, setIsInitialCloudLoaded] = useState(false);

  // 1. Initial Cloud Sync & Realtime Subscription
  useEffect(() => {
    if (!cloudUser) {
      setIsInitialCloudLoaded(false);
      return;
    }

    let isMounted = true;

    const runInitialSync = async () => {
      setIsSyncing(true);
      try {
        const cloudData = await fetchUserDataFromCloud(cloudUser.uid);
        if (!isMounted) return;

        const hasLocalData = incomes.length > 0 || students.length > 0 || withdrawals.length > 0;
        const hasRemoteData = cloudData && (
          (Array.isArray(cloudData.incomes) && cloudData.incomes.length > 0) ||
          (Array.isArray(cloudData.students) && cloudData.students.length > 0) ||
          (Array.isArray(cloudData.withdrawals) && cloudData.withdrawals.length > 0)
        );

        if (hasRemoteData) {
          // Cloud has data! Merge or load cloud data safely
          const mergedIncomes = mergeRecordsById(incomes, cloudData.incomes);
          const mergedStudents = mergeRecordsById(students, cloudData.students);
          const mergedWithdrawals = mergeRecordsById(withdrawals, cloudData.withdrawals);
          const mergedJobs = (cloudData.jobs && cloudData.jobs.length > 0) ? cloudData.jobs : jobs;
          const mergedGoal = cloudData.monthlyGoal || monthlyGoal;

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

          // If this device had new records not yet in cloud, push the merged dataset to cloud
          const hasLocalExtras = (incomes.length > (cloudData.incomes?.length || 0)) ||
                                 (students.length > (cloudData.students?.length || 0)) ||
                                 (withdrawals.length > (cloudData.withdrawals?.length || 0));
          if (hasLocalExtras) {
            await syncUserDataToCloud(cloudUser.uid, {
              incomes: mergedIncomes,
              students: mergedStudents,
              withdrawals: mergedWithdrawals,
              jobs: mergedJobs,
              monthlyGoal: mergedGoal,
              currency: currency.code
            });
          }

          showToast(`تم استرجاع ومزامنة البيانات من السحابة بنجاح (${mergedIncomes.length} إيراد، ${mergedStudents.length} طالب) ☁️`, 'success');
        } else if (hasLocalData) {
          // Cloud is empty, but this device has local data! Push to cloud so other devices get it
          await syncUserDataToCloud(cloudUser.uid, {
            incomes,
            jobs,
            students,
            withdrawals,
            monthlyGoal,
            currency: currency.code
          });
          showToast(`تم رفع بيانات هذا الجهاز بنجاح إلى السحابة (${incomes.length} إيراد) ☁️`, 'success');
        }
      } catch (err) {
        console.warn('Initial cloud sync error:', err);
      } finally {
        if (isMounted) {
          setIsSyncing(false);
          setIsInitialCloudLoaded(true);
        }
      }
    };

    runInitialSync();

    // 2. Real-time Subscription to listen for changes from other tabs/devices
    const unsubscribeDoc = subscribeToCloudData(cloudUser.uid, (cloudData) => {
      if (!cloudData) return;
      if (Array.isArray(cloudData.incomes) && cloudData.incomes.length > 0) {
        setIncomes((prev) => {
          const merged = mergeRecordsById(prev, cloudData.incomes);
          localStorage.setItem('monthly_income_data', JSON.stringify(merged));
          return merged;
        });
      }
      if (Array.isArray(cloudData.students) && cloudData.students.length > 0) {
        setStudents((prev) => {
          const merged = mergeRecordsById(prev, cloudData.students);
          localStorage.setItem('monthly_income_students', JSON.stringify(merged));
          return merged;
        });
      }
      if (Array.isArray(cloudData.withdrawals) && cloudData.withdrawals.length > 0) {
        setWithdrawals((prev) => {
          const merged = mergeRecordsById(prev, cloudData.withdrawals);
          localStorage.setItem('monthly_income_withdrawals', JSON.stringify(merged));
          return merged;
        });
      }
      if (Array.isArray(cloudData.jobs) && cloudData.jobs.length > 0) {
        setJobs(cloudData.jobs);
        localStorage.setItem('monthly_income_jobs', JSON.stringify(cloudData.jobs));
      }
      if (cloudData.monthlyGoal) {
        setMonthlyGoal(cloudData.monthlyGoal);
        localStorage.setItem('monthly_income_goal', String(cloudData.monthlyGoal));
      }
    });

    return () => {
      isMounted = false;
      unsubscribeDoc();
    };
  }, [cloudUser]);

  // Explicit Manual Push: Push current device state to Cloud
  const handleManualPushToCloud = async () => {
    if (!cloudUser) {
      setIsFirebaseModalOpen(true);
      return;
    }
    setIsSyncing(true);
    try {
      await syncUserDataToCloud(cloudUser.uid, {
        incomes,
        jobs,
        students,
        withdrawals,
        monthlyGoal,
        currency: currency.code
      });
      showToast(`تم رفع ومزامنة كافة بيانات هذا الجهاز بنجاح (${incomes.length} إيراد، ${students.length} طالب، ${withdrawals.length} سحب) ☁️`, 'success');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء الرفع إلى السحابة: ' + (err.message || 'خطأ غير معروف'), 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Explicit Manual Pull: Fetch latest data from Cloud and update this device
  const handleManualPullFromCloud = async () => {
    if (!cloudUser) {
      setIsFirebaseModalOpen(true);
      return;
    }
    setIsSyncing(true);
    try {
      const cloudData = await fetchUserDataFromCloud(cloudUser.uid);
      if (cloudData) {
        if (Array.isArray(cloudData.incomes)) {
          setIncomes(cloudData.incomes);
          localStorage.setItem('monthly_income_data', JSON.stringify(cloudData.incomes));
        }
        if (Array.isArray(cloudData.students)) {
          setStudents(cloudData.students);
          localStorage.setItem('monthly_income_students', JSON.stringify(cloudData.students));
        }
        if (Array.isArray(cloudData.withdrawals)) {
          setWithdrawals(cloudData.withdrawals);
          localStorage.setItem('monthly_income_withdrawals', JSON.stringify(cloudData.withdrawals));
        }
        if (Array.isArray(cloudData.jobs) && cloudData.jobs.length > 0) {
          setJobs(cloudData.jobs);
          localStorage.setItem('monthly_income_jobs', JSON.stringify(cloudData.jobs));
        }
        if (cloudData.monthlyGoal) {
          setMonthlyGoal(cloudData.monthlyGoal);
          localStorage.setItem('monthly_income_goal', String(cloudData.monthlyGoal));
        }
        showToast(`تم تحديث وجلب البيانات من السحابة بنجاح (${cloudData.incomes?.length || 0} إيراد، ${cloudData.students?.length || 0} طالب)! 🔄`, 'success');
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
    return incomes.filter((item) => item.date && item.date.startsWith(selectedMonth));
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
    return withdrawals.filter((w) => w.date && w.date.startsWith(selectedMonth));
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
    // If the record belongs to another month, switch to it so the user sees it immediately
    if (incomeData.date && incomeData.date.length >= 7) {
      const itemMonth = incomeData.date.slice(0, 7);
      if (itemMonth !== selectedMonth) {
        setSelectedMonth(itemMonth);
      }
    }

    setIncomes((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === incomeData.id);
      let updated;
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = incomeData;
      } else {
        updated = [incomeData, ...prev];
      }
      try {
        localStorage.setItem('monthly_income_data', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (cloudUser) {
      syncUserDataToCloud(cloudUser.uid, {
        incomes: [incomeData, ...incomes.filter((i) => i.id !== incomeData.id)]
      }).catch(() => {});
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
        const updated = incomes.filter((i) => i.id !== id);
        setIncomes(updated);
        try {
          localStorage.setItem('monthly_income_data', JSON.stringify(updated));
        } catch (e) {}
        if (cloudUser) {
          syncUserDataToCloud(cloudUser.uid, { incomes: updated }).catch(() => {});
        }
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

    if (cloudUser) {
      syncUserDataToCloud(cloudUser.uid, { incomes: updated }).catch(() => {});
    }

    if (nextToastText) showToast(nextToastText, 'info');
  };

  // Student Operations
  const handleSaveStudent = (studentData) => {
    setStudents((prev) => {
      const index = prev.findIndex((s) => s.id === studentData.id);
      let updated;
      if (index >= 0) {
        updated = [...prev];
        updated[index] = studentData;
      } else {
        updated = [...prev, studentData];
      }
      try {
        localStorage.setItem('monthly_income_students', JSON.stringify(updated));
      } catch (e) {}
      if (cloudUser) {
        syncUserDataToCloud(cloudUser.uid, { students: updated }).catch(() => {});
      }
      return updated;
    });
  };

  const handleDeleteStudent = (id) => {
    const updated = students.filter((s) => s.id !== id);
    setStudents(updated);
    try {
      localStorage.setItem('monthly_income_students', JSON.stringify(updated));
    } catch (e) {}
    if (cloudUser) {
      syncUserDataToCloud(cloudUser.uid, { students: updated }).catch(() => {});
    }
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

    setIncomes((prev) => {
      const updated = [newIncome, ...prev];
      try {
        localStorage.setItem('monthly_income_data', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (cloudUser) {
      syncUserDataToCloud(cloudUser.uid, {
        incomes: [newIncome, ...incomes]
      }).catch(() => {});
    }
  };

  // Job Operations
  const handleSaveJob = (jobData) => {
    setJobs((prev) => {
      const index = prev.findIndex((j) => j.id === jobData.id);
      let updated;
      if (index >= 0) {
        updated = [...prev];
        updated[index] = jobData;
      } else {
        updated = [...prev, jobData];
      }
      try {
        localStorage.setItem('monthly_income_jobs', JSON.stringify(updated));
      } catch (e) {}
      if (cloudUser) {
        syncUserDataToCloud(cloudUser.uid, { jobs: updated }).catch(() => {});
      }
      return updated;
    });
  };

  // Withdrawal Operations (سحب المبالغ والمصروفات)
  const handleSaveWithdrawal = (withdrawalData) => {
    // If the withdrawal belongs to another month, switch to it so the user sees it immediately
    if (withdrawalData.date && withdrawalData.date.length >= 7) {
      const itemMonth = withdrawalData.date.slice(0, 7);
      if (itemMonth !== selectedMonth) {
        setSelectedMonth(itemMonth);
      }
    }

    setWithdrawals((prev) => {
      const existingIndex = prev.findIndex((w) => w.id === withdrawalData.id);
      let updated;
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = withdrawalData;
      } else {
        updated = [withdrawalData, ...prev];
      }
      try {
        localStorage.setItem('monthly_income_withdrawals', JSON.stringify(updated));
      } catch (e) {}
      if (cloudUser) {
        syncUserDataToCloud(cloudUser.uid, { withdrawals: updated }).catch(() => {});
      }
      return updated;
    });
    setIsWithdrawalModalOpen(false);
    showToast(
      editingWithdrawal ? 'تم حفظ تعديلات عملية السحب بنجاح' : 'تم تسجيل عملية السحب بنجاح!',
      'success'
    );
  };

  const handleDeleteWithdrawal = (id) => {
    const updated = withdrawals.filter((w) => w.id !== id);
    setWithdrawals(updated);
    try {
      localStorage.setItem('monthly_income_withdrawals', JSON.stringify(updated));
    } catch (e) {}
    if (cloudUser) {
      syncUserDataToCloud(cloudUser.uid, { withdrawals: updated }).catch(() => {});
    }
    showToast('تم حذف عملية السحب بنجاح', 'info');
  };

  const handleOpenAddIncomeWithJob = (jobId) => {
    setEditingIncome(null);
    setInitialJobIdForModal(jobId);
    setIsIncomeModalOpen(true);
  };

  // Logout Handler
  const handleLogout = () => {
    openConfirm({
      title: 'تسجيل الخروج',
      message: 'هل تريد تسجيل الخروج؟ ستتم إعادتك لشاشة تسجيل الدخول.',
      confirmText: 'تسجيل خروج',
      isDanger: false,
      onConfirm: async () => {
        if (auth) {
          try {
            await signOut(auth);
          } catch (e) {}
        }
        setCloudUser(null);
        setCurrentUser(null);
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
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-[1550px] w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-8 animate-fade-in">
        
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

        {/* Withdrawals & Expenses Section for the month */}
        <WithdrawalsList
          withdrawals={currentMonthWithdrawals}
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
          openConfirm={openConfirm}
          showToast={showToast}
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
          if (cloudUser) {
            syncUserDataToCloud(cloudUser.uid, { monthlyGoal: goal }).catch(() => {});
          }
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
            if (cloudUser) syncUserDataToCloud(cloudUser.uid, { incomes: data }).catch(() => {});
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
            if (cloudUser) {
              syncUserDataToCloud(cloudUser.uid, {
                incomes: data.incomes || [],
                students: data.students || [],
                withdrawals: data.withdrawals || [],
                jobs: data.jobs || jobs,
                monthlyGoal: data.monthlyGoal || monthlyGoal
              }).catch(() => {});
            }
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

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 py-6 text-center text-xs text-slate-500">
        <p>تطبيق إدارة وتتبع الدخل ومصادر العمل والطلاب • React.js & Google Firebase</p>
      </footer>

    </div>
  );
}
