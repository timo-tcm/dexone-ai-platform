'use client';

import type { DashboardModule } from '@/types/index';

interface FooterProps {
  modules: DashboardModule[];
}

const statusDot: Record<string, string> = {
  live: 'bg-green-400',
  warning: 'bg-yellow-400',
  offline: 'bg-red-500',
};

export default function Footer({ modules }: FooterProps) {
  const activeAgents = modules.filter((m) => m.status === 'live').length;
  const pendingAlerts = modules.filter((m) => m.status === 'warning' || m.status === 'offline').length;

  return (
    <footer className="bg-[#1e3a5f] text-white px-6 py-2 flex items-center justify-between text-xs">
      {/* Module status indicators */}
      <div className="flex items-center gap-4">
        {modules.map((mod) => (
          <div key={mod.id} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full inline-block ${statusDot[mod.status] ?? 'bg-gray-400'}`} />
            <span className="text-blue-200 font-mono font-semibold">{mod.code}</span>
          </div>
        ))}
      </div>

      {/* System info */}
      <div className="flex items-center gap-6 text-blue-300">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          Sistema operativo
        </span>
        <span>Agentes activos: <span className="text-white font-semibold">{activeAgents}</span></span>
        <span>Alertas pendientes: <span className="text-orange-300 font-semibold">{pendingAlerts}</span></span>
        <span className="text-blue-400">API v2.4</span>
      </div>
    </footer>
  );
}
