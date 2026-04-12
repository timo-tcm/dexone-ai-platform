'use client';

import { useState } from 'react';
import ModuleLayout from '@/components/shared/ModuleLayout';
import StatusBadge from '@/components/shared/StatusBadge';
import { billingCycle, invoices, carrierPayments } from '@/data/billing';
import type { Invoice } from '@/types/index';

interface BillingModuleProps {
  onBack: () => void;
}

type ActiveTab = 'cobro' | 'carriers' | 'sat';

function formatMXN(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function BillingModule({ onBack }: BillingModuleProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('cobro');
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const discrepancyInvoices = invoices.filter((inv) => inv.satStatus === 'Discrepancia SAT');

  function openModal(invoice: Invoice | null) {
    setSelectedInvoice(invoice);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedInvoice(null);
  }

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'cobro', label: 'Ciclo de Cobro' },
    { id: 'carriers', label: 'Pagos Carriers' },
    { id: 'sat', label: 'Conciliación SAT' },
  ];

  return (
    <ModuleLayout
      moduleId="billing"
      moduleName="AI Billing"
      moduleCode="BL"
      accentColor="#059669"
      onBack={onBack}
    >
      {/* Header metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Facturas Emitidas</p>
          <p className="text-2xl font-bold text-gray-800">{billingCycle.invoicesIssued}</p>
          <p className="text-xs text-gray-400 mt-1">{billingCycle.period}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Monto Total</p>
          <p className="text-2xl font-bold text-emerald-600">$4.8M</p>
          <p className="text-xs text-gray-400 mt-1">{formatMXN(billingCycle.invoicesTotal)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pagos Pendientes</p>
          <p className="text-2xl font-bold text-amber-500">{billingCycle.pendingPayments}</p>
          <p className="text-xs text-gray-400 mt-1">{formatMXN(billingCycle.pendingTotal)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">% Automatización</p>
          <p className="text-2xl font-bold text-emerald-600">{billingCycle.automationRate}%</p>
          <p className="text-xs text-gray-400 mt-1">Procesos automatizados</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-emerald-600 text-emerald-700 bg-emerald-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Tab 1 — Ciclo de Cobro */}
          {activeTab === 'cobro' && (
            <div>
              {/* Cycle summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Facturas Emitidas</p>
                  <p className="text-lg font-bold text-gray-800">{billingCycle.invoicesIssued}</p>
                  <p className="text-sm text-gray-600">{formatMXN(billingCycle.invoicesTotal)}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Pagos Recibidos</p>
                  <p className="text-lg font-bold text-green-700">{billingCycle.receivedPayments}</p>
                  <p className="text-sm text-green-600">{formatMXN(billingCycle.receivedTotal)}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Pagos Pendientes</p>
                  <p className="text-lg font-bold text-amber-600">{billingCycle.pendingPayments}</p>
                  <p className="text-sm text-amber-500">{formatMXN(billingCycle.pendingTotal)}</p>
                </div>
              </div>

              {/* Invoices table */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Facturas del Ciclo</h3>
                <button
                  type="button"
                  onClick={() => openModal(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#059669' }}
                >
                  + Generar factura
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Monto</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase">SAT Status</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => {
                      const isDiscrepancy = inv.satStatus === 'Discrepancia SAT';
                      return (
                        <tr
                          key={inv.id}
                          className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            isDiscrepancy ? 'bg-red-50' : ''
                          }`}
                          onClick={() => openModal(inv)}
                        >
                          <td className="py-2.5 px-3 font-mono text-xs text-gray-600">{inv.id}</td>
                          <td className="py-2.5 px-3 text-gray-800">{inv.client}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-gray-800">
                            {formatMXN(inv.amount)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                                inv.status === 'pagada'
                                  ? 'bg-green-100 text-green-700'
                                  : inv.status === 'rechazada'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {isDiscrepancy ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-red-100 text-red-700">
                                Discrepancia SAT
                              </span>
                            ) : (
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                                  inv.satStatus === 'Validado SAT'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {inv.satStatus}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-gray-500 text-xs">{inv.date}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2 — Pagos Carriers */}
          {activeTab === 'carriers' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Pagos a Carriers</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Carrier</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Monto</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrierPayments.map((cp) => (
                      <tr
                        key={cp.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          cp.status === 'rechazado' ? 'bg-red-50' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono text-xs text-gray-600">{cp.id}</td>
                        <td className="py-2.5 px-3 text-gray-800">{cp.carrier}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-gray-800">
                          {formatMXN(cp.amount)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <StatusBadge status={cp.status} />
                        </td>
                        <td className="py-2.5 px-3 text-gray-500 text-xs">{cp.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3 — Conciliación SAT */}
          {activeTab === 'sat' && (
            <div>
              {/* SAT summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Total Facturas</p>
                  <p className="text-2xl font-bold text-gray-800">{invoices.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Validadas SAT</p>
                  <p className="text-2xl font-bold text-green-700">
                    {invoices.filter((i) => i.satStatus === 'Validado SAT').length}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Con Discrepancia</p>
                  <p className="text-2xl font-bold text-red-600">{discrepancyInvoices.length}</p>
                </div>
              </div>

              {/* Automation progress */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Automatización de Conciliación</p>
                  <p className="text-sm font-bold text-emerald-600">{billingCycle.automationRate}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-emerald-500"
                    style={{ width: `${billingCycle.automationRate}%` }}
                  />
                </div>
              </div>

              {/* Discrepancy list */}
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Facturas con Discrepancia SAT ({discrepancyInvoices.length})
              </h3>
              <div className="space-y-3">
                {discrepancyInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-gray-600">{inv.id}</span>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-red-100 text-red-700">
                          Discrepancia SAT
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{inv.client}</p>
                      <p className="text-xs text-gray-500">{inv.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-gray-800">{formatMXN(inv.amount)}</p>
                      <p className="text-xs text-red-500 mt-1">Envío bloqueado</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal — Generar Factura */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">
                {selectedInvoice ? 'Detalle de Factura' : 'Generar Nueva Factura'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="inv-client" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Cliente
                </label>
                <input
                  id="inv-client"
                  type="text"
                  defaultValue={selectedInvoice?.client ?? ''}
                  placeholder="Nombre del cliente"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label htmlFor="inv-amount" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Monto (MXN)
                </label>
                <input
                  id="inv-amount"
                  type="number"
                  defaultValue={selectedInvoice?.amount ?? ''}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label htmlFor="inv-date" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Fecha
                </label>
                <input
                  id="inv-date"
                  type="date"
                  defaultValue={selectedInvoice?.date ?? new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label htmlFor="inv-rfc" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  RFC
                </label>
                <input
                  id="inv-rfc"
                  type="text"
                  defaultValue="BALI-123456-XXX"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            {selectedInvoice?.satStatus === 'Discrepancia SAT' && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600 font-medium">
                ⚠ Esta factura tiene una discrepancia SAT. El envío está bloqueado hasta resolver la discrepancia.
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <div className="relative flex-1 group">
                <button
                  type="button"
                  disabled={selectedInvoice?.satStatus === 'Discrepancia SAT'}
                  className="w-full px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#059669' }}
                >
                  Enviar
                </button>
                {selectedInvoice?.satStatus === 'Discrepancia SAT' && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Bloqueada por discrepancia SAT
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </ModuleLayout>
  );
}
