'use client';

import { useState } from 'react';
import type { AgentIA, AuditLog } from '@/types/index';
import AgentForm from './AgentForm';

interface AgentsPanelProps {
  agents: AgentIA[];
  onAgentsChange: (agents: AgentIA[]) => void;
  onAuditLog: (entry: AuditLog) => void;
}

export default function AgentsPanel({ agents, onAgentsChange, onAuditLog }: AgentsPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentIA | null>(null);
  const [detailAgent, setDetailAgent] = useState<AgentIA | null>(null);

  const activeCount = agents.filter(a => a.status === 'activo').length;
  const inactiveCount = agents.filter(a => a.status === 'inactivo').length;

  // Count agents per module
  const moduleCounts: Record<string, { activo: number; inactivo: number }> = {};
  agents.forEach(a => {
    if (!moduleCounts[a.targetModule]) moduleCounts[a.targetModule] = { activo: 0, inactivo: 0 };
    moduleCounts[a.targetModule][a.status]++;
  });

  function toggleAgentStatus(agentId: string) {
    const updated = agents.map(a => {
      if (a.id !== agentId) return a;
      const newStatus = a.status === 'activo' ? 'inactivo' : 'activo';
      return { ...a, status: newStatus as 'activo' | 'inactivo' };
    });
    onAgentsChange(updated);

    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      const newStatus = agent.status === 'activo' ? 'inactivo' : 'activo';
      onAuditLog({
        id: `LOG-${Date.now().toString(36).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        module: 'AI Governance',
        action: `Agente "${agent.name}" ${newStatus === 'activo' ? 'activado' : 'desactivado'}`,
        result: 'Éxito — Estado actualizado',
        user: 'Usuario',
      });
    }
  }

  function handleSaveAgent(saved: AgentIA) {
    const exists = agents.find(a => a.id === saved.id);
    let updated: AgentIA[];
    if (exists) {
      updated = agents.map(a => a.id === saved.id ? saved : a);
    } else {
      updated = [...agents, saved];
    }
    onAgentsChange(updated);
    setShowForm(false);
    setEditingAgent(null);
    setDetailAgent(null);

    onAuditLog({
      id: `LOG-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      module: 'AI Governance',
      action: exists ? `Agente "${saved.name}" editado` : `Agente "${saved.name}" creado`,
      result: 'Éxito — Agente guardado',
      user: 'Usuario',
    });
  }

  // ── Detail / Edit modal ──
  if (detailAgent) {
    const freshAgent = agents.find(a => a.id === detailAgent.id) || detailAgent;
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setDetailAgent(null)}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          ← Volver al listado
        </button>

        <AgentForm
          agent={freshAgent}
          onSave={handleSaveAgent}
          onCancel={() => setDetailAgent(null)}
        />

        {/* Execution history */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">
              Historial de Ejecuciones (últimas 10)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                  <th className="text-center py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Resultado</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {freshAgent.executionHistory.slice(0, 10).map((exec, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 px-4 text-gray-500 text-xs font-mono">
                      {new Date(exec.timestamp).toLocaleString('es-MX')}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                          exec.result === 'éxito'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {exec.result}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-gray-700 text-xs">{exec.detail}</td>
                  </tr>
                ))}
                {freshAgent.executionHistory.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-gray-400 text-sm">Sin ejecuciones registradas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── Create / Edit form ──
  if (showForm || editingAgent) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => { setShowForm(false); setEditingAgent(null); }}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          ← Volver al listado
        </button>
        <AgentForm
          agent={editingAgent}
          onSave={handleSaveAgent}
          onCancel={() => { setShowForm(false); setEditingAgent(null); }}
        />
      </div>
    );
  }

  // ── Main listing ──
  return (
    <div className="space-y-4">
      {/* Counters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700 font-medium">
            {activeCount} agentes activos · {inactiveCount} inactivos
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gray-700 hover:bg-gray-800 transition-colors"
        >
          Crear Agente
        </button>
      </div>

      {/* Module chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(moduleCounts).map(([mod, counts]) => (
          <span
            key={mod}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
          >
            {mod}
            <span className="text-green-600 font-bold">{counts.activo}</span>
            {counts.inactivo > 0 && <span className="text-gray-400">/ {counts.inactivo}</span>}
          </span>
        ))}
      </div>

      {/* Agent list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Módulo Destino</th>
                <th className="text-center py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="text-center py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Activar/Desactivar</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(agent => (
                <tr
                  key={agent.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setDetailAgent(agent)}
                >
                  <td className="py-2.5 px-4 font-medium text-gray-800">{agent.name}</td>
                  <td className="py-2.5 px-4 text-gray-600 text-xs">{agent.targetModule}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                        agent.status === 'activo'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {agent.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => toggleAgentStatus(agent.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        agent.status === 'activo' ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      aria-label={`${agent.status === 'activo' ? 'Desactivar' : 'Activar'} ${agent.name}`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          agent.status === 'activo' ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
