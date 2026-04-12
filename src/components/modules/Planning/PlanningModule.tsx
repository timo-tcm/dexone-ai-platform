'use client';

import { useState, useMemo } from 'react';
import ModuleLayout from '@/components/shared/ModuleLayout';
import { workOrders, driverMoves as initialMoves, operators, units } from '@/data/planning';
import type { DriverMove } from '@/types/index';

interface PlanningModuleProps {
  onBack: () => void;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const urgencyBorder: Record<string, string> = {
  urgente: 'border-l-red-500',
  próxima: 'border-l-amber-500',
  programada: 'border-l-gray-400',
};

const urgencyBadge: Record<string, string> = {
  urgente: 'bg-red-100 text-red-700',
  próxima: 'bg-amber-100 text-amber-700',
  programada: 'bg-gray-100 text-gray-500',
};

const moveBg: Record<string, string> = {
  Pickup: 'bg-blue-50',
  Delivery: 'bg-green-50',
  Reposición: 'bg-yellow-50',
};

function getWeekStart(offset: number): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function PlanningModule({ onBack }: PlanningModuleProps) {
  const [moves, setMoves] = useState<DriverMove[]>(initialMoves);
  const [selectedMoveId, setSelectedMoveId] = useState<string | null>(null);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => getWeekStart(weekOffset), [weekOffset]);
  const selectedMove = moves.find((m) => m.id === selectedMoveId) ?? null;

  const movesByDay = useMemo(() => {
    const map: Record<number, DriverMove[]> = {};
    for (let i = 0; i < 6; i++) map[i] = [];
    moves.forEach((m) => {
      if (map[m.dayOfWeek]) map[m.dayOfWeek].push(m);
    });
    return map;
  }, [moves]);

  function handleSelectMove(move: DriverMove) {
    setSelectedMoveId(move.id);
    setSelectedOperatorId(null);
    setSelectedUnitId(null);
  }

  function handleConfirmAssignment() {
    if (!selectedMoveId || !selectedOperatorId || !selectedUnitId) return;
    const op = operators.find((o) => o.id === selectedOperatorId);
    const unit = units.find((u) => u.id === selectedUnitId);
    if (!op || !unit) return;
    setMoves((prev) =>
      prev.map((m) =>
        m.id === selectedMoveId
          ? { ...m, assignedOperator: op.name, assignedUnit: unit.id }
          : m,
      ),
    );
    setSelectedMoveId(null);
    setSelectedOperatorId(null);
    setSelectedUnitId(null);
  }

