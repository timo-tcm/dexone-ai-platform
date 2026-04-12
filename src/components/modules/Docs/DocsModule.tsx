'use client';

import { useState } from 'react';
import { FileText, FileCheck, Shield, Leaf } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import ModuleLayout from '@/components/shared/ModuleLayout';
import StatusBadge from '@/components/shared/StatusBadge';
import { documents } from '@/data/docs';
import type { DocType, DocStatus } from '@/types/index';

interface DocsModuleProps {
  onBack: () => void;
}

const MOCK_TODAY = '2025-01-15';

const DOC_TYPES: string[] = ['Todos', 'B/L', 'Pedimento', 'Póliza', 'Certificado Fitosanitario'];

function getDocIcon(type: DocType) {
  switch (type) {
    case 'B/L':
      return <FileText className="w-5 h-5" />;
    case 'Pedimento':
      return <FileCheck className="w-5 h-5" />;
    case 'Póliza':
      return <Shield className="w-5 h-5" />;
    case 'Certificado Fitosanitario':
      return <Leaf className="w-5 h-5" />;
  }
}

function getStatusColor(status: DocStatus): string {
  switch (status) {
    case 'válido':
      return 'text-green-600';
    case 'por vencer':
      return 'text-yellow-600';
    case 'vencido':
      return 'text-red-600';
    case 'incompleto':
      return 'text-gray-500';
  }
}

function getDaysUntilExpiry(expiryDate: string): number {
  return differenceInDays(parseISO(expiryDate), parseISO(MOCK_TODAY));
}

function buildValidationResult(requiredFields: string[], presentFields: string[]): string {
  const missing = requiredFields.filter((f) => !presentFields.includes(f));
  if (missing.length === 0) {
    return '✓ Documento completo. Todos los campos obligatorios están presentes.';
  }
  return `⚠ Campos faltantes: ${missing.join(', ')}`;
}

export default function DocsModule({ onBack }: DocsModuleProps) {
  const [filter, setFilter] = useState<string>('Todos');

  const totalDocs = documents.length;
  const validDocs = documents.filter((d) => d.status === 'válido').length;
  const expiringSoon = documents.filter((d) => {
    if (d.status !== 'por vencer') return false;
    const days = getDaysUntilExpiry(d.expiryDate);
    return days >= 0 && days < 7;
  }).length;
  const expiredDocs = documents.filter((d) => d.status === 'vencido').length;

  const filtered = filter === 'Todos' ? documents : documents.filter((d) => d.type === filter);

  return (
    <ModuleLayout
      moduleId="docs"
      moduleName="AI Docs"
      moduleCode="DC"
      accentColor="#D97706"
      onBack={onBack}
    >
      {/* Header metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Documentos</p>
          <p className="text-2xl font-bold text-gray-800">{totalDocs}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Válidos</p>
          <p className="text-2xl font-bold text-green-600">{validDocs}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Por Vencer (&lt;7 días)</p>
          <p className="text-2xl font-bold text-yellow-500">{expiringSoon}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Vencidos</p>
          <p className="text-2xl font-bold text-red-600">{expiredDocs}</p>
        </div>
      </div>

      {/* Filter row + upload button */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2 flex-wrap">
          {DOC_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                filter === type
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-amber-400 hover:text-amber-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            const doc = documents[0];
            const result = buildValidationResult(doc.requiredFields, doc.presentFields);
            window.alert(`Validación de carga (mock):\n\n${result}`);
          }}
          className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors"
        >
          Simular carga de documento
        </button>
      </div>

      {/* Document grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((doc) => {
          const daysLeft = getDaysUntilExpiry(doc.expiryDate);
          const missingFields = doc.requiredFields.filter((f) => !doc.presentFields.includes(f));
          const isBlocking = doc.doId !== null && doc.status !== 'válido';

          return (
            <div
              key={doc.id}
              className={`bg-white rounded-xl shadow-sm border flex flex-col overflow-hidden ${
                isBlocking ? 'border-amber-400' : 'border-gray-100'
              }`}
            >
              {/* Status banner */}
              {doc.status === 'por vencer' && (
                <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-xs font-semibold text-yellow-700">
                  ⚠ Vence en {daysLeft} día{daysLeft !== 1 ? 's' : ''}
                </div>
              )}
              {doc.status === 'vencido' && (
                <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs font-semibold text-red-700">
                  ✗ Vencido
                </div>
              )}

              <div className="p-4 flex flex-col gap-3 flex-1">
                {/* Type + icon */}
                <div className="flex items-center gap-2">
                  <span className={`${getStatusColor(doc.status)}`}>{getDocIcon(doc.type)}</span>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{doc.type}</span>
                </div>

                {/* Name */}
                <p className="text-sm font-semibold text-gray-800 leading-snug">{doc.name}</p>

                {/* DO asociada */}
                {doc.doId && (
                  <p className="text-xs text-gray-500">
                    DO: <span className="font-mono text-gray-700">{doc.doId}</span>
                  </p>
                )}

                {/* Status badge + blocking badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={doc.status} />
                  {isBlocking && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-amber-100 text-amber-700">
                      Bloquea DO
                    </span>
                  )}
                </div>

                {/* Missing fields for incomplete docs */}
                {doc.status === 'incompleto' && missingFields.length > 0 && (
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Campos faltantes</p>
                    <div className="flex flex-wrap gap-1">
                      {missingFields.map((field) => (
                        <span
                          key={field}
                          className="inline-block px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px] font-mono"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Download button */}
                <div className="mt-auto pt-2">
                  <button
                    type="button"
                    onClick={() => window.alert(`Descargando: ${doc.name}`)}
                    className="w-full px-3 py-1.5 text-xs font-semibold text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    Descargar PDF
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ModuleLayout>
  );
}
