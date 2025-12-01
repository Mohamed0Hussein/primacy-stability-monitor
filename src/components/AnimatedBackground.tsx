// src/components/AnimatedBackground.tsx
import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 opacity-50 bg-gradient-to-br from-indigo-50/50 via-white to-rose-50/50 dark:from-slate-900/50 dark:via-slate-900 dark:to-purple-900/50" />
      
      {/* Animated blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64">
        <div className="w-full h-full rounded-full blur-3xl opacity-30 animate-pulse bg-indigo-400" />
      </div>
      
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96">
        <div className="w-full h-full rounded-full blur-3xl opacity-20 animate-pulse animation-delay-1000 bg-rose-400" />
      </div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:50px_50px] opacity-[0.03] dark:opacity-[0.05]" />
    </div>
  );
};