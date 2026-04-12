'use client';

import { useState, useEffect } from 'react';
import type { AgentIA, BusinessRule, ActivationCriteria, Threshold } from '@/types/index';

interface AgentFormProps {
  agent?: AgentIA | null;
  onSave: (agent: AgentIA) => void;
  onCancel: () => void;
}

const MODULE_OPTIONS = [
  'AI Mail Ops',
  'AI Dispatch',
  'AI Billing',
  'AI Docs',
  'AI Customer',
  'AI Analytics',
  'AI Planning',
  'AI Governance',
];

const emptyRule: BusinessRule = { field: '', operator: '==', value: '', action: '' };
const emptyCriteria: ActivationCriteria = { triggerEvent: '', sourceModule: '' };
const emptyThreshold: Threshold = { name: '', value: 0, unit: '' };

export default function AgentForm({ agent, onSave, onCancel }: AgentFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetModule, setTargetModule] = useState('');
  const [status, setStatus] = useState<'activo' | 'inactivo'>('activo');
  const [rules, setRules] = useState<BusinessRule[]>([{ ...emptyRule }]);
  const [criteria, setCriteria] = useState<ActivationCriteria[]>([{ ...emptyCriteria }]);
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Conditional fields state
  const [dispatchTemp, setDispatchTemp] = useState<number>(8);
  const [dispatchTime, setDispatchTime] = useState<number>(30);
  const [customerSLA, setCustomerSLA] = useState<number>(95);
  const [customerTypes, setCustomerTypes] = useState<string[]>([]);
  const [billingSAT, setBillingSAT] = useState<number>(0.5);
  const [billingAmount, setBillingAmount] = useState<number>(200000);
  const [docsTypes, setDocsTypes] = useState<string[]>([]);
  const [docsDays, setDocsDays] = useState<number>(7);

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setDescription(agent.description);
      setTargetModule(agent.targetModule);
      setStatus(agent.status);
      setRules(agent.rules.length > 0 ? [...agent.rules] : [{ ...emptyRule }]);
      setCriteria(agent.activationCriteria.length > 0 ? [...agent.activationCriteria] : [{ ...emptyCriteria }]);
      setThresholds([...agent.thresholds]);
      // Parse conditional fields from existing thresholds
      parseConditionalFields(agent.targetModule, agent.thresholds);
    }
  }, [agent]);

  function parseConditionalFields(mod: string, ths: Threshold[]) {
    if (mod === 'AI Dispatch') {
      const temp = ths.find(t => t.unit === '°C');
      const time = ths.find(t => t.unit === 'minutos' || t.unit === 'min');
      if (temp) setDispatchTemp(temp.value);
      if (time) setDispatchTime(time.value);
    } else if (mod === 'AI Customer') {
      const sla = ths.find(t => t.name.toLowerCase().includes('sla'));
      if (sla) setCustomerSLA(sla.value);
      // Types would be stored as a comma-separated threshold name
      const types = ths.find(t => t.name.toLowerCase().includes('tipos de cliente'));
      if (types) setCustomerTypes(types.unit.split(',').map(s => s.trim()).filter(Boolean));
    } else if (mod === 'AI Billing') {
      const sat = ths.find(t => t.name.toLowerCase().includes('discrepancia'));
      const amount = ths.find(t => t.unit === 'MXN');
      if (sat) setBillingSAT(sat.value);
      if (amount) setBillingAmount(amount.value);
    } else if (mod === 'AI Docs') {
      const days = ths.find(t => t.unit === 'días');
      if (days) setDocsDays(days.value);
      const types = ths.find(t => t.name.toLowerCase().includes('tipos de documento'));
      if (types) setDocsTypes(types.unit.split(',').map(s => s.trim()).filter(Boolean));
    }
  }

  const errors: Record<string, string> = {};
  if (touched.name && !name.trim()) errors.name = 'El nombre es obligatorio';
  if (touched.targetModule && !targetModule) errors.targetModule = 'Seleccione un módulo destino';
  if (touched.criteria && criteria.every(c => !c.triggerEvent.trim()))
    errors.criteria = 'Agregue al menos un criterio de activación';

  const allTouched = touched.name && touched.targetModule && touched.criteria;
  const hasErrors = !name.trim() || !targetModule || criteria.every(c => !c.triggerEvent.trim());

  function buildConditionalThresholds(): Threshold[] {
    const extra: Threshold[] = [];
    if (targetModule === 'AI Dispatch') {
      extra.push({ name: 'Umbral de temperatura', value: dispatchTemp, unit: '°C' });
      extra.push({ name: 'Tiempo máximo sin asignación', value: dispatchTime, unit: 'minutos' });
    } else if (targetModule === 'AI Customer') {
      extra.push({ name: 'Umbral de SLA', value: customerSLA, unit: '%' });
      if (customerTypes.length > 0)
        extra.push({ name: 'Tipos de cliente aplicables', value: customerTypes.length, unit: customerTypes.join(', ') });
    } else if (targetModule === 'AI Billing') {
      extra.push({ name: 'Umbral de discrepancia SAT', value: billingSAT, unit: '%' });
      extra.push({ name: 'Monto de alerta', value: billingAmount, unit: 'MXN' });
    } else if (targetModule === 'AI Docs') {
      if (docsTypes.length > 0)
        extra.push({ name: 'Tipos de documento monitoreados', value: docsTypes.length, unit: docsTypes.join(', ') });
      extra.push({ name: 'Días de anticipación de alerta', value: docsDays, unit: 'días' });
    }
    return extra;
  }

  function handleSave() {
    setTouched({ name: true, targetModule: true, criteria: true });
    if (hasErrors) return;

    const conditionalThresholds = buildConditionalThresholds();
    const allThresholds = [...thresholds.filter(t => t.name.trim()), ...conditionalThresholds];

    const saved: AgentIA = {
      id: agent?.id || `AGT-${Date.now().toString(36).toUpperCase()}`,
      name: name.trim(),
      description: description.trim(),
      targetModule,
      status,
      rules: rules.filter(r => r.field.trim()),
      activationCriteria: criteria.filter(c => c.triggerEvent.trim()),
      thresholds: allThresholds,
      executionHistory: agent?.executionHistory || [],
    };
    onSave(saved);
  }

  function updateRule(idx: number, field: keyof BusinessRule, value: string) {
    const updated = [...rules];
    updated[idx] = { ...updated[idx], [field]: value };
    setRules(updated);
  }

  function removeRule(idx: number) {
    if (rules.length <= 1) return;
    setRules(rules.filter((_, i) => i !== idx));
  }

  function updateCriteria(idx: number, field: keyof ActivationCriteria, value: string) {
    const updated = [...criteria];
    updated[idx] = { ...updated[idx], [field]: value };
    setCriteria(updated);
    setTouched(prev => ({ ...prev, criteria: true }));
  }

  function removeCriteria(idx: number) {
    if (criteria.length <= 1) return;
    setCriteria(criteria.filter((_, i) => i !== idx));
  }

  function updateThreshold(idx: number, field: keyof Threshold, value: string | number) {
    const updated = [...thresholds];
    updated[idx] = { ...updated[idx], [field]: value };
    setThresholds(updated);
  }

  function removeThreshold(idx: number) {
    setThresholds(thresholds.filter((_, i) => i !== idx));
  }

  function toggleCustomerType(type: string) {
    setCustomerTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  }

  function toggleDocType(type: string) {
    setDocsTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  }

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400';
  const errorCls = 'text-xs text-red-600 mt-1';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';
  const sectionCls = 'border-t border-gray-200 pt-4 mt-4';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <h3 className="text-sm font-bold text-gray-800">
        {agent ? 'Editar Agente' : 'Crear Agente'}
      </h3>

      {/* ── Datos básicos ── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Nombre *</label>
          <input
            className={`${inputCls} ${errors.name ? 'border-red-400' : ''}`}
            value={name}
            onChange={e => { setName(e.target.value); setTouched(p => ({ ...p, name: true })); }}
            placeholder="Nombre del agente"
          />
          {errors.name && <p className={errorCls}>{errors.name}</p>}
        </div>
        <div>
          <label className={labelCls}>Módulo destino *</label>
          <select
            title="Módulo destino"
            className={`${inputCls} ${errors.targetModule ? 'border-red-400' : ''}`}
            value={targetModule}
            onChange={e => { setTargetModule(e.target.value); setTouched(p => ({ ...p, targetModule: true })); }}
          >
            <option value="">Seleccionar módulo</option>
            {MODULE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {errors.targetModule && <p className={errorCls}>{errors.targetModule}</p>}
        </div>
      </div>

      <div>
        <label className={labelCls}>Descripción</label>
        <textarea className={inputCls} rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción del agente" />
      </div>

      <div>
        <label className={labelCls}>Estado inicial</label>
        <select className={inputCls} title="Estado inicial" value={status} onChange={e => setStatus(e.target.value as 'activo' | 'inactivo')}>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      {/* ── Reglas de negocio ── */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Reglas de Negocio</h4>
          <button type="button" onClick={() => setRules([...rules, { ...emptyRule }])} className="text-xs font-semibold text-blue-600 hover:text-blue-800">+ Agregar regla</button>
        </div>
        {rules.map((rule, i) => (
          <div key={i} className="grid grid-cols-5 gap-2 mb-2 items-end">
            <div>
              <label className={labelCls}>Campo</label>
              <input className={inputCls} value={rule.field} onChange={e => updateRule(i, 'field', e.target.value)} placeholder="campo" />
            </div>
            <div>
              <label className={labelCls}>Operador</label>
              <select className={inputCls} title="Operador" value={rule.operator} onChange={e => updateRule(i, 'operator', e.target.value)}>
                <option value="==">==</option>
                <option value="!=">!=</option>
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value=">=">≥</option>
                <option value="<=">≤</option>
                <option value="contains">contains</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Valor</label>
              <input className={inputCls} value={rule.value} onChange={e => updateRule(i, 'value', e.target.value)} placeholder="valor" />
            </div>
            <div>
              <label className={labelCls}>Acción</label>
              <input className={inputCls} value={rule.action} onChange={e => updateRule(i, 'action', e.target.value)} placeholder="acción" />
            </div>
            <button type="button" onClick={() => removeRule(i)} className="text-xs text-red-500 hover:text-red-700 pb-2" disabled={rules.length <= 1}>✕</button>
          </div>
        ))}
      </div>

      {/* ── Criterios de activación ── */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Criterios de Activación *</h4>
          <button type="button" onClick={() => setCriteria([...criteria, { ...emptyCriteria }])} className="text-xs font-semibold text-blue-600 hover:text-blue-800">+ Agregar criterio</button>
        </div>
        {criteria.map((c, i) => (
          <div key={i} className="grid grid-cols-3 gap-2 mb-2 items-end">
            <div>
              <label className={labelCls}>Evento disparador</label>
              <input className={inputCls} value={c.triggerEvent} onChange={e => updateCriteria(i, 'triggerEvent', e.target.value)} placeholder="evento" />
            </div>
            <div>
              <label className={labelCls}>Módulo origen</label>
              <select className={inputCls} title="Módulo origen" value={c.sourceModule} onChange={e => updateCriteria(i, 'sourceModule', e.target.value)}>
                <option value="">Seleccionar</option>
                {MODULE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <button type="button" onClick={() => removeCriteria(i)} className="text-xs text-red-500 hover:text-red-700 pb-2" disabled={criteria.length <= 1}>✕</button>
          </div>
        ))}
        {errors.criteria && <p className={errorCls}>{errors.criteria}</p>}
      </div>

      {/* ── Umbrales ── */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Umbrales</h4>
          <button type="button" onClick={() => setThresholds([...thresholds, { ...emptyThreshold }])} className="text-xs font-semibold text-blue-600 hover:text-blue-800">+ Agregar umbral</button>
        </div>
        {thresholds.map((t, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 mb-2 items-end">
            <div>
              <label className={labelCls}>Nombre</label>
              <input className={inputCls} value={t.name} onChange={e => updateThreshold(i, 'name', e.target.value)} placeholder="nombre" />
            </div>
            <div>
              <label className={labelCls}>Valor</label>
              <input type="number" className={inputCls} title="Valor del umbral" value={t.value} onChange={e => updateThreshold(i, 'value', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className={labelCls}>Unidad</label>
              <input className={inputCls} value={t.unit} onChange={e => updateThreshold(i, 'unit', e.target.value)} placeholder="unidad" />
            </div>
            <button type="button" onClick={() => removeThreshold(i)} className="text-xs text-red-500 hover:text-red-700 pb-2">✕</button>
          </div>
        ))}
        {thresholds.length === 0 && <p className="text-xs text-gray-400">Sin umbrales adicionales</p>}
      </div>

      {/* ── Campos condicionales por módulo (13.3) ── */}
      {targetModule === 'AI Dispatch' && (
        <div className={sectionCls}>
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Configuración AI Dispatch</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Umbral de temperatura (°C)</label>
              <input type="number" className={inputCls} title="Umbral de temperatura" value={dispatchTemp} onChange={e => setDispatchTemp(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className={labelCls}>Tiempo máximo sin asignación (min)</label>
              <input type="number" className={inputCls} title="Tiempo máximo sin asignación" value={dispatchTime} onChange={e => setDispatchTime(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
        </div>
      )}

      {targetModule === 'AI Customer' && (
        <div className={sectionCls}>
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Configuración AI Customer</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Umbral de SLA (%)</label>
              <input type="number" className={inputCls} title="Umbral de SLA" value={customerSLA} onChange={e => setCustomerSLA(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className={labelCls}>Tipos de cliente aplicables</label>
              <div className="flex gap-3 mt-1">
                {['Premium', 'Standard', 'Gobierno'].map(type => (
                  <label key={type} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={customerTypes.includes(type)} onChange={() => toggleCustomerType(type)} className="rounded border-gray-300" />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {targetModule === 'AI Billing' && (
        <div className={sectionCls}>
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Configuración AI Billing</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Umbral de discrepancia SAT (%)</label>
              <input type="number" step="0.1" className={inputCls} title="Umbral de discrepancia SAT" value={billingSAT} onChange={e => setBillingSAT(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className={labelCls}>Monto de alerta (MXN)</label>
              <input type="number" className={inputCls} title="Monto de alerta" value={billingAmount} onChange={e => setBillingAmount(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
        </div>
      )}

      {targetModule === 'AI Docs' && (
        <div className={sectionCls}>
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Configuración AI Docs</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Tipos de documento monitoreados</label>
              <div className="flex flex-wrap gap-3 mt-1">
                {['B/L', 'Pedimento', 'Póliza', 'Certificado'].map(type => (
                  <label key={type} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={docsTypes.includes(type)} onChange={() => toggleDocType(type)} className="rounded border-gray-300" />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Días de anticipación de alerta</label>
              <input type="number" className={inputCls} title="Días de anticipación" value={docsDays} onChange={e => setDocsDays(parseInt(e.target.value) || 0)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Botones ── */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={allTouched ? hasErrors : false}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-700 hover:bg-gray-800"
        >
          {agent ? 'Guardar cambios' : 'Crear Agente'}
        </button>
      </div>
    </div>
  );
}
