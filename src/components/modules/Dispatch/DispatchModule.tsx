'use client';

import { useState } from 'react';
import { MapPin, Thermometer, Clock, User } from 'lucide-react';
import ModuleLayout from '@/components/shared/ModuleLayout';
import StatusBadge from '@/components/shared/StatusBadge';
import { dispatchOrders, trackingUnits } from '@/data/dispatch';
import type { DispatchOrder } from '@/types/index';

interface DispatchModuleProps {
  onBack: () => void;
}

const ACCENT = '#2563EB';

const AVAILABLE_OPERATORS = [
  'Carlos Mendoza',
  'Roberto Sánchez',
  'Luis Herrera',
  'Alejandro Torres',
  'Miguel Ángel Ruiz',
  'Jorge Ramírez',
];

function sortOrders(orders: DispatchOrder[]): DispatchOrder[] {
  return [...orders].sort((a, b) => {
    const aUrgent = a.minutesWithoutAssignment > 30 ? 0 : 1;
    const bUrgent = b.minutesWithoutAssignment > 30 ? 0 : 1;
    if (aUrgent !== bUrgent) return aUrgent - bUrgent;

    const aTempAlert = a.currentTemp > a.tempThreshold ? 0 : 1;
    const bTempAlert = b.currentTemp > b.tempThreshold ? 0 : 1;
    return aTempAlert - bTempAlert;
  });
}

const trackingStatusColor: Record<string, string> = {
  'En ruta':    'bg-blue-100 text-blue-700',
  'Cargando':   'bg-yellow-100 text-yellow-700',
  'Disponible': 'bg-green-100 text-green-700',
};

export default function DispatchModule({ onBack }: DispatchModuleProps) {
  const [orders, setOrders] = useState<DispatchOrder[]>(sortOrders(dispatchOrders));
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string>('');

  const activeDOs = orders.length;
  const unassignedDOs = orders.filter((o) => o.operator === null).length;
  const tempAlerts = orders.filter((o) => o.currentTemp > o.tempThreshold).length;

  const handleAssign = (orderId: string) => {
    if (!selectedOperator) return;
    setOrders((prev) =>
      sortOrders(
        prev.map((o) =>
          o.id === orderId
            ? { ...o, operator: selectedOperator, status: 'Asignada', minutesWithoutAssignment: 0 }
            : o
        )
      )
    );
    setAssigningId(null);
    setSelectedOperator('');
  };

  return (
    <ModuleLayout
      moduleId="dispatch"
      moduleName="AI Dispatch"
      moduleCode="DX"
      accentColor={ACCENT}
      onBack={onBack}
    >
      {/* Metrics row */}
      <div className="flex gap-4 mb-4">
        {[
          { label: 'DOs activas',                    value: activeDOs    },
          { label: 'DOs sin asignar',                value: unassignedDOs },
          { label: 'Alertas de temperatura activas', value: tempAlerts   },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-lg border border-gray-200 px-4 py-2 flex flex-col">
            <span className="text-xs text-gray-500">{m.label}</span>
            <span className="text-xl font-bold text-gray-800">{m.value}</span>
          </div>
        ))}
      </div>

      {/* 2-column layout */}
      <div className="flex gap-4">

        {/* Left — Active DOs (2/3) */}
        <div className="flex-[2] flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-220px)]">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">DOs Activas</p>

          {orders.map((order) => {
            const isUrgent = order.minutesWithoutAssignment > 30;
            const isTempAlert = order.currentTemp > order.tempThreshold;
            const isAssigning = assigningId === order.id;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-lg border p-4 transition-all ${
                  isUrgent
                    ? 'border-red-500 shadow-md ring-1 ring-red-400'
                    : 'border-gray-200'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800 text-sm">{order.id}</span>
                    {isUrgent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white uppercase tracking-wide">
                        URGENTE
                      </span>
                    )}
                  </div>
                  <StatusBadge status={order.status as Parameters<typeof StatusBadge>[0]['status']} />
                </div>

                {/* Route & client */}
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <MapPin size={11} />
                  <span>{order.route}</span>
                  <span className="mx-1 text-gray-300">·</span>
                  <span className="text-gray-600">{order.client}</span>
                </div>

                {/* Operator & temp row */}
                <div className="flex items-center gap-3 flex-wrap mt-2">
                  {/* Operator */}
                  <div className="flex items-center gap-1 text-xs">
                    <User size={11} className="text-gray-400" />
                    {order.operator ? (
                      <span className="text-gray-700">{order.operator}</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-semibold uppercase">
                        Sin asignar
                      </span>
                    )}
                  </div>

                  {/* Temperature badge */}
                  <div className="flex items-center gap-1 text-xs">
                    <Thermometer size={11} className={isTempAlert ? 'text-red-500' : 'text-green-500'} />
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isTempAlert
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {isTempAlert
                        ? `⚠ ${order.currentTemp.toFixed(1)}°C / umbral ${order.tempThreshold.toFixed(1)}°C`
                        : `✓ ${order.currentTemp.toFixed(1)}°C`}
                    </span>
                  </div>

                  {/* Minutes without assignment */}
                  {order.minutesWithoutAssignment > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={11} />
                      <span>{order.minutesWithoutAssignment} min sin asignar</span>
                    </div>
                  )}
                </div>

                {/* Assign operator section */}
                <div className="mt-3">
                  {isAssigning ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        aria-label="Seleccionar operador"
                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:border-blue-400"
                        value={selectedOperator}
                        onChange={(e) => setSelectedOperator(e.target.value)}
                      >
                        <option value="">Seleccionar operador...</option>
                        {AVAILABLE_OPERATORS.map((op) => (
                          <option key={op} value={op}>{op}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleAssign(order.id)}
                        disabled={!selectedOperator}
                        className="text-xs px-3 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAssigningId(null); setSelectedOperator(''); }}
                        className="text-xs px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setAssigningId(order.id); setSelectedOperator(''); }}
                      className="text-xs px-3 py-1 rounded border border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                    >
                      Asignar operador
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right — Tracking panel (1/3) */}
        <div className="flex-[1] flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={14} className="text-blue-600" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tracking en Vivo</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2 text-gray-500 font-semibold">Placa</th>
                  <th className="text-left px-3 py-2 text-gray-500 font-semibold">Operador</th>
                  <th className="text-left px-3 py-2 text-gray-500 font-semibold">Ubicación</th>
                  <th className="text-left px-3 py-2 text-gray-500 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {trackingUnits.map((unit, idx) => (
                  <tr
                    key={unit.id}
                    className={`border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    <td className="px-3 py-2 font-mono font-semibold text-gray-700">{unit.plate}</td>
                    <td className="px-3 py-2 text-gray-600">{unit.operator}</td>
                    <td className="px-3 py-2 text-gray-500">{unit.location}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${trackingStatusColor[unit.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {unit.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </ModuleLayout>
  );
}
