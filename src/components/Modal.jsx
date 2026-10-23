"use client";

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, title, onClose, children, maxWidth = 'max-w-lg', className = '' }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pt-16 sm:pt-20 bg-slate-900/70 dark:bg-black/80 backdrop-blur-xs animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true"
      />
      <div className={`relative w-full ${maxWidth} bg-surface border border-divider rounded-2xl shadow-2xl overflow-hidden z-10 animate-slide-down text-content-primary flex flex-col max-h-[calc(100vh-6.5rem)] my-auto ${className}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider bg-subsurface/60 shrink-0">
          <h3 id="modal-title" className="text-base sm:text-lg font-bold text-content-primary truncate pr-4">
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className="flex items-center justify-center w-8 h-8 rounded-lg text-content-muted hover:text-content-primary hover:bg-subsurface transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary shrink-0"
            aria-label="Tutup dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
