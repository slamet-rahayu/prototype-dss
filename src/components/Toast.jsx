"use client";

import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export default function Toast({ show, message, onClose, duration = 3000 }) {
  useEffect(() => {
    if (show && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 max-w-sm bg-slate-900 text-slate-100 dark:bg-slate-800 dark:text-slate-100 px-4 py-3 rounded-lg shadow-lg border border-slate-700 animate-slide-down"
      role="status"
      aria-live="polite"
    >
      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
      <p className="text-xs font-medium leading-relaxed flex-1">{message}</p>
      <button 
        onClick={onClose} 
        className="text-slate-400 hover:text-white transition-colors duration-150 p-1 rounded focus-visible:ring-1 focus-visible:ring-white"
        aria-label="Tutup notifikasi"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
