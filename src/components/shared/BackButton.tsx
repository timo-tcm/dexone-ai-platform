'use client';

import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onBack: () => void;
  moduleName?: string;
}

export default function BackButton({ onBack }: BackButtonProps) {
  return (
    <button
      onClick={onBack}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
    >
      <ArrowLeft size={14} />
      <span>← Volver al Dashboard</span>
    </button>
  );
}
