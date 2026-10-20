"use client";

import React from 'react';
import { AppProvider } from '@/context/AppContext';

export function Providers({ children }) {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
}
