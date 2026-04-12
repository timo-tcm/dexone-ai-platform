'use client';

import type { DashboardModule } from '@/types/index';

interface ModuleCardProps {
  module: DashboardModule;
  onOpen: () => void;
}

export default function ModuleCard({ module, onOpen }: ModuleCardProps) {
  const isOffline = module.status === 'offline';
  const visibleTags = module.tags.slice(0, 4);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-sm"
          style={{ backgroundColor: module.color }}
        >
          {module.code}
        </div>
        <span className={`flex items-center gap-1 text-xs font-semibold ${isOffline ? 'text-red-500' : 'text-green-500'}`}>
          <span className={`w-2 h-2 rounded-full inline-block ${isOffline ? 'bg-red-500' : 'bg-green-400'}`} />
          {isOffline ? 'Sin conexión' : 'Live'}
        </span>
      </div>

      {/* Name + description */}
      <div className="px-4 pb-3">
        <h3 className="font-bold text-gray-800 text-sm leading-tight">{module.name}</h3>
        <p className="text-xs text-gray-400 mt-1 leading-snug">{module.description}</p>
      </div>

      {/* Metrics */}
      <div className="px-4 pb-3 flex gap-4">
        {module.metrics.map((metric, i) => (
          <div key={i} className="flex flex-col">
            <span className="text-xl font-bold text-gray-800 leading-tight">
              {metric.value}{metric.unit ? <span className="text-sm font-normal text-gray-500 ml-0.5">{metric.unit}</span> : null}
            </span>
            <span className="text-[10px] text-gray-400 leading-tight">{metric.label}</span>
          </div>
        ))}
      </div>

      {/* Tags */}
      <div className="px-4 pb-3 flex flex-wrap gap-1">
        {visibleTags.map((tag, i) => (
          <span
            key={i}
            className="text-[10px] border border-gray-300 text-gray-500 rounded px-1.5 py-0.5"
          >
            {tag.label}
          </span>
        ))}
      </div>

      {/* Open button */}
      <div className="mt-auto px-4 pb-4">
        <button
          onClick={onOpen}
          className="w-full text-xs font-semibold py-2 rounded border transition-colors hover:opacity-80"
          style={{ color: module.color, borderColor: module.color }}
        >
          Abrir módulo →
        </button>
      </div>
    </div>
  );
}
