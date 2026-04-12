'use client';

import type { GlobalCounters } from '@/types/index';

interface HeaderProps {
  globalCounters: GlobalCounters;
}

export default function Header({ globalCounters }: HeaderProps) {
  return (
    <header className="bg-[#1e3a5f] text-white px-6 py-3 flex items-center justify-between shadow-lg">
      {/* Logo + Brand */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-500 text-white font-black text-xl w-10 h-10 flex items-center justify-center rounded">
          DX
        </div>
        <div>
          <div className="font-bold text-lg leading-tight tracking-widest">DEXONE</div>
          <div className="text-[10px] text-blue-300 tracking-widest uppercase">
            Corporate AI Platform
          </div>
        </div>
      </div>

      {/* Counters */}
      <div className="flex items-center gap-4">
        {/* Módulos */}
        <div className="flex items-center gap-1.5 bg-blue-900/40 rounded px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
          <span className="text-xs text-blue-200">Módulos</span>
          <span className="text-sm font-bold text-blue-100">{globalCounters.activeModules}</span>
        </div>

        {/* Agentes */}
        <div className="flex items-center gap-1.5 bg-green-900/40 rounded px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
          <span className="text-xs text-green-200">Agentes</span>
          <span className="text-sm font-bold text-green-100">{globalCounters.activeAgents}</span>
        </div>

        {/* Alertas */}
        <div className="flex items-center gap-1.5 bg-orange-900/40 rounded px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
          <span className="text-xs text-orange-200">Alertas</span>
          <span className="text-sm font-bold text-orange-100">{globalCounters.pendingAlerts}</span>
        </div>

        {/* API Status */}
        <div className="flex items-center gap-1.5 bg-green-900/40 rounded px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
          <span className="text-xs text-green-200">API</span>
          <span className="text-sm font-bold text-green-100">{globalCounters.apiStatus}</span>
          <span className="text-xs text-green-300">{globalCounters.apiLatency}</span>
        </div>
      </div>

      {/* Company + Sync */}
      <div className="text-right">
        <div className="font-semibold text-sm tracking-wide">BALI Express Services</div>
        <div className="text-[10px] text-blue-300 mt-0.5">
          Última sincronización: {globalCounters.lastSync}
        </div>
      </div>
    </header>
  );
}
