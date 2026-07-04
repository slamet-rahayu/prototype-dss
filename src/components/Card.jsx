import React from 'react';

export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
