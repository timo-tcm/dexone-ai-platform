// Interfaz base para todos los módulos
export interface ModuleProps {
  moduleId: string;
  status: ModuleStatus;
  onBack: () => void;
}

export type ModuleStatus = 'live' | 'offline' | 'warning';

export type PriorityLevel = 'crítica' | 'alta' | 'media' | 'baja';
export type UrgencyLevel = 'urgente' | 'próxima' | 'programada';
export type MoveType = 'Pickup' | 'Delivery' | 'Reposición';
export type ClientType = 'Premium' | 'Standard' | 'Gobierno';
export type DocType = 'B/L' | 'Pedimento' | 'Póliza' | 'Certificado Fitosanitario';
export type DocStatus = 'válido' | 'por vencer' | 'vencido' | 'incompleto';
export type PaymentStatus = 'pendiente' | 'procesado' | 'rechazado';
export type RiskLevel = 'alto' | 'medio' | 'bajo';
export type AgentStatus = 'activo' | 'inactivo';
export type ExecutionResult = 'éxito' | 'fallo';

export interface ModuleMetric {
  label: string;
  value: string | number;
  unit?: string;
}

export interface ModuleTag {
  label: string;
}

export interface DashboardModule {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  status: ModuleStatus;
  metrics: ModuleMetric[];
  tags: ModuleTag[];
  route: string;
}

export interface GlobalCounters {
  activeModules: number;
  activeAgents: number;
  pendingAlerts: number;
  apiStatus: string;
  apiLatency: string;
  lastSync: string;
}

// AI Mail Ops
export type MailOpType = 'OCEN' | 'Rail' | 'GT' | 'OTR' | 'DET';

export interface Email {
  id: string;
  sender: string;
  senderCode: string;
  opType: MailOpType;
  subject: string;
  description: string;
  priority: PriorityLevel;
  pipeline: string;
  status: string;
  type: string;
  entity: string;
  tags: string[];
  timestamp: string;
  preview: string;
  classified: boolean;
  aiAnalysis: string;
  detectedEntities: { label: string; value: string }[];
  confirmedBy: string;
}

export interface MailAccount {
  email: string;
  count: number;
}

export interface MailFolder {
  name: string;
  count: number;
}

export interface MailAgentPipeline {
  name: string;
  status: 'live' | 'idle';
  color: string;
}

// AI Dispatch
export interface DispatchOrder {
  id: string;
  destination: string;
  operator: string | null;
  status: string;
  currentTemp: number;
  tempThreshold: number;
  minutesWithoutAssignment: number;
  route: string;
  client: string;
}

export interface TrackingUnit {
  id: string;
  plate: string;
  operator: string;
  lat: number;
  lng: number;
  location: string;
  status: string;
}

// AI Billing
export interface Invoice {
  id: string;
  client: string;
  amount: number;
  status: string;
  satStatus: string;
  date: string;
}

export interface CarrierPayment {
  id: string;
  carrier: string;
  amount: number;
  status: PaymentStatus;
  date: string;
}

// AI Docs
export interface Document {
  id: string;
  type: DocType;
  name: string;
  status: DocStatus;
  expiryDate: string;
  doId: string | null;
  requiredFields: string[];
  presentFields: string[];
}

// AI Customer
export interface Ticket {
  id: string;
  clientType: ClientType;
  client: string;
  subject: string;
  slaHours: number;
  elapsedHours: number;
  status: string;
  createdAt: string;
}

// AI Analytics
export interface KPI {
  id: string;
  label: string;
  value: string | number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
}

export interface BarChartData {
  month: string;
  pickups: number;
  deliveries: number;
  reposiciones: number;
}

export interface Report {
  id: string;
  name: string;
  description: string;
  data: Record<string, unknown>[];
}

export interface AIInsight {
  id: string;
  type: 'observacion' | 'recomendacion' | 'alerta';
  text: string;
  module: string;
}

// AI Planning
export interface WorkOrder {
  id: string;
  description: string;
  urgency: UrgencyLevel;
  client: string;
}

export interface DriverMove {
  id: string;
  workOrderId: string;
  dayOfWeek: number; // 0=Lunes, 5=Sábado
  type: MoveType;
  timeWindow: string;
  location: string;
  client: string;
  assignedOperator: string | null;
  assignedUnit: string | null;
}

export interface Operator {
  id: string;
  name: string;
  availability: string;
  currentLocation: string;
}

export interface Unit {
  id: string;
  brand: string;
  year: number;
  capacity: string;
  equipment: string[];
}

// AI Governance
export interface ModuleGovernance {
  moduleId: string;
  moduleName: string;
  precision: number;
  slaCompliance: number;
  autonomyLevel: number;
  riskLevel: RiskLevel;
  dataQuality: number;
  status: ModuleStatus;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  module: string;
  action: string;
  result: string;
  user: string;
}

export interface EscalationItem {
  id: string;
  source: string;
  description: string;
  status: string;
  responsible: string;
  createdAt: string;
}

export interface BusinessRule {
  field: string;
  operator: string;
  value: string;
  action: string;
}

export interface ActivationCriteria {
  triggerEvent: string;
  sourceModule: string;
}

export interface Threshold {
  name: string;
  value: number;
  unit: string;
}

export interface AgentExecution {
  timestamp: string;
  result: ExecutionResult;
  detail: string;
}

export interface AgentIA {
  id: string;
  name: string;
  description: string;
  targetModule: string;
  status: AgentStatus;
  rules: BusinessRule[];
  activationCriteria: ActivationCriteria[];
  thresholds: Threshold[];
  executionHistory: AgentExecution[];
}
