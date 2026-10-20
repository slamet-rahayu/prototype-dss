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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true"
      />
      <div className={`relative w-full ${maxWidth} bg-surface border border-divider rounded-xl shadow-xl overflow-hidden z-10 animate-slide-down text-content-primary flex flex-col max-h-[90vh] ${className}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider bg-subsurface/50 shrink-0">
          <h3 id="modal-title" className="text-base font-bold text-content-primary">
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className="flex items-center justify-center w-8 h-8 rounded-lg text-content-muted hover:text-content-primary hover:bg-subsurface transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary"
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
