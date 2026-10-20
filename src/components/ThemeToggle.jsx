"use client";

import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ 
  className = '', 
  showLabel = false, 
  size = 'md',
  variant = 'button' 
}) {
  const { isDarkMode, toggleDarkMode } = useContext(AppContext);

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-4 h-4';
  const paddingClass = size === 'sm' ? 'p-1.5' : 'p-2';

  if (variant === 'switch') {
    return (
      <button
        type="button"
        onClick={toggleDarkMode}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-divider transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary ${
          isDarkMode ? 'bg-primary' : 'bg-slate-200'
        } ${className}`}
        role="switch"
        aria-checked={isDarkMode}
        aria-label="Toggle tema gelap atau terang"
        title={isDarkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-150 ease-in-out flex items-center justify-center ${
            isDarkMode ? 'translate-x-5' : 'translate-x-0'
          }`}
        >
          {isDarkMode ? (
            <Moon className="w-3 h-3 text-slate-800" />
          ) : (
            <Sun className="w-3 h-3 text-amber-600" />
          )}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className={`inline-flex items-center gap-2 ${paddingClass} rounded-lg border border-divider bg-surface hover:bg-subsurface text-content-secondary hover:text-content-primary transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary ${className}`}
      title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
      aria-label={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
    >
      {isDarkMode ? (
        <Sun className={`${iconSize} text-amber-400`} aria-hidden="true" />
      ) : (
        <Moon className={`${iconSize} text-slate-600`} aria-hidden="true" />
      )}

      {showLabel && (
        <span className="text-xs font-medium select-none pr-1">
          {isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
        </span>
      )}
    </button>
  );
}
