'use client';

import { useState } from 'react';
import { Mail, Inbox, Clock, AlertTriangle, FolderOpen, Eye, FileText, Send, Archive, ChevronRight } from 'lucide-react';
import ModuleLayout from '@/components/shared/ModuleLayout';
import { emails as initialEmails, mailAccounts, mailFolders, mailViews, agentPipeline } from '@/data/mailops';
import type { Email } from '@/types/index';

interface MailOpsModuleProps { onBack: () => void; }

const ACCENT = '#4F46E5';

const opColors: Record<string, string> = {
  OCEN: '#059669', Rail: '#DC2626', GT: '#0891B2', OTR: '#7C3AED', DET: '#6B7280',
};

const priorityBadge: Record<string, string> = {
  crítica: 'bg-red-100 text-red-700',
  alta: 'bg-orange-100 text-orange-700',
  media: 'bg-yellow-100 text-yellow-700',
  baja: 'bg-gray-100 text-gray-500',
};

const filterTabs = ['Alta Prio.', 'Aprobación', 'Carriers', 'Aduana', 'Pendiente'];

export default function MailOpsModule({ onBack }: MailOpsModuleProps) {
  const [emailList, setEmailList] = useState<Email[]>(initialEmails);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const selected = emailList.find((e) => e.id === selectedId) ?? null;
  const total = emailList.length;
  const classified = emailList.filter((e) => e.classified).length;
  const pending = emailList.filter((e) => !e.classified).length;

  const applyAction = (emailId: string, newStatus: string) => {
    setEmailList((prev) => prev.map((e) => (e.id === emailId ? { ...e, status: newStatus } : e)));
  };

  return (
    <ModuleLayout moduleId="mailops" moduleName="AI Mail Ops" moduleCode="MB" accentColor={ACCENT} onBack={onBack}>
      {/* Top bar: Smart Inbox + metrics + filters */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800">Smart Inbox</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">BETA</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span><span className="text-lg font-bold text-gray-800">37</span> MENSAJES</span>
          <span><span className="text-lg font-bold text-gray-800">5</span> APROBACIONES</span>
          <span><span className="text-lg font-bold text-gray-800">14</span> AUTO-PROC.</span>
        </div>
        <div className="flex-1" />
        <div className="flex gap-1">
          {filterTabs.map((f) => (
            <button key={f} type="button" onClick={() => setActiveFilter(activeFilter === f ? null : f)}
              className={`px-2.5 py-1 rounded text-[10px] font-medium border transition-colors ${activeFilter === f ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              {f}
            </button>
          ))}
        </div>
        <button type="button" className="px-3 py-1 rounded text-[10px] font-medium border border-gray-200 text-gray-500 hover:bg-gray-50">Filtrar</button>
        <button type="button" className="px-3 py-1 rounded text-[10px] font-medium border border-gray-200 text-gray-500 hover:bg-gray-50">Exportar</button>
      </div>

      {/* Main 3-column layout */}
      <div className="flex gap-3 h-[calc(100vh-210px)]">

        {/* ── LEFT SIDEBAR ── */}
        <div className="w-48 flex-shrink-0 overflow-y-auto space-y-4">
          {/* Op type icons */}
          <div className="flex gap-2 flex-wrap">
            {Object.entries(opColors).map(([code, color]) => (
              <div key={code} className="flex flex-col items-center gap-0.5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: color }}>{code}</div>
                <span className="text-[9px] text-gray-400">{code}</span>
              </div>
            ))}
          </div>

          {/* Cuentas */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Cuentas</p>
            {mailAccounts.map((a) => (
              <div key={a.email} className="flex items-center justify-between py-1">
                <span className="text-[11px] text-gray-600 truncate">{a.email}</span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 rounded px-1.5">{a.count}</span>
              </div>
            ))}
          </div>

          {/* Carpetas */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Carpetas</p>
            {mailFolders.map((f) => (
              <div key={f.name} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-1.5">
                  {f.name === 'Entrada' && <Inbox size={11} className="text-gray-400" />}
                  {f.name === 'Procesados' && <FileText size={11} className="text-gray-400" />}
                  {f.name === 'Pendientes' && <Clock size={11} className="text-gray-400" />}
                  {f.name === 'Alertas' && <AlertTriangle size={11} className="text-gray-400" />}
                  <span className="text-[11px] text-gray-700">{f.name}</span>
                </div>
                <span className="text-[10px] font-semibold text-gray-500">{f.count}</span>
              </div>
            ))}
          </div>

          {/* Vistas IA */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Vistas IA</p>
            {mailViews.map((v) => (
              <div key={v.name} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-1.5">
                  <Eye size={11} className="text-gray-400" />
                  <span className="text-[11px] text-gray-700">{v.name}</span>
                </div>
                <span className="text-[10px] font-semibold text-gray-500">{v.count}</span>
              </div>
            ))}
          </div>

          {/* Pipeline Agentes IA */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Pipeline Agentes IA</p>
              <span className="text-[9px] text-green-600 font-semibold">● Live</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {agentPipeline.map((a) => (
                <div key={a.name} className="flex flex-col items-center gap-0.5">
                  <div className="w-10 h-7 rounded flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: a.color }}>
                    {a.name.substring(0, 5)}
                  </div>
                  <span className="text-[8px] text-gray-400">{a.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CENTER: Email table ── */}
        <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col min-w-0">
          {/* Table header */}
          <div className="grid grid-cols-[32px_60px_1fr_80px_80px_1.5fr_80px_60px_80px_40px] gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50 text-[10px] font-semibold text-gray-400 uppercase tracking-wide items-center">
            <span></span><span>Op</span><span>Remitente / Código</span><span>Estado</span><span>Tipo</span><span>Asunto / Descripción</span><span>Entidad</span><span>Tags</span><span>Hora</span><span>IA</span>
          </div>

          {/* Email rows */}
          <div className="flex-1 overflow-y-auto">
            {emailList.map((email) => {
              const isSelected = email.id === selectedId;
              return (
                <button key={email.id} type="button" onClick={() => setSelectedId(email.id)}
                  className={`w-full text-left grid grid-cols-[32px_60px_1fr_80px_80px_1.5fr_80px_60px_80px_40px] gap-1 px-3 py-2.5 border-b border-gray-100 items-center transition-colors ${isSelected ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : 'hover:bg-gray-50'}`}>
                  {/* Checkbox */}
                  <input type="checkbox" aria-label={`Seleccionar ${email.sender}`} className="w-3.5 h-3.5 rounded border-gray-300" onClick={(e) => e.stopPropagation()} />
                  {/* Op badge */}
                  <div className="w-8 h-6 rounded flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: opColors[email.opType] ?? '#6B7280' }}>{email.opType}</div>
                  {/* Sender */}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{email.sender}</p>
                    <p className="text-[10px] text-gray-400 truncate">{email.description}</p>
                  </div>
                  {/* Status */}
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full text-center ${email.status === 'Clasificado' ? 'bg-green-100 text-green-700' : email.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' : email.status === 'Procesado' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{email.status}</span>
                  {/* Type */}
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded text-center ${email.priority === 'crítica' ? 'bg-red-100 text-red-700' : email.priority === 'alta' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>{email.type}</span>
                  {/* Subject */}
                  <p className="text-[11px] text-gray-700 truncate">{email.subject}</p>
                  {/* Entity */}
                  <span className="text-[10px] text-gray-500 truncate">{email.entity}</span>
                  {/* Tags */}
                  <div className="flex gap-0.5">
                    {email.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[8px] font-bold px-1 py-0.5 rounded bg-gray-100 text-gray-500">{t}</span>
                    ))}
                  </div>
                  {/* Time */}
                  <span className="text-[10px] text-gray-400">{email.timestamp.split(', ')[1] || email.timestamp}</span>
                  {/* IA indicator */}
                  <div className="flex gap-0.5 justify-center">
                    <span className="w-2 h-2 rounded-full bg-green-400" title="IA procesado" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Detail panel ── */}
        <div className="w-72 flex-shrink-0 overflow-y-auto">
          {selected ? (
            <div className="bg-white rounded-xl border border-gray-100 h-full flex flex-col overflow-hidden">
              {/* Op tabs */}
              <div className="flex gap-1 px-3 pt-3 pb-2">
                {selected.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700">{t}</span>
                ))}
              </div>

              {/* Title */}
              <div className="px-3 pb-2 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-800 leading-snug">{selected.subject}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{selected.description}</p>
              </div>

              {/* AI Analysis */}
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Análisis IA</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                  <p className="text-[11px] text-green-800 leading-relaxed">{selected.aiAnalysis}</p>
                </div>
              </div>

              {/* Confirmed by */}
              {selected.confirmedBy && (
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Confirmado por</p>
                  <p className="text-xs text-gray-700">{selected.confirmedBy}</p>
                </div>
              )}

              {/* Detected entities */}
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Entidades Detectadas</p>
                <div className="space-y-1">
                  {selected.detectedEntities.map((ent, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-gray-500">{ent.label}</span>
                      <span className="font-mono text-gray-700">{ent.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pipeline de agentes */}
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Pipeline de Agentes</p>
                <div className="flex flex-col gap-1">
                  {agentPipeline.map((a) => (
                    <div key={a.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                        <span className="text-[11px] text-gray-700">{a.name}</span>
                      </div>
                      <span className={`text-[9px] font-semibold ${a.status === 'live' ? 'text-green-600' : 'text-gray-400'}`}>
                        {a.status === 'live' ? '✓ Live' : '○ Idle'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="px-3 py-2 mt-auto">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Acciones</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => applyAction(selected.id, 'POD Verificado')}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-[10px] font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors">
                    <FileText size={11} /> Ver POD
                  </button>
                  <button type="button" onClick={() => applyAction(selected.id, 'Reporte generado')}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-[10px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                    <Send size={11} /> Generar rep.
                  </button>
                  <button type="button" onClick={() => applyAction(selected.id, 'Notificado')}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-green-200 bg-green-50 text-[10px] font-semibold text-green-700 hover:bg-green-100 transition-colors">
                    <Mail size={11} /> Notificar
                  </button>
                  <button type="button" onClick={() => applyAction(selected.id, 'Archivado')}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-[10px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                    <Archive size={11} /> Archivar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 h-full flex items-center justify-center">
              <p className="text-xs text-gray-400 text-center px-4">Selecciona un correo para ver el detalle</p>
            </div>
          )}
        </div>
      </div>
    </ModuleLayout>
  );
}