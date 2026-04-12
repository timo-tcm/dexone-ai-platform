'use client';

type BadgeStatus =
  | 'live'
  | 'offline'
  | 'warning'
  | 'activo'
  | 'inactivo'
  | 'escalado'
  | 'abierto'
  | 'en atención'
  | 'procesado'
  | 'pendiente'
  | 'rechazado'
  | 'válido'
  | 'por vencer'
  | 'vencido'
  | 'incompleto';

interface StatusBadgeProps {
  status: BadgeStatus;
}

const statusStyles: Record<BadgeStatus, string> = {
  live:         'bg-green-100 text-green-700',
  offline:      'bg-red-100 text-red-700',
  warning:      'bg-yellow-100 text-yellow-700',
  activo:       'bg-green-100 text-green-700',
  inactivo:     'bg-gray-100 text-gray-500',
  escalado:     'bg-red-100 text-red-700',
  abierto:      'bg-blue-100 text-blue-700',
  'en atención':'bg-orange-100 text-orange-700',
  procesado:    'bg-green-100 text-green-700',
  pendiente:    'bg-yellow-100 text-yellow-700',
  rechazado:    'bg-red-100 text-red-700',
  válido:       'bg-green-100 text-green-700',
  'por vencer': 'bg-yellow-100 text-yellow-700',
  vencido:      'bg-red-100 text-red-700',
  incompleto:   'bg-gray-100 text-gray-500',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${statusStyles[status] ?? 'bg-gray-100 text-gray-500'}`}
    >
      {status}
    </span>
  );
}
