"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';

export default function StudentLayout({ children }) {
  return (
    <AuthGuard allowedRoles={['student']}>
      <div className="min-h-screen bg-canvas text-content-primary flex flex-col font-sans transition-colors duration-150">
        <Navbar />
        <div className="flex-1 w-full">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