  return (
    <ModuleLayout
      moduleId="planning"
      moduleName="AI Planning"
      moduleCode="PL"
      accentColor="#0D9488"
      onBack={onBack}
    >
      <div className="flex gap-4 h-[calc(100vh-140px)]">
        {/* ── Columna izquierda — Work Orders ── */}
        <div className="w-56 flex-shrink-0 overflow-y-auto space-y-2">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Work Orders
          </h2>
          {workOrders.map((wo) => (
            <div
              key={wo.id}
              className={`bg-white rounded-lg border-l-4 ${urgencyBorder[wo.urgency]} p-3 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[11px] text-gray-600">{wo.id}</span>
                <span
                  className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide ${urgencyBadge[wo.urgency]}`}
                >
                  {wo.urgency}
                </span>
              </div>
              <p className="text-xs text-gray-800 leading-snug line-clamp-2">{wo.description}</p>
              <p className="text-[10px] text-gray-400 mt-1 truncate">{wo.client}</p>
            </div>
          ))}
        </div>

        {/* ── Columna central — Calendario semanal ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header de navegación */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setWeekOffset((w) => w - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-bold"
            >
              ‹
            </button>
            <h2 className="text-sm font-semibold text-gray-700">
              Semana del {formatDate(weekStart)}
            </h2>
            <button
              type="button"
              onClick={() => setWeekOffset((w) => w + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-bold"
            >
              ›
            </button>
          </div>

          {/* Grid de días */}
          <div className="grid grid-cols-6 gap-2 flex-1 overflow-y-auto">
            {DAYS.map((day, idx) => (
              <div key={day} className="flex flex-col">
                <div className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2 sticky top-0 bg-gray-100 py-1 rounded">
                  {day}
                </div>
                <div className="space-y-2 flex-1">
                  {movesByDay[idx].map((move) => {
                    const unassigned = !move.assignedOperator;
                    const isSelected = move.id === selectedMoveId;
                    return (
                      <button
                        key={move.id}
                        type="button"
                        onClick={() => handleSelectMove(move)}
                        className={`w-full text-left rounded-lg p-2 shadow-sm border transition-all ${moveBg[move.type]} ${
                          unassigned ? 'animate-pulse border-red-500' : 'border-gray-200'
                        } ${isSelected ? 'ring-2 ring-teal-500' : ''}`}
                      >
                        <p className="font-mono text-[10px] text-gray-500">{move.workOrderId}</p>
                        <p className="text-[11px] font-semibold text-gray-800 mt-0.5">{move.timeWindow}</p>
                        <p className="text-[10px] text-gray-600 truncate">{move.location}</p>
                        <p className="text-[10px] text-gray-400 truncate">{move.client}</p>
                        <div className="mt-1">
                          {move.assignedOperator ? (
                            <span className="text-[9px] text-green-700 font-semibold">✓ Asignado</span>
                          ) : (
                            <span className="text-[9px] text-red-600 font-semibold">Sin asignar</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Columna derecha — Panel de asignación ── */}
        {selectedMove && (
          <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-y-auto p-4">
            {/* Detalle del move */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-800">Detalle del Move</h3>
                <button
                  type="button"
                  onClick={() => setSelectedMoveId(null)}
                  className="text-gray-400 hover:text-gray-600 text-lg font-bold leading-none"
                >
                  ×
                </button>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tipo</span>
                  <span className="font-semibold text-gray-800">{selectedMove.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">WO</span>
                  <span className="font-mono text-gray-700">{selectedMove.workOrderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ventana</span>
                  <span className="text-gray-700">{selectedMove.timeWindow}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ubicación</span>
                  <span className="text-gray-700 text-right max-w-[140px] truncate">{selectedMove.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cliente</span>
                  <span className="text-gray-700 text-right max-w-[140px] truncate">{selectedMove.client}</span>
                </div>
              </div>
            </div>

            {/* Nota IA */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-4">
              <p className="text-[10px] font-semibold text-teal-700 uppercase tracking-wide mb-1">🤖 Planeador IA</p>
              <p className="text-xs text-teal-800 leading-relaxed">
                Recomendación: asignar operador con experiencia en ruta refrigerada
              </p>
            </div>

            {/* Operadores */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Operadores</h4>
              <div className="space-y-1.5">
                {operators.map((op) => (
                  <label
                    key={op.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedOperatorId === op.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="operator"
                      value={op.id}
                      checked={selectedOperatorId === op.id}
                      onChange={() => setSelectedOperatorId(op.id)}
                      className="accent-teal-600"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800">{op.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{op.availability} · {op.currentLocation}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Unidades */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Unidades</h4>
              <div className="space-y-1.5">
                {units.map((u) => (
                  <label
                    key={u.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedUnitId === u.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="unit"
                      value={u.id}
                      checked={selectedUnitId === u.id}
                      onChange={() => setSelectedUnitId(u.id)}
                      className="accent-teal-600"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800">{u.brand} ({u.year})</p>
                      <p className="text-[10px] text-gray-500">{u.capacity}</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {u.equipment.map((eq) => (
                          <span
                            key={eq}
                            className="inline-block px-1.5 py-0.5 rounded text-[8px] font-semibold bg-gray-100 text-gray-600"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Botón confirmar */}
            <button
              type="button"
              disabled={!selectedOperatorId || !selectedUnitId}
              onClick={handleConfirmAssignment}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#0D9488' }}
            >
              Confirmar asignación
            </button>
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
