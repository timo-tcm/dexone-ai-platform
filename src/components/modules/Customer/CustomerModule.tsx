'use client';

import { useState, useMemo } from 'react';
import ModuleLayout from '@/components/shared/ModuleLayout';
import StatusBadge from '@/components/shared/StatusBadge';
import { tickets as initialTickets, customerMetrics } from '@/data/customer';
import type { Ticket } from '@/types/index';

interface CustomerModuleProps {
  onBack: () => void;
}

type TabId = 'Todos' | 'Premium' | 'Standard' | 'Gobierno';

const clientTypeBadge: Record<string, string> = {
  Premium: 'bg-orange-100 text-orange-700',
  Standard: 'bg-blue-100 text-blue-700',
  Gobierno: 'bg-green-100 text-green-700',
};

function getSlaColor(percent: number): string {
  if (percent > 100) return 'bg-red-500';
  if (percent >= 80) return 'bg-yellow-400';
  return 'bg-green-500';
}

function applyAutoEscalation(list: Ticket[]): Ticket[] {
  return list.map((t) =>
    t.elapsedHours > t.slaHours
      ? { ...t, status: 'escalado' }
      : t,
  );
}

export default function CustomerModule({ onBack }: CustomerModuleProps) {
  const [activeTab, setActiveTab] = useState<string>('Todos');
  const [ticketList, setTicketList] = useState<Ticket[]>(() =>
    applyAutoEscalation(initialTickets),
  );

  const tabs: TabId[] = ['Premium', 'Standard', 'Gobierno', 'Todos'];

  const filteredTickets = useMemo(
    () =>
      activeTab === 'Todos'
        ? ticketList
        : ticketList.filter((t) => t.clientType === activeTab),
    [activeTab, ticketList],
  );

  return (
    <ModuleLayout
      moduleId="customer"
      moduleName="AI Customer"
      moduleCode="CX"
      accentColor="#EA580C"
      onBack={onBack}
    >
      {/* Header metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tickets Abiertos</p>
          <p className="text-2xl font-bold text-gray-800">{customerMetrics.openTickets}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Satisfacción</p>
          <p className="text-2xl font-bold text-orange-600">{customerMetrics.satisfactionRate}%</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Resolución 1er Contacto</p>
          <p className="text-2xl font-bold text-orange-600">{customerMetrics.firstContactResolutionRate}%</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tickets Escalados</p>
          <p className="text-2xl font-bold text-red-600">{customerMetrics.escalatedTickets}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 text-orange-700 bg-orange-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              style={activeTab === tab ? { borderColor: '#EA580C' } : undefined}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Ticket list */}
        <div className="p-6 space-y-4">
          {filteredTickets.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No hay tickets en esta categoría.</p>
          )}

          {filteredTickets.map((ticket) => {
            const slaPercent = (ticket.elapsedHours / ticket.slaHours) * 100;
            const remainingHours = ticket.slaHours - ticket.elapsedHours;
            const remainingPercent = remainingHours > 0 ? (remainingHours / ticket.slaHours) * 100 : 0;
            const isExpired = ticket.elapsedHours > ticket.slaHours;
            const isUrgent = !isExpired && remainingPercent < 20;
            const barColor = getSlaColor(slaPercent);

            return (
              <div
                key={ticket.id}
                className={`rounded-lg border p-4 ${
                  isExpired
                    ? 'bg-red-50 border-red-200'
                    : isUrgent
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-white border-gray-100'
                }`}
              >
                {/* Row 1: ID, client, subject */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-gray-500">{ticket.id}</span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                          clientTypeBadge[ticket.clientType] ?? 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {ticket.clientType}
                      </span>
                      <StatusBadge status={ticket.status as Parameters<typeof StatusBadge>[0]['status']} />
                      {isExpired && (
                        <>
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-red-600 text-white">
                            SLA VENCIDO
                          </span>
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-red-100 text-red-700">
                            Escalado
                          </span>
                        </>
                      )}
                      {isUrgent && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-amber-500 text-white animate-pulse">
                          ⚠ Urgente
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-800 mt-1">{ticket.client}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{ticket.subject}</p>
                  </div>
                </div>

                {/* Row 2: SLA progress */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">
                      {ticket.elapsedHours.toFixed(1)}h / {ticket.slaHours}h SLA
                    </span>
                    <span className={isExpired ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                      {isExpired
                        ? `Excedido por ${Math.abs(remainingHours).toFixed(1)}h`
                        : `${remainingHours.toFixed(1)}h restantes`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${barColor}`}
                      style={{ width: `${Math.min(slaPercent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ModuleLayout>
  );
}
