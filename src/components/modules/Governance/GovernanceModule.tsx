'use client';

import { useState } from 'react';
import ModuleLayout from '@/components/shared/ModuleLayout';
import StatusBadge from '@/components/shared/StatusBadge';
import { moduleGovernance, auditLogs, escalations, agents } from '@/data/governance';
import type { AgentIA, AuditLog } from '@/types/index';
import AgentsPanel from './AgentsPanel';

interface GovernanceModuleProps {
  onBack: () => void;
}

type Panel =
  | 'estado'
  | 'riesgos'
  | 'autonomia'
  | 'precision'
  | 'calidad'
  | 'escalamientos'
  | 'auditoria'
  | 'kpis'
  | 'agentes';

const tabs: { id: Panel; label: string }[] = [
  { id: 'estado', label: 'Estado de Módulos' },
  { id: 'riesgos', label: 'Mapa de Riesgos' },
  { id: 'autonomia', label: 'Autonomía IA' },
  { id: 'precision', label: 'Precisión de Agentes' },
  { id: 'calidad', label: 'Calidad de Datos' },
  { id: 'escalamientos', label: 'Escalamientos' },
  { id: 'auditoria', label: 'Auditoría/Logs' },
  { id: 'kpis', label: 'KPIs & SLA' },
  { id: 'agentes', label: 'Agentes IA' },
];

function riskColor(level: string) {
  if (level === 'alto') return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-400' };
  if (level === 'medio') return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-400' };
  return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-400' };
}

function autonomyColor(val: number) {
  if (val > 85) return 'bg-green-500';
  if (val >= 70) return 'bg-yellow-500';
  return 'bg-red-500';
}

function qualityLabel(val: number) {
  if (val >= 95) return { label: 'Bueno', cls: 'text-green-700 bg-green-100' };
  if (val >= 85) return { label: 'Regular', cls: 'text-yellow-700 bg-yellow-100' };
  return { label: 'Bajo', cls: 'text-red-700 bg-red-100' };
}

function slaStatus(val: number) {
  if (val > 95) return { label: 'Cumple', cls: 'text-green-700 bg-green-100', bar: 'bg-green-500' };
  if (val >= 85) return { label: 'En riesgo', cls: 'text-yellow-700 bg-yellow-100', bar: 'bg-yellow-500' };
  return { label: 'Incumple', cls: 'text-red-700 bg-red-100', bar: 'bg-red-500' };
}

