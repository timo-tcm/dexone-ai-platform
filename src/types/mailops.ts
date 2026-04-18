// =============================================================================
// DEXONE — types/mailops.ts
// Tipos TypeScript mapeados contra mail.dexone_analisis
// =============================================================================

// ─── Entidad detectada en el correo ──────────────────────────────────────────
export interface DetectedEntity {
  label: string;   // 'DO' | 'MBL' | 'Cliente' | 'Buque' | 'Contenedores' | etc.
  value: string;
}

// ─── Agente del pipeline ──────────────────────────────────────────────────────
export interface AgentStatus {
  name:   string;
  code:   string;   // 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6'
  color:  string;
  status: 'completed' | 'pending' | 'skip' | 'error' | 'waiting';
  label?: string;   // Texto descriptivo del resultado
}

// ─── Tipo principal — Email ───────────────────────────────────────────────────
// Mapeo directo contra los campos de mail.dexone_analisis + mail.gmail_messages
export interface Email {
  // Identidad
  id:               string;   // UUID de mail.dexone_analisis.id
  gmail_message_id: string;   // gmail_message_id de mail.gmail_messages

  // ── Columnas de la tabla central ─────────────────────────────────────────
  opType:       'OCEAN' | 'RAIL' | 'OTR' | 'INT' | string;   // tipo_operacion
  sender:       string;   // original_from_empresa || from_email
  senderEmail:  string;   // original_from_email || from_email
  description:  string;   // subcategoria_correo
  status:       'Clasificado' | 'Pendiente' | 'Hold activo' | 'Nuevo patrón' | 'Procesado' | string;
  type:         string;   // Tipo corto: 'D.O.' | 'Hold' | 'Cita' | 'POD' | 'ETA' etc.
  priority:     'crítica' | 'alta' | 'media' | 'baja';        // prioridad (mapeada)
  subject:      string;   // subject del correo
  entity:       string;   // cliente || do_numero || mbl_numero
  tags:         string[]; // [tipo_operacion, 'P33', 'HOLD', 'FWD', 'NUEVO']
  timestamp:    string;   // Hora formateada: '14:32' o 'Abr 16'
  timestamp_iso: string;  // ISO completo para sorting
  classified:   boolean;  // !es_patron_nuevo
  hasAttachments: boolean;

  // ── Panel derecho — Análisis IA ───────────────────────────────────────────
  aiAnalysis:       string;   // clasificacion_json.razon_clasificacion
  aiConfianza:      number;   // confianza * 100 → 95
  confirmedBy:      string | null;  // area_responsable
  detectedEntities: DetectedEntity[];

  // ── Patrón ────────────────────────────────────────────────────────────────
  patron_id:          number | null;
  patron_nombre:      string;         // subcategoria_correo
  patron_descripcion?: string;        // email_patterns.descripcion_patron
  es_patron_nuevo:    boolean;
  hay_holds:          boolean;
  puede_pickup:       boolean;

  // ── Operativo ─────────────────────────────────────────────────────────────
  accion_principal:   string;
  accion_secundaria:  string;
  regla_escalamiento: string;
  requiere_humano:    boolean;
  tiempo_objetivo:    number | null;  // minutos

  // ── Reenvío ───────────────────────────────────────────────────────────────
  es_reenvio:            boolean;
  original_from_email?:  string | null;
  original_from_nombre?: string | null;
  original_from_empresa?: string | null;

  // ── Pipeline status ───────────────────────────────────────────────────────
  pipeline_status:  string;   // 'A2_COMPLETED' | 'COMPLETED' | 'ERROR'
  agente_3_status:  string;   // 'SKIP' | 'PENDING' | 'COMPLETED'
  agente_4_status:  string;

  // ── Trusted sender ────────────────────────────────────────────────────────
  trusted_empresa?:      string | null;
  patrones_frecuentes?:  Record<string, number> | null;

  // ── Meta ──────────────────────────────────────────────────────────────────
  costo_usd:    number;
  model_name:   string;
  duracion_ms:  number;
  created_at:   string;
  updated_at:   string;
}

// ─── Estadísticas del dashboard ──────────────────────────────────────────────
export interface MailOpsMetrics {
  totalInbox:              number;
  criticos:                number;
  holdsActivos:            number;
  deliveryOrders:          number;
  aprobacionesPendientes:  number;
  autoProcesados:          number;
  confianzaPromedio:       number;
  patronesNuevos:          number;
  reenvios:                number;
  costoTotalUsd:           number;
  ultimas24h:              number;
}

export interface TopPatron {
  id:     number;
  tipo:   string;
  nombre: string;
  total:  number;
}

export interface MailOpsStats {
  ok:          boolean;
  metrics:     MailOpsMetrics;
  topPatrones: TopPatron[];
}

export interface MailOpsResponse {
  ok:     boolean;
  total:  number;
  emails: Email[];
}

// ─── Filtros disponibles para la API ─────────────────────────────────────────
export interface MailOpsFilters {
  tipo?:            'OCEAN' | 'RAIL' | 'OTR' | 'INTERNOS';
  patron?:          number;
  prioridad?:       'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';
  es_patron_nuevo?: boolean;
  holds?:           boolean;
  requiere_humano?: boolean;
  limit?:           number;
}

// ─── Cuentas Gmail para el sidebar ───────────────────────────────────────────
export interface MailAccount {
  email: string;
  count: number;
}

// ─── Carpetas para el sidebar ─────────────────────────────────────────────────
export interface MailFolder {
  name:  string;
  count: number;
}

// ─── Vistas IA para el sidebar ───────────────────────────────────────────────
export interface MailView {
  name:  string;
  count: number;
}
