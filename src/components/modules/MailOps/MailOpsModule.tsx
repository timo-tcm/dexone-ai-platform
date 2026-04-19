'use client';

// =============================================================================
// DEXONE — MailOpsModule.tsx  v2
// Componente Smart Inbox conectado a datos reales de mail.dexone_analisis
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import {
  Mail, Inbox, Clock, AlertTriangle, FileText,
  Send, Archive, Eye, RefreshCw, Wifi, WifiOff,
} from 'lucide-react';
import ModuleLayout from '@/components/shared/ModuleLayout';
import {
  getEmails, getStats, buildFolders, buildViews,
  agentPipeline, mailAccounts, opColors,
} from '@/data/mailops';
import type { Email, MailOpsStats, MailOpsFilters } from '@/types/mailops';

interface MailOpsModuleProps { onBack: () => void; }

const ACCENT = '#4F46E5';

const priorityBadgeClass: Record<string, string> = {
  crítica: 'bg-red-100 text-red-700',
  alta:    'bg-orange-100 text-orange-700',
  media:   'bg-yellow-100 text-yellow-700',
  baja:    'bg-gray-100 text-gray-500',
};

const statusBadgeClass = (status: string) => {
  if (status === 'Clasificado')   return 'bg-green-100 text-green-700';
  if (status === 'Pendiente')     return 'bg-yellow-100 text-yellow-700';
  if (status === 'Hold activo')   return 'bg-red-100 text-red-700';
  if (status === 'Nuevo patrón')  return 'bg-purple-100 text-purple-700';
  if (status === 'Procesado')     return 'bg-blue-100 text-blue-700';
  return 'bg-gray-100 text-gray-500';
};

// Tabs de filtro rápido
const filterTabs = [
  { label: 'Todos',      filter: {} },
  { label: 'Críticos',   filter: { prioridad: 'CRITICA' as const } },
  { label: 'Holds',      filter: { holds: true } },
  { label: 'OCEAN',      filter: { tipo: 'OCEAN' as const } },
  { label: 'Aprobación', filter: { requiere_humano: true } },
  { label: 'Nuevos',     filter: { es_patron_nuevo: true } },
];

