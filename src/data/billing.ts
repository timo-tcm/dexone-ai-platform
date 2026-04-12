import type { Invoice, CarrierPayment } from '@/types/index';

export const billingCycle = {
  period: 'Enero 2025',
  invoicesIssued: 234,
  invoicesTotal: 4_820_500,
  pendingPayments: 18,
  pendingTotal: 612_300,
  receivedPayments: 216,
  receivedTotal: 4_208_200,
  automationRate: 89,
};

export const invoices: Invoice[] = [
  {
    id: 'FAC-2025-0101',
    client: 'Grupo Logístico Norteño',
    amount: 185_400,
    status: 'pagada',
    satStatus: 'Validado SAT',
    date: '2025-01-02',
  },
  {
    id: 'FAC-2025-0102',
    client: 'Importadora del Pacífico S.A.',
    amount: 320_750,
    status: 'pendiente',
    satStatus: 'Discrepancia SAT',
    date: '2025-01-04',
  },
  {
    id: 'FAC-2025-0103',
    client: 'Distribuidora Central Bajío',
    amount: 97_200,
    status: 'pagada',
    satStatus: 'Validado SAT',
    date: '2025-01-05',
  },
  {
    id: 'FAC-2025-0104',
    client: 'Comercializadora del Golfo',
    amount: 214_600,
    status: 'pendiente',
    satStatus: 'Pendiente validación',
    date: '2025-01-07',
  },
  {
    id: 'FAC-2025-0105',
    client: 'Alimentos del Sureste',
    amount: 143_800,
    status: 'pagada',
    satStatus: 'Validado SAT',
    date: '2025-01-08',
  },
  {
    id: 'FAC-2025-0106',
    client: 'Exportadora Norteña',
    amount: 489_000,
    status: 'rechazada',
    satStatus: 'Discrepancia SAT',
    date: '2025-01-10',
  },
  {
    id: 'FAC-2025-0107',
    client: 'Grupo Logístico Norteño',
    amount: 76_500,
    status: 'pagada',
    satStatus: 'Validado SAT',
    date: '2025-01-12',
  },
  {
    id: 'FAC-2025-0108',
    client: 'Distribuidora Central Bajío',
    amount: 258_900,
    status: 'pendiente',
    satStatus: 'Pendiente validación',
    date: '2025-01-14',
  },
];

export const carrierPayments: CarrierPayment[] = [
  {
    id: 'CP-2025-0041',
    carrier: 'Transportes Rápidos del Norte',
    amount: 124_500,
    status: 'procesado',
    date: '2025-01-03',
  },
  {
    id: 'CP-2025-0042',
    carrier: 'Fletes Nacionales S.A.',
    amount: 87_300,
    status: 'pendiente',
    date: '2025-01-06',
  },
  {
    id: 'CP-2025-0043',
    carrier: 'Logística Express MX',
    amount: 210_000,
    status: 'procesado',
    date: '2025-01-08',
  },
  {
    id: 'CP-2025-0044',
    carrier: 'Transportes del Bajío',
    amount: 65_800,
    status: 'rechazado',
    date: '2025-01-09',
  },
  {
    id: 'CP-2025-0045',
    carrier: 'Carga Pesada del Norte',
    amount: 178_200,
    status: 'pendiente',
    date: '2025-01-11',
  },
  {
    id: 'CP-2025-0046',
    carrier: 'Transportes Rápidos del Norte',
    amount: 93_600,
    status: 'procesado',
    date: '2025-01-13',
  },
];
