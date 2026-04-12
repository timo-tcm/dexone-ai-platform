'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Lightbulb, Eye } from 'lucide-react';
import ModuleLayout from '@/components/shared/ModuleLayout';
import MetricCard from '@/components/shared/MetricCard';
import { kpis, barChartData, aiInsights, reports } from '@/data/analytics';

interface AnalyticsModuleProps {
  onBack: () => void;
}

const insightIcons = {
  alerta: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  recomendacion: { icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  observacion: { icon: Eye, color: 'text-green-500', bg: 'bg-green-50' },
};

const routeOptions = ['Todas', 'CDMX-MTY', 'CDMX-GDL', 'GDL-TIJ', 'CDMX-VER'];
const serviceOptions = ['Todos', 'Refrigerado', 'Carga General', 'Perecederos'];

export default function AnalyticsModule({ onBack }: AnalyticsModuleProps) {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2025-01-31');
  const [routeFilter, setRouteFilter] = useState('Todas');
  const [serviceFilter, setServiceFilter] = useState('Todos');

  return (
    <ModuleLayout
      moduleId="analytics"
      moduleName="AI Analytics"
      moduleCode="AN"
      accentColor="#7C3AED"
      onBack={onBack}
    >
      {/* Sección 1 — KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map((kpi) => (
          <MetricCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            unit={kpi.unit}
            trend={kpi.trend}
            trendValue={kpi.trendValue}
          />
        ))}
      </div>

      {/* Sección 2 — Gráfico de barras */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Operaciones por Período (Últimos 6 Meses)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pickups" name="Pickups" fill="#2563EB" />
            <Bar dataKey="deliveries" name="Deliveries" fill="#059669" />
            <Bar dataKey="reposiciones" name="Reposiciones" fill="#D97706" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sección 3 — Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Filtros</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="date-from" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Desde
            </label>
            <input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div>
            <label htmlFor="date-to" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Hasta
            </label>
            <input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div>
            <label htmlFor="route-filter" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Ruta
            </label>
            <select
              id="route-filter"
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {routeOptions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="service-filter" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Tipo de Servicio
            </label>
            <select
              id="service-filter"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {serviceOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sección 4 — Insights IA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Insights IA</h3>
        <div className="space-y-3">
          {aiInsights.map((insight) => {
            const config = insightIcons[insight.type];
            const Icon = config.icon;
            return (
              <div key={insight.id} className={`flex items-start gap-3 rounded-lg p-4 ${config.bg}`}>
                <Icon size={20} className={`mt-0.5 flex-shrink-0 ${config.color}`} />
                <div>
                  <p className="text-sm text-gray-800">{insight.text}</p>
                  <p className="text-xs text-gray-500 mt-1">Módulo: {insight.module}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sección 5 — Reportes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Reportes Predefinidos</h3>
        <div className="grid grid-cols-2 gap-4">
          {reports.map((report) => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-bold text-gray-800 mb-1">{report.name}</h4>
              <p className="text-xs text-gray-500 mb-3">{report.description}</p>
              <button
                type="button"
                onClick={() =>
                  setSelectedReport(selectedReport === report.id ? null : report.id)
                }
                className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#7C3AED' }}
              >
                {selectedReport === report.id ? 'Cerrar reporte' : 'Ver reporte'}
              </button>

              {selectedReport === report.id && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Métrica</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Valor</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Período</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.data.map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2 px-3 text-gray-800">{String(row.metric)}</td>
                          <td className="py-2 px-3 font-semibold text-gray-800">{String(row.value)}</td>
                          <td className="py-2 px-3 text-gray-500">{String(row.period)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </ModuleLayout>
  );
}
