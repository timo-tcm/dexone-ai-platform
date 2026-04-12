import type { KPI, BarChartData, Report, AIInsight } from '@/types/index';

export const kpis: KPI[] = [
  {
    id: 'kpi-01',
    label: 'DOs completadas (mes)',
    value: 312,
    unit: 'órdenes',
    trend: 'up',
    trendValue: '+8.4%',
  },
  {
    id: 'kpi-02',
    label: 'Tiempo promedio de entrega',
    value: 18.6,
    unit: 'horas',
    trend: 'down',
    trendValue: '-12.1%',
  },
  {
    id: 'kpi-03',
    label: 'Tasa de cumplimiento de temperatura',
    value: 96.3,
    unit: '%',
    trend: 'up',
    trendValue: '+2.7%',
  },
  {
    id: 'kpi-04',
    label: 'Facturas automatizadas',
    value: 89,
    unit: '%',
    trend: 'up',
    trendValue: '+5.2%',
  },
  {
    id: 'kpi-05',
    label: 'Satisfacción del cliente',
    value: 91,
    unit: '%',
    trend: 'stable',
    trendValue: '0%',
  },
  {
    id: 'kpi-06',
    label: 'Incidentes de documentación',
    value: 3,
    unit: 'incidentes',
    trend: 'down',
    trendValue: '-40%',
  },
];

export const barChartData: BarChartData[] = [
  { month: 'Oct', pickups: 98, deliveries: 112, reposiciones: 24 },
  { month: 'Nov', pickups: 105, deliveries: 118, reposiciones: 28 },
  { month: 'Dic', pickups: 87, deliveries: 95, reposiciones: 19 },
  { month: 'Ene', pickups: 112, deliveries: 130, reposiciones: 31 },
  { month: 'Feb', pickups: 120, deliveries: 138, reposiciones: 35 },
  { month: 'Mar', pickups: 134, deliveries: 152, reposiciones: 38 },
];

export const reports: Report[] = [
  {
    id: 'RPT-001',
    name: 'Reporte Operativo Mensual',
    description: 'Resumen de DOs, entregas y cumplimiento de temperatura del período',
    data: [
      { metric: 'DOs completadas', value: 312, period: 'Enero 2025' },
      { metric: 'Entregas a tiempo', value: '94.2%', period: 'Enero 2025' },
      { metric: 'Incidentes de temperatura', value: 11, period: 'Enero 2025' },
      { metric: 'Km recorridos', value: 148_320, period: 'Enero 2025' },
    ],
  },
  {
    id: 'RPT-002',
    name: 'Reporte Financiero de Facturación',
    description: 'Estado de facturas, pagos a carriers y conciliación SAT',
    data: [
      { metric: 'Facturas emitidas', value: 234, period: 'Enero 2025' },
      { metric: 'Monto total facturado', value: '$4,820,500 MXN', period: 'Enero 2025' },
      { metric: 'Discrepancias SAT', value: 2, period: 'Enero 2025' },
      { metric: 'Pagos a carriers procesados', value: 3, period: 'Enero 2025' },
    ],
  },
  {
    id: 'RPT-003',
    name: 'Reporte de Satisfacción del Cliente',
    description: 'Métricas de atención, SLA y resolución de tickets por tipo de cliente',
    data: [
      { metric: 'Satisfacción general', value: '91%', period: 'Enero 2025' },
      { metric: 'Resolución primer contacto', value: '78%', period: 'Enero 2025' },
      { metric: 'Tickets escalados', value: 2, period: 'Enero 2025' },
      { metric: 'SLA Premium cumplido', value: '75%', period: 'Enero 2025' },
    ],
  },
  {
    id: 'RPT-004',
    name: 'Reporte de Gobernanza IA',
    description: 'Precisión de agentes, autonomía y cumplimiento de SLA por módulo',
    data: [
      { metric: 'Precisión promedio agentes', value: '94.1%', period: 'Enero 2025' },
      { metric: 'Acciones autónomas', value: 1_847, period: 'Enero 2025' },
      { metric: 'Intervenciones manuales', value: 43, period: 'Enero 2025' },
      { metric: 'Alertas de riesgo alto', value: 1, period: 'Enero 2025' },
    ],
  },
];

export const aiInsights: AIInsight[] = [
  {
    id: 'INS-001',
    type: 'alerta',
    text: 'Se detectaron 2 DOs con temperatura sobre umbral en las últimas 6 horas. Se recomienda revisar el estado de refrigeración de las unidades TU-002 y TU-004.',
    module: 'AI Dispatch',
  },
  {
    id: 'INS-002',
    type: 'recomendacion',
    text: 'El volumen de entregas en la ruta CDMX-MTY ha aumentado un 18% en los últimos 30 días. Considerar asignar una unidad adicional para optimizar tiempos.',
    module: 'AI Planning',
  },
  {
    id: 'INS-003',
    type: 'observacion',
    text: 'La tasa de clasificación automática de correos alcanzó 97.2%, superando el objetivo mensual del 95%. El modelo de clasificación está operando de forma óptima.',
    module: 'AI Mail Ops',
  },
  {
    id: 'INS-004',
    type: 'alerta',
    text: '2 facturas presentan discrepancias SAT pendientes de resolución. El bloqueo de estas facturas puede afectar el flujo de caja del período.',
    module: 'AI Billing',
  },
  {
    id: 'INS-005',
    type: 'recomendacion',
    text: 'Los documentos DOC-003 y DOC-007 vencen en menos de 7 días. Se recomienda iniciar el proceso de renovación para evitar bloqueos operativos en las DOs asociadas.',
    module: 'AI Docs',
  },
];