function exportCSV(logs: AuditLog[]) {
  const header = 'Timestamp,Módulo,Acción,Resultado,Usuario\n';
  const rows = logs
    .map((l) => `${l.timestamp},${l.module},"${l.action}","${l.result}",${l.user}`)
    .join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'audit-log-dexone.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function GovernanceModule({ onBack }: GovernanceModuleProps) {
  const [activePanel, setActivePanel] = useState<Panel>('estado');
  const [agentList, setAgentList] = useState<AgentIA[]>(agents);
  const [localAuditLogs, setLocalAuditLogs] = useState<AuditLog[]>(auditLogs);

  function addAuditLog(entry: AuditLog) {
    setLocalAuditLogs(prev => [entry, ...prev]);
  }

  return (
    <ModuleLayout
      moduleId="governance"
      moduleName="AI Governance"
      moduleCode="GV"
      accentColor="#374151"
      onBack={onBack}
    >
      {/* Tab bar — horizontal scroll */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActivePanel(tab.id)}
              className={`whitespace-nowrap px-5 py-3 text-sm font-medium transition-colors shrink-0 ${
                activePanel === tab.id
                  ? 'border-b-2 border-gray-700 text-gray-800 bg-gray-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Panel: Estado de Módulos ── */}
      {activePanel === 'estado' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">Estado Operativo de Módulos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Módulo</th>
                  <th className="text-center py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="text-center py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Precisión (%)</th>
                  <th className="text-center py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">SLA (%)</th>
                  <th className="text-center py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Autonomía (%)</th>
                  <th className="text-center py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Riesgo</th>
                  <th className="text-center py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Calidad Datos (%)</th>
                </tr>
              </thead>
              <tbody>
                {moduleGovernance.map((m) => {
                  const rc = riskColor(m.riskLevel);
                  return (
                    <tr key={m.moduleId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2.5 px-4 font-medium text-gray-800">{m.moduleName}</td>
                      <td className="py-2.5 px-4 text-center"><StatusBadge status={m.status} /></td>
                      <td className="py-2.5 px-4 text-center font-semibold text-gray-700">{m.precision}</td>
                      <td className="py-2.5 px-4 text-center font-semibold text-gray-700">{m.slaCompliance}</td>
                      <td className="py-2.5 px-4 text-center font-semibold text-gray-700">{m.autonomyLevel}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${rc.bg} ${rc.text}`}>
                          {m.riskLevel}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center font-semibold text-gray-700">{m.dataQuality}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Panel: Mapa de Riesgos ── */}
      {activePanel === 'riesgos' && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Mapa de Riesgos por Módulo</h2>
          <div className="grid grid-cols-4 gap-4">
            {moduleGovernance.map((m) => {
              const rc = riskColor(m.riskLevel);
              return (
                <div
                  key={m.moduleId}
                  className={`bg-white rounded-xl p-4 shadow-sm border-2 ${rc.border}`}
                >
                  <p className="text-sm font-semibold text-gray-800 mb-2">{m.moduleName}</p>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${rc.bg} ${rc.text}`}>
                    {m.riskLevel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Panel: Autonomía IA ── */}
      {activePanel === 'autonomia' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Nivel de Autonomía IA por Módulo</h2>
          <div className="space-y-4">
            {moduleGovernance.map((m) => (
              <div key={m.moduleId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 font-medium">{m.moduleName}</span>
                  <span className="text-sm font-bold text-gray-800">{m.autonomyLevel}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${autonomyColor(m.autonomyLevel)}`}
                    style={{ width: `${m.autonomyLevel}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Panel: Precisión de Agentes ── */}
      {activePanel === 'precision' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Precisión de Agentes por Módulo</h2>
          <div className="space-y-4">
            {moduleGovernance.map((m) => {
              const low = m.precision < 85;
              return (
                <div
                  key={m.moduleId}
                  className={`rounded-lg p-3 ${low ? 'border-2 border-red-400 bg-red-50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 font-medium">{m.moduleName}</span>
                      {low && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">
                          ⚠ Bajo objetivo
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-gray-800">{m.precision}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${low ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${m.precision}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Panel: Calidad de Datos ── */}
      {activePanel === 'calidad' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">Calidad de Datos por Módulo</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Módulo</th>
                  <th className="text-center py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Calidad (%)</th>
                  <th className="py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase text-left">Progreso</th>
                  <th className="text-center py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody>
                {moduleGovernance.map((m) => {
                  const q = qualityLabel(m.dataQuality);
                  return (
                    <tr key={m.moduleId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2.5 px-4 font-medium text-gray-800">{m.moduleName}</td>
                      <td className="py-2.5 px-4 text-center font-semibold text-gray-700">{m.dataQuality}</td>
                      <td className="py-2.5 px-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${m.dataQuality >= 95 ? 'bg-green-500' : m.dataQuality >= 85 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${m.dataQuality}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${q.cls}`}>
                          {q.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Panel: Escalamientos ── */}
      {activePanel === 'escalamientos' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">Escalamientos Activos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">ID</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Origen</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Descripción</th>
                  <th className="text-center py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Responsable</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {escalations.map((e) => (
                  <tr
                    key={e.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${e.status === 'abierto' ? 'bg-yellow-50' : ''}`}
                  >
                    <td className="py-2.5 px-4 font-mono text-xs text-gray-600">{e.id}</td>
                    <td className="py-2.5 px-4 text-gray-800">{e.source}</td>
                    <td className="py-2.5 px-4 text-gray-700 text-xs max-w-xs truncate">{e.description}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                          e.status === 'abierto'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-gray-700 text-xs">{e.responsible}</td>
                    <td className="py-2.5 px-4 text-gray-500 text-xs">{new Date(e.createdAt).toLocaleString('es-MX')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Panel: Auditoría/Logs ── */}
      {activePanel === 'auditoria' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Log de Auditoría ({localAuditLogs.length} entradas)</h2>
            <button
              type="button"
              onClick={() => exportCSV(localAuditLogs)}
              className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#374151' }}
            >
              Exportar CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Módulo</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Acción</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Resultado</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Usuario</th>
                </tr>
              </thead>
              <tbody>
                {localAuditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 px-4 text-gray-500 text-xs font-mono">
                      {new Date(log.timestamp).toLocaleString('es-MX')}
                    </td>
                    <td className="py-2.5 px-4 text-gray-800 text-xs">{log.module}</td>
                    <td className="py-2.5 px-4 text-gray-700 text-xs max-w-xs truncate">{log.action}</td>
                    <td className="py-2.5 px-4 text-xs">
                      <span
                        className={`${
                          log.result.startsWith('Fallo') || log.result.startsWith('Alerta')
                            ? 'text-red-600 font-semibold'
                            : 'text-gray-600'
                        }`}
                      >
                        {log.result}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-gray-500 text-xs">{log.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Panel: KPIs & SLA ── */}
      {activePanel === 'kpis' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">Cumplimiento de SLA por Módulo</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Módulo</th>
                  <th className="text-center py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">SLA (%)</th>
                  <th className="py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase text-left">Progreso</th>
                  <th className="text-center py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody>
                {moduleGovernance.map((m) => {
                  const s = slaStatus(m.slaCompliance);
                  return (
                    <tr key={m.moduleId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2.5 px-4 font-medium text-gray-800">{m.moduleName}</td>
                      <td className="py-2.5 px-4 text-center font-semibold text-gray-700">{m.slaCompliance}</td>
                      <td className="py-2.5 px-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${s.bar}`}
                            style={{ width: `${m.slaCompliance}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${s.cls}`}>
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Panel: Agentes IA ── */}
      {activePanel === 'agentes' && (
        <AgentsPanel
          agents={agentList}
          onAgentsChange={setAgentList}
          onAuditLog={addAuditLog}
        />
      )}
    </ModuleLayout>
  );
}