export default function MailOpsModule({ onBack }: MailOpsModuleProps) {
  const [emails,      setEmails]     = useState<Email[]>([]);
  const [stats,       setStats]      = useState<MailOpsStats | null>(null);
  const [selectedId,  setSelectedId] = useState<string | null>(null);
  const [activeTab,   setActiveTab]  = useState(0);
  const [loading,     setLoading]    = useState(true);
  const [error,       setError]      = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const selected = emails.find(e => e.id === selectedId) ?? null;
  const folders  = buildFolders(emails);
  const views    = buildViews(emails);

  // ── Carga de datos ─────────────────────────────────────────────────────────
  const load = useCallback(async (filter?: MailOpsFilters) => {
    setLoading(true);
    setError(null);
    try {
      const [emailData, statsData] = await Promise.all([
        getEmails(filter || filterTabs[activeTab].filter),
        getStats(),
      ]);
      setEmails(emailData);
      setStats(statsData);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    load(filterTabs[activeTab].filter);
  }, [activeTab]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => load(filterTabs[activeTab].filter), 30_000);
    return () => clearInterval(interval);
  }, [activeTab, load]);

  // ── Acción sobre un correo ─────────────────────────────────────────────────
  const applyAction = (emailId: string, action: string) => {
    // Optimistic update en el estado local
    setEmails(prev => prev.map(e =>
      e.id === emailId ? { ...e, status: action } : e
    ));
    // TODO: llamar al Agente 5 cuando esté disponible
  };

  return (
    <ModuleLayout moduleId="mailops" moduleName="AI Mail Ops" moduleCode="MB" accentColor={ACCENT} onBack={onBack}>

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800">Smart Inbox</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">BETA</span>
          {/* Indicador de conexión */}
          {error
            ? <span title={error}><WifiOff size={12} className="text-red-400" /></span>
            : <Wifi    size={12} className="text-green-400" />
          }
        </div>

        {/* Métricas en tiempo real */}
        {stats && (
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>
              <span className="text-lg font-bold text-gray-800">{stats.metrics.totalInbox}</span>
              <span className="ml-1">TOTAL</span>
            </span>
            <span>
              <span className="text-lg font-bold text-red-600">{stats.metrics.aprobacionesPendientes}</span>
              <span className="ml-1">APROBACIONES</span>
            </span>
            <span>
              <span className="text-lg font-bold text-orange-500">{stats.metrics.holdsActivos}</span>
              <span className="ml-1">HOLDS</span>
            </span>
            <span>
              <span className="text-lg font-bold text-blue-600">{stats.metrics.deliveryOrders}</span>
              <span className="ml-1">D.ORDERS</span>
            </span>
            <span>
              <span className="text-lg font-bold text-green-600">{stats.metrics.autoProcesados}</span>
              <span className="ml-1">AUTO-PROC.</span>
            </span>
            <span>
              <span className="text-lg font-bold text-gray-700">{stats.metrics.confianzaPromedio}%</span>
              <span className="ml-1">CONF. IA</span>
            </span>
          </div>
        )}

        <div className="flex-1" />

        {/* Filtros rápidos */}
        <div className="flex gap-1">
          {filterTabs.map((tab, i) => (
            <button key={tab.label} type="button"
              onClick={() => setActiveTab(i)}
              className={`px-2.5 py-1 rounded text-[10px] font-medium border transition-colors ${
                activeTab === i
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button type="button"
          onClick={() => load(filterTabs[activeTab].filter)}
          disabled={loading}
          className="p-1.5 rounded border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          title={lastRefresh ? `Actualizado: ${lastRefresh.toLocaleTimeString('es-MX')}` : 'Actualizar'}>
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── Error banner ──────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          Error al cargar datos: {error}
        </div>
      )}

      {/* ── Layout 3 columnas ─────────────────────────────────────────────── */}
      <div className="flex gap-3 h-[calc(100vh-210px)]">

        {/* ── SIDEBAR IZQUIERDO ─────────────────────────────────────────── */}
        <div className="w-48 flex-shrink-0 overflow-y-auto space-y-4">

          {/* Tipos de operación */}
          <div className="flex gap-2 flex-wrap">
            {Object.entries(opColors).map(([code, color]) => (
              <button key={code} type="button"
                onClick={() => {
                  const tipoMap: Record<string, string> = {
                    OCEAN: 'OCEAN', RAIL: 'RAIL', OTR: 'OTR', INT: 'INTERNOS',
                  };
                  if (tipoMap[code]) {
                    setActiveTab(-1);
                    load({ tipo: tipoMap[code] as any });
                  }
                }}
                className="flex flex-col items-center gap-0.5 hover:opacity-80 transition-opacity">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[9px] font-bold"
                  style={{ backgroundColor: color }}>
                  {code}
                </div>
                <span className="text-[9px] text-gray-400">{code}</span>
              </button>
            ))}
          </div>

          {/* Cuentas Gmail */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Cuentas Gmail</p>
            {mailAccounts.map(a => (
              <div key={a.email} className="flex items-center justify-between py-1">
                <span className="text-[11px] text-gray-600 truncate">{a.email}</span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 rounded px-1.5">{a.count}</span>
              </div>
            ))}
          </div>

          {/* Carpetas (dinámicas) */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Bandeja</p>
            {folders.map(f => (
              <div key={f.name} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-1.5">
                  {f.name === 'Entrada'    && <Inbox         size={11} className="text-gray-400" />}
                  {f.name === 'Procesados' && <FileText       size={11} className="text-gray-400" />}
                  {f.name === 'Pendientes' && <Clock          size={11} className="text-gray-400" />}
                  {f.name === 'Alertas'    && <AlertTriangle  size={11} className="text-red-400"  />}
                  {f.name === 'Nuevos pat.'&& <Eye            size={11} className="text-purple-400" />}
                  <span className="text-[11px] text-gray-700">{f.name}</span>
                </div>
                <span className="text-[10px] font-semibold text-gray-500">{f.count}</span>
              </div>
            ))}
          </div>

          {/* Vistas IA (dinámicas) */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Vistas IA</p>
            {views.filter(v => v.count > 0).map(v => (
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
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Pipeline IA</p>
              <span className="text-[9px] text-green-600 font-semibold">● Live</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {agentPipeline.map(a => (
                <div key={a.name} className="flex flex-col items-center gap-0.5">
                  <div className="w-10 h-7 rounded flex items-center justify-center text-white text-[8px] font-bold"
                    style={{ backgroundColor: a.color }}>
                    {a.code}
                  </div>
                  <span className="text-[8px] text-gray-400">{a.name}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${a.status === 'live' ? 'bg-green-400' : 'bg-gray-300'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABLA CENTRAL ─────────────────────────────────────────────── */}
        <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col min-w-0">

          {/* Header de la tabla */}
          <div className="grid grid-cols-[32px_72px_56px_1fr_88px_72px_1.5fr_88px_64px_72px_36px] gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50 text-[10px] font-semibold text-gray-400 uppercase tracking-wide items-center">
            <span></span>
            <span>Recibido</span>
            <span>Op</span>
            <span>Remitente</span>
            <span>Estado</span>
            <span>Tipo</span>
            <span>Asunto</span>
            <span>Entidad</span>
            <span>Tags</span>
            <span>Hora</span>
            <span>IA</span>
          </div>

          {/* Filas */}
          <div className="flex-1 overflow-y-auto">
            {loading && emails.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw size={16} className="animate-spin text-gray-300 mr-2" />
                <span className="text-xs text-gray-400">Cargando correos...</span>
              </div>
            ) : emails.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <span className="text-xs text-gray-400">No hay correos con estos filtros</span>
              </div>
            ) : (
              emails.map(email => {
                const isSelected = email.id === selectedId;
                return (
                  <button key={email.id} type="button"
                    onClick={() => setSelectedId(email.id)}
                    className={`w-full text-left grid grid-cols-[32px_72px_56px_1fr_88px_72px_1.5fr_88px_64px_72px_36px] gap-1 px-3 py-2.5 border-b border-gray-100 items-center transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 border-l-2 border-l-indigo-500'
                        : 'hover:bg-gray-50'
                    }`}>

                    {/* Checkbox */}
                    <input type="checkbox" aria-label={`Seleccionar ${email.sender}`}
                      className="w-3.5 h-3.5 rounded border-gray-300"
                      onClick={e => e.stopPropagation()} />

                    {/* Recibido */}
                    <span className="text-[10px] text-gray-400">{email.timestamp_iso ? new Date(email.timestamp_iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) + ' ' + new Date(email.timestamp_iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}</span>

                    {/* Op badge */}
                    <div className="w-8 h-6 rounded flex items-center justify-center text-white text-[8px] font-bold"
                      style={{ backgroundColor: (opColors as any)[email.opType] ?? '#6B7280' }}>
                      {email.opType}
                    </div>

                    {/* Remitente */}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {email.sender}
                        {email.es_reenvio && (
                          <span className="ml-1 text-[9px] text-gray-400 font-normal">Fwd</span>
                        )}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">{email.description}</p>
                    </div>

                    {/* Estado */}
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full text-center ${statusBadgeClass(email.status)}`}>
                      {email.status}
                    </span>

                    {/* Tipo */}
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded text-center ${priorityBadgeClass[email.priority] || 'bg-gray-100 text-gray-600'}`}>
                      {email.type}
                    </span>

                    {/* Asunto */}
                    <p className="text-[11px] text-gray-700 truncate">{email.subject}</p>

                    {/* Entidad */}
                    <span className="text-[10px] text-gray-500 truncate">{email.entity}</span>

                    {/* Tags */}
                    <div className="flex gap-0.5 flex-wrap">
                      {email.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[8px] font-bold px-1 py-0.5 rounded bg-gray-100 text-gray-500">{t}</span>
                      ))}
                    </div>

                    {/* Hora */}
                    <span className="text-[10px] text-gray-400">{email.timestamp}</span>

                    {/* IA confidence */}
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`w-2 h-2 rounded-full ${
                        email.aiConfianza >= 90 ? 'bg-green-400' :
                        email.aiConfianza >= 70 ? 'bg-yellow-400' : 'bg-red-400'
                      }`} title={`Confianza: ${email.aiConfianza}%`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── PANEL DERECHO ─────────────────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 overflow-y-auto max-h-[calc(100vh-210px)]">
          {selected ? (
            <div className="bg-white rounded-xl border border-gray-100 flex flex-col">

              {/* Tags del correo */}
              <div className="flex gap-1 px-3 pt-3 pb-2 flex-wrap">
                {selected.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700">{t}</span>
                ))}
                {selected.hay_holds && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700">HOLD</span>
                )}
              </div>

              {/* Título */}
              <div className="px-3 pb-2 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-800 leading-snug">{selected.subject}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {selected.original_from_nombre || selected.sender} · {selected.timestamp}
                </p>
                {selected.es_reenvio && (
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    Reenviado por: {selected.senderEmail}
                  </p>
                )}
              </div>

              {/* Análisis IA */}
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Resumen IA</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    selected.aiConfianza >= 90 ? 'bg-green-100 text-green-700' :
                    selected.aiConfianza >= 70 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selected.aiConfianza}% · {
                      selected.aiConfianza >= 90 ? 'Alta confianza' :
                      selected.aiConfianza >= 70 ? 'Confianza media' : 'Revisar'
                    }
                  </span>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                  <p className="text-[11px] text-green-800 leading-relaxed">
                    <span className="font-semibold text-indigo-600 text-[10px]">DEXONE AI · </span>
                    {selected.aiAnalysis}
                  </p>
                </div>
              </div>

              {/* Entidades detectadas */}
              {selected.detectedEntities.length > 0 && (
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Entidades Detectadas</p>
                  <div className="space-y-1">
                    {selected.detectedEntities.map((ent, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-gray-500">{ent.label}</span>
                        <span className="font-mono text-gray-700 text-[11px]">{ent.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones operativas */}
              {(selected.accion_principal || selected.accion_secundaria) && (
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Acciones IA</p>
                  {selected.accion_principal && (
                    <p className="text-[11px] text-gray-700 mb-0.5">
                      <span className="font-semibold">1. </span>{selected.accion_principal}
                    </p>
                  )}
                  {selected.accion_secundaria && (
                    <p className="text-[11px] text-gray-500">
                      <span className="font-semibold">2. </span>{selected.accion_secundaria}
                    </p>
                  )}
                </div>
              )}

              {/* Pipeline */}
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Pipeline de Agentes IA</p>
                <div className="flex flex-col gap-1">
                  {agentPipeline.map(a => {
                    const statusMap: Record<string, string> = {
                      A1: 'completed',
                      A2: 'completed',
                      A3: selected.agente_3_status === 'SKIP' ? 'skip' : selected.agente_3_status?.toLowerCase() || 'skip',
                      A4: selected.agente_4_status?.toLowerCase() || 'pending',
                      A5: 'idle',
                      A6: 'idle',
                    };
                    const st = statusMap[a.code] || 'idle';
                    return (
                      <div key={a.code} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                          <span className="text-[11px] text-gray-700">{a.name}</span>
                        </div>
                        <span className={`text-[9px] font-semibold ${
                          st === 'completed' ? 'text-green-600' :
                          st === 'skip'      ? 'text-gray-400'  :
                          st === 'pending'   ? 'text-yellow-500':
                          st === 'error'     ? 'text-red-500'   :
                          'text-gray-300'
                        }`}>
                          {st === 'completed' ? '✓ OK' :
                           st === 'skip'      ? '○ Skip' :
                           st === 'pending'   ? '⏳ Pendiente' :
                           st === 'error'     ? '✕ Error' :
                           '○ Idle'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Acciones manuales */}
              <div className="px-3 py-2">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Acciones</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button"
                    onClick={() => applyAction(selected.id, 'POD Verificado')}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-[10px] font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors">
                    <FileText size={11} /> Ver POD
                  </button>
                  <button type="button"
                    onClick={() => applyAction(selected.id, 'Reporte generado')}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-[10px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                    <Send size={11} /> Generar rep.
                  </button>
                  <button type="button"
                    onClick={() => applyAction(selected.id, 'Notificado')}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-green-200 bg-green-50 text-[10px] font-semibold text-green-700 hover:bg-green-100 transition-colors">
                    <Mail size={11} /> Notificar
                  </button>
                  <button type="button"
                    onClick={() => applyAction(selected.id, 'Archivado')}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-[10px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                    <Archive size={11} /> Archivar
                  </button>
                </div>

                {/* Info de costo */}
                {selected.costo_usd > 0 && (
                  <p className="text-[9px] text-gray-300 text-center mt-2">
                    IA: ${selected.costo_usd} · {selected.duracion_ms}ms · {selected.model_name?.split('-')[0]}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 h-full flex items-center justify-center">
              <p className="text-xs text-gray-400 text-center px-4">
                Selecciona un correo para ver el análisis IA
              </p>
            </div>
          )}
        </div>

      </div>
    </ModuleLayout>
  );
}
