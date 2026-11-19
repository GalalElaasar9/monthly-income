import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setIsExiting(false);

    // Auto-dismiss after 3.2 seconds
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, 3200);

    return () => clearTimeout(dismissTimer);
  }, [toast]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setIsExiting(false);
    }, 280);
  };

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[92%] sm:w-full pointer-events-none transition-all ${
        isExiting ? 'animate-toast-out' : 'animate-toast-in'
      }`}
    >
      <div
        className={`pointer-events-auto relative overflow-hidden p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center justify-between gap-3 ${
          isSuccess
            ? 'bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-950/40'
            : isError
            ? 'bg-slate-900/95 text-white border-rose-500/50 shadow-rose-950/40'
            : 'bg-slate-900/95 text-white border-slate-700/80 shadow-slate-950/40'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              isSuccess
                ? 'bg-emerald-500/20 text-emerald-400'
                : isError
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : isError ? (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            ) : (
              <Info className="w-5 h-5 text-blue-400" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold leading-tight">
              {toast.title || (isSuccess ? 'تمت العملية بنجاح' : isError ? 'تنبيه' : 'معلومة')}
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              {toast.message}
            </p>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated Countdown Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800">
          <div
            className={`h-full progress-bar-countdown ${
              isSuccess ? 'bg-emerald-500' : isError ? 'bg-rose-500' : 'bg-blue-500'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
