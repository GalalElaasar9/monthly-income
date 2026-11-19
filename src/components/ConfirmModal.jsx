import React from 'react';
import { AlertTriangle, Trash2, Check } from 'lucide-react';
import ModalWrapper from './ModalWrapper';

export default function ConfirmModal({
  isOpen,
  title = 'تأكيد الإجراء',
  message = 'هل أنت متأكد من المتابعة؟ لا يمكن التراجع عن هذا الإجراء.',
  confirmText = 'نعم، متأكد',
  cancelText = 'إلغاء',
  isDanger = true,
  onConfirm,
  onClose
}) {
  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-sm"
      zIndex="z-[90]"
      className="p-6 text-center"
    >
      {/* Icon */}
      <div
        className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
          isDanger
            ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
            : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
        }`}
      >
        {isDanger ? <Trash2 className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
      </div>

      {/* Text */}
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
        {message}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {cancelText}
        </button>
        
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 ${
            isDanger
              ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
              : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{confirmText}</span>
        </button>
      </div>
    </ModalWrapper>
  );
}
