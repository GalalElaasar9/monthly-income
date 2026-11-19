import React, { useState, useEffect } from 'react';

export default function ModalWrapper({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-lg',
  zIndex = 'z-50',
  className = ''
}) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [touchStartY, setTouchStartY] = useState(null);

  useEffect(() => {
    let timer;
    if (isOpen) {
      setMounted(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setActive(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setActive(false);
      timer = setTimeout(() => {
        setMounted(false);
      }, 300); // Matches exit duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Support closing on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Touch gesture to swipe down bottom sheet on mobile
  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    if (touchStartY === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchEndY - touchStartY;
    // If user dragged down by 65px or more, dismiss bottom sheet
    if (diff > 65 && onClose) {
      onClose();
    }
    setTouchStartY(null);
  };

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 ${zIndex} flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 ease-out ${
        active
          ? 'bg-slate-900/65 backdrop-blur-sm opacity-100'
          : 'bg-slate-900/0 backdrop-blur-none opacity-0 pointer-events-none'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div
        className={`bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl rounded-b-none sm:rounded-b-3xl ${maxWidth} w-full border-t border-x sm:border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[90vh] pb-3 sm:pb-0 transition-all duration-300 ease-out transform ${
          active
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 sm:scale-95 translate-y-full sm:translate-y-4 pointer-events-none'
        }`}
      >
        {/* Mobile Bottom Sheet Drag Handle */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="sm:hidden pt-3 pb-1 flex justify-center items-center shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
          title="اسحب لأسفل للإغلاق"
        >
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 transition" />
        </div>

        {/* Modal / Bottom Sheet Content Container */}
        <div className={`flex flex-col flex-1 overflow-hidden ${className}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
