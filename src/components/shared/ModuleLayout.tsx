'use client';

import { ReactNode } from 'react';
import BackButton from './BackButton';

interface ModuleLayoutProps {
  moduleId: string;
  moduleName: string;
  moduleCode: string;
  accentColor: string;
  onBack: () => void;
  children: ReactNode;
}

export default function ModuleLayout({
  moduleName,
  moduleCode,
  accentColor,
  onBack,
  children,
}: ModuleLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Module header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          {/* Code badge */}
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-black text-lg shadow"
            style={{ backgroundColor: accentColor }}
          >
            {moduleCode}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{moduleName}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
              <span className="text-xs text-green-600 font-semibold uppercase tracking-wide">Live</span>
            </div>
          </div>
        </div>
        <BackButton onBack={onBack} />
      </div>

      {/* Content */}
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
