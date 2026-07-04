import React, { useEffect } from 'react';

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
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 max-w-sm bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 border border-slate-800 animate-slide-in">
      <span className="text-primary-light text-base font-bold">✦</span>
      <p className="text-sm font-medium pr-2 leading-relaxed">{message}</p>
      <button 
        onClick={onClose} 
        className="ml-auto text-slate-400 hover:text-white transition-colors duration-150 text-lg font-bold focus:outline-none"
        aria-label="Tutup"
      >
        &times;
      </button>
    </div>
  );
}
