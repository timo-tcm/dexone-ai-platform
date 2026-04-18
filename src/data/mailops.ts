// =============================================================================
// DEXONE — data/mailops.ts
// Reemplaza los datos mock por llamadas reales a dexoneMailOps CF
// =============================================================================

import type {
  Email, MailOpsStats, MailOpsFilters,
  MailAccount, MailFolder, MailView
} from '@/types/mailops';

// ─── URL base de la Cloud Function ───────────────────────────────────────────
const CF_BASE = process.env.NEXT_PUBLIC_DEXONE_CF_URL
  || 'https://module-mail-ops-985946114156.us-central1.run.app';

const MAILOPS_URL = `${CF_BASE.replace(/\/$/, '')}/dexoneMailOps`;

// =============================================================================
// API CLIENT
// =============================================================================

async function fetchMailOps<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path.startsWith('http') ? path : `${MAILOPS_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }

  const res = await fetch(url.toString(), {
    method:  'GET',
    headers: { 'Content-Type': 'application/json' },
    cache:   'no-store',   // Siempre datos frescos
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// =============================================================================
// FUNCIONES PRINCIPALES
// =============================================================================

// Obtener lista de correos con filtros opcionales
export async function getEmails(filters?: MailOpsFilters): Promise<Email[]> {
  const params: Record<string, string> = {};
  if (filters?.tipo)            params.tipo            = filters.tipo;
  if (filters?.patron)          params.patron          = String(filters.patron);
  if (filters?.prioridad)       params.prioridad       = filters.prioridad;
  if (filters?.es_patron_nuevo) params.es_patron_nuevo = 'true';
  if (filters?.holds)           params.holds           = 'true';
  if (filters?.requiere_humano) params.requiere_humano = 'true';
  if (filters?.limit)           params.limit           = String(filters.limit);

  const data = await fetchMailOps<{ ok: boolean; total: number; emails: Email[] }>(
    '', params
  );
  return data.emails || [];
}

// Obtener estadísticas del dashboard
export async function getStats(): Promise<MailOpsStats> {
  return fetchMailOps<MailOpsStats>('/stats');
}

// Obtener detalle de un correo específico
export async function getEmailById(id: string): Promise<Email | null> {
  try {
    const data = await fetchMailOps<{ ok: boolean; email: Email }>('', { id });
    return data.email || null;
  } catch {
    return null;
  }
}

// =============================================================================
// DATOS ESTÁTICOS DEL SIDEBAR
// (Estos sí pueden ser estáticos — o también podrían venir de la API)
// =============================================================================

export const mailAccounts: MailAccount[] = [
  { email: 'dispatch@bali.mx',  count: 17 },
  { email: 'billing@bali.mx',   count:  5 },
  { email: 'docs@bali.mx',      count:  8 },
  { email: 'support@bali.mx',   count:  3 },
  { email: 'alerts@bali.mx',    count:  7 },
];

// Las carpetas se calcularán dinámicamente en el componente
export function buildFolders(emails: Email[]): MailFolder[] {
  return [
    { name: 'Entrada',    count: emails.length },
    { name: 'Procesados', count: emails.filter(e => e.pipeline_status === 'COMPLETED' || e.status === 'Procesado').length },
    { name: 'Pendientes', count: emails.filter(e => e.requiere_humano).length },
    { name: 'Alertas',    count: emails.filter(e => e.hay_holds).length },
    { name: 'Nuevos pat.', count: emails.filter(e => e.es_patron_nuevo).length },
  ];
}

// Las vistas IA se calculan dinámicamente
export function buildViews(emails: Email[]): MailView[] {
  return [
    { name: 'Holds activos',   count: emails.filter(e => e.hay_holds).length },
    { name: 'OCEAN',           count: emails.filter(e => e.opType === 'OCEAN').length },
    { name: 'RAIL',            count: emails.filter(e => e.opType === 'RAIL').length },
    { name: 'OTR',             count: emails.filter(e => e.opType === 'OTR').length },
    { name: 'Aprobación',      count: emails.filter(e => e.requiere_humano).length },
    { name: 'Reenvíos',        count: emails.filter(e => e.es_reenvio).length },
  ];
}

// Pipeline de agentes — estático con estado visual
export const agentPipeline = [
  { name: 'Lector',       code: 'A1', color: '#059669', status: 'live'   as const },
  { name: 'Clasificador', code: 'A2', color: '#4F46E5', status: 'live'   as const },
  { name: 'Extractor',    code: 'A3', color: '#0891B2', status: 'live'   as const },
  { name: 'Relación',     code: 'A4', color: '#7C3AED', status: 'idle'   as const },
  { name: 'Acción',       code: 'A5', color: '#DC2626', status: 'idle'   as const },
  { name: 'Ejecutor',     code: 'A6', color: '#6B7280', status: 'idle'   as const },
];

// Colores por tipo de operación
export const opColors: Record<string, string> = {
  OCEAN: '#059669',
  RAIL:  '#DC2626',
  OTR:   '#7C3AED',
  INT:   '#0891B2',
  GT:    '#0891B2',
  DET:   '#6B7280',
};

// =============================================================================
// REACT HOOK — useMailOps
// Para usar en el componente con estado, loading y refresh
// =============================================================================

// Nota: Este hook requiere React. Copiar en un archivo separado
// src/hooks/useMailOps.ts si el proyecto usa hooks personalizados.

/*
import { useState, useEffect, useCallback } from 'react';

export function useMailOps(filters?: MailOpsFilters) {
  const [emails,  setEmails]  = useState<Email[]>([]);
  const [stats,   setStats]   = useState<MailOpsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [emailData, statsData] = await Promise.all([
        getEmails(filters),
        getStats(),
      ]);
      setEmails(emailData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  return { emails, stats, loading, error, refresh: load };
}
*/
