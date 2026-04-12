'use client';

import { useState } from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import ModuleCard from '@/components/shared/ModuleCard';
import { dashboardModules, globalCounters } from '@/data/dashboard';

import MailOpsModule from '@/components/modules/MailOps/MailOpsModule';
import DispatchModule from '@/components/modules/Dispatch/DispatchModule';
import BillingModule from '@/components/modules/Billing/BillingModule';
import DocsModule from '@/components/modules/Docs/DocsModule';
import CustomerModule from '@/components/modules/Customer/CustomerModule';
import AnalyticsModule from '@/components/modules/Analytics/AnalyticsModule';
import PlanningModule from '@/components/modules/Planning/PlanningModule';
import GovernanceModule from '@/components/modules/Governance/GovernanceModule';

const moduleComponents: Record<string, React.ComponentType<{ onBack: () => void }>> = {
  mailops: MailOpsModule,
  dispatch: DispatchModule,
  billing: BillingModule,
  docs: DocsModule,
  customer: CustomerModule,
  analytics: AnalyticsModule,
  planning: PlanningModule,
  governance: GovernanceModule,
};

export default function Home() {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  if (activeModule) {
    const ActiveComponent = moduleComponents[activeModule];
    if (ActiveComponent) {
      return <ActiveComponent onBack={() => setActiveModule(null)} />;
    }
  }

  const syncLabel = globalCounters.lastSync;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header globalCounters={globalCounters} />

      <main className="flex-1 px-6 py-6">
        {/* Dashboard title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Corporate AI Platform</h1>
          <p className="text-sm text-gray-500 mt-1">
            BALI Express Services · {globalCounters.activeModules} módulos activos · Última sincronización: {syncLabel}
          </p>
        </div>

        {/* Module grid 4×2 */}
        <div className="grid grid-cols-4 gap-6">
          {dashboardModules.map((mod) => (
            <ModuleCard
              key={mod.id}
              module={mod}
              onOpen={() => setActiveModule(mod.route)}
            />
          ))}
        </div>
      </main>

      <Footer modules={dashboardModules} />
    </div>
  );
}
