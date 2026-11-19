import React, { useState, useRef, useEffect } from 'react';
import {
  Wallet,
  Plus,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  Menu,
  X,
  User,
  Layers,
  Cloud,
  RefreshCw,
  ArrowDownRight
} from 'lucide-react';
import { ARABIC_MONTHS } from '../constants';

export default function Navbar({
  selectedMonth,
  setSelectedMonth,
  darkMode,
  setDarkMode,
  currentUser,
  cloudUser,
  isSyncing = false,
  activeTab = 'incomes',
  onSwitchTab,
  withdrawalsCount = 0,
  incomesCount = 0,
  onOpenCloudSync,
  onOpenAuthModal,
  onOpenAddModal,
  onOpenAddWithdrawal,
  onOpenExportModal
}) {
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1; // 0-based

  // Calendar Picker Popover state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  // Mobile Hamburger Menu Popover state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);

  // Sync picker year when selectedMonth changes
  useEffect(() => {
    setPickerYear(year);
  }, [year]);

  // Handle outside click & Esc key for both popovers
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Calendar Popover click outside
      if (
        isPickerOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsPickerOpen(false);
      }

      // Mobile Menu Popover click outside
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(e.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsPickerOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPickerOpen, isMobileMenuOpen]);

  const handleSelectMonth = (chosenYear, chosenMonthIndex) => {
    const formatted = `${chosenYear}-${String(chosenMonthIndex + 1).padStart(2, '0')}`;
    setSelectedMonth(formatted);
    setIsPickerOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleJumpToCurrentMonth = () => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${curYear}-${curMonth}`);
    setPickerYear(curYear);
    setIsPickerOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-[1550px] w-full mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Logo (Side - Start in RTL) */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                مدخولي
              </h1>
            </div>
          </div>

          {/* Desktop & Tablet Actions (Hidden on Mobile < sm) */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Primary Action Button: Context-aware (Income or Withdrawal) */}
            {activeTab === 'withdrawals' ? (
              <button
                onClick={onOpenAddWithdrawal}
                className="flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md shadow-rose-500/20 hover:shadow-lg transition-all duration-200 transform active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>تسجيل سحب</span>
              </button>
            ) : (
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all duration-200 transform active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>تسجيل دخل</span>
              </button>
            )}

            {/* Cloud Auto-Sync Indicator & Button */}
            <button
              onClick={onOpenCloudSync}
              className="flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 active:scale-95 shadow-sm bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/80 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
              title="المزامنة الفورية مفعلة (Supabase Realtime) - تتزامن لحظياً بين الموبايل والكمبيوتر"
            >
              <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce text-emerald-500' : 'text-emerald-600 dark:text-emerald-400'}`} />
              <span className="hidden md:inline">
                {isSyncing ? 'مزامنة فورية...' : 'متزامن لحظياً ⚡'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 animate-pulse" />
            </button>

            {/* Calendar Icon Button & Popover */}
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setIsPickerOpen(!isPickerOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl border transition-all duration-200 active:scale-95 shadow-sm ${
                  isPickerOpen
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title={`الشهر الحالي: ${ARABIC_MONTHS[monthIndex]} ${year} (انقر للاختيار)`}
              >
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-bold whitespace-nowrap">
                  {ARABIC_MONTHS[monthIndex]} {year}
                </span>
              </button>

              {/* Month Picker Dropdown Popover */}
              {isPickerOpen && (
                <div
                  ref={popoverRef}
                  className="absolute left-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200"
                >
                  {/* Year Navigator */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPickerYear(pickerYear - 1)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition active:scale-90"
                      title="السنة السابقة"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-500" />
                      <span>سنة {pickerYear}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPickerYear(pickerYear + 1)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition active:scale-90"
                      title="السنة القادمة"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 12 Months Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {ARABIC_MONTHS.map((monthName, idx) => {
                      const isCurrentActive =
                        pickerYear === year && idx === monthIndex;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectMonth(pickerYear, idx)}
                          className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 text-center ${
                            isCurrentActive
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/25'
                              : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 border border-slate-200/50 dark:border-slate-700/50'
                          }`}
                        >
                          {monthName}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Action: Current Month Shortcut */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={handleJumpToCurrentMonth}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      الشهر الحالي (اليوم)
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPickerOpen(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-90"
              title={darkMode ? "الوضع الفاتح" : "الوضع الليلي"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Export Button */}
            <button
              onClick={onOpenExportModal}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-90"
              title="نسخ احتياطي وتصدير البيانات"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* User Profile Avatar */}
            <button
              onClick={onOpenAuthModal}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-200 dark:bg-slate-700 hover:ring-2 hover:ring-emerald-500 text-slate-800 dark:text-white font-black text-xs flex items-center justify-center transition active:scale-90 shadow-sm shrink-0"
              title="الملف الشخصي والحساب"
            >
              {cloudUser ? (cloudUser.email?.charAt(0).toUpperCase()) : (currentUser?.avatar || 'ح')}
            </button>

          </div>

          {/* Mobile Actions: Only Primary CTA + Hamburger Bars (Ultra Clean & Spacious) */}
          <div className="flex sm:hidden items-center gap-2 shrink-0">
            
            {/* Quick Context CTA */}
            {activeTab === 'withdrawals' ? (
              <button
                onClick={onOpenAddWithdrawal}
                className="flex items-center gap-1 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs px-2.5 py-1.5 rounded-xl shadow-md shadow-rose-500/20 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>سحب</span>
              </button>
            ) : (
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs px-2.5 py-1.5 rounded-xl shadow-md shadow-emerald-500/20 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>دخل</span>
              </button>
            )}

            {/* Quick Cloud Sync CTA */}
            <button
              onClick={onOpenCloudSync}
              className="p-1.5 rounded-xl border transition-all duration-200 active:scale-95 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/80 text-emerald-700 dark:text-emerald-300"
              title="المزامنة الفورية مفعلة (Supabase Realtime)"
            >
              <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce text-emerald-500' : 'text-emerald-600 dark:text-emerald-400'}`} />
            </button>

            {/* Hamburger Bars Menu Trigger */}
            <div className="relative">
              <button
                ref={mobileMenuButtonRef}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-xl border transition-all duration-200 active:scale-95 ${
                  isMobileMenuOpen
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="القائمة والخيارات"
              >
                {isMobileMenuOpen ? (
                  <X className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </button>

              {/* Mobile Popover Menu Dropdown */}
              {isMobileMenuOpen && (
                <div
                  ref={mobileMenuRef}
                  className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-200 space-y-1.5"
                >
                  {/* Page Navigation Tabs in Mobile */}
                  <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex gap-1 mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (onSwitchTab) onSwitchTab('incomes');
                      }}
                      className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        activeTab === 'incomes'
                          ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      <span>الإيرادات</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (onSwitchTab) onSwitchTab('withdrawals');
                      }}
                      className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        activeTab === 'withdrawals'
                          ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>المسحوبات</span>
                      {withdrawalsCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                          {withdrawalsCount}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Active Month Item (Opens Calendar Picker) */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsPickerOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-right transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block font-normal">الشهر المعروض:</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {ARABIC_MONTHS[monthIndex]} {year}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60">
                      تغيير
                    </span>
                  </button>

                  {/* Dark Mode Toggle Item */}
                  <button
                    onClick={() => {
                      setDarkMode(!darkMode);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-right transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
                        {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {darkMode ? 'الوضع الفاتح' : 'الوضع الليلي'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {darkMode ? '☀️' : '🌙'}
                    </span>
                  </button>

                  {/* Export Item */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenExportModal();
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-right transition"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Download className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      نسخ احتياطي وتصدير
                    </span>
                  </button>

                  {/* Cloud Sync Item */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenCloudSync();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-right transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          المزامنة التلقائية
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-normal">
                          {cloudUser ? 'مفعلة وتتزامن مع كافة الأجهزة' : 'غير متصل (انقر للربط)'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                      {isSyncing ? 'جارٍ...' : (cloudUser ? '🟢 متزامن' : '⚠️ ربط')}
                    </span>
                  </button>

                  {/* Profile & Account Item */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuthModal();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-right transition border-t border-slate-100 dark:border-slate-800/80 pt-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-black text-xs flex items-center justify-center">
                        {cloudUser ? (cloudUser.email?.charAt(0).toUpperCase()) : (currentUser?.avatar || 'ح')}
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block font-normal">الحساب الشخصي</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px] block">
                          {cloudUser?.email || currentUser?.name || 'حسابي'}
                        </span>
                      </div>
                    </div>
                    <User className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
