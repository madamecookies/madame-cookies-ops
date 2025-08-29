import React, { useState } from 'react';
import { TabNavigation } from '@/components/TabNavigation';
import { Dashboard } from '@/components/Dashboard';
import { Production } from '@/components/Production';
import { Temperatures } from '@/components/Temperatures';
import { Nettoyage } from '@/components/Nettoyage';
import { Reception } from '@/components/Reception';
import { Exports } from '@/components/Exports';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', href: '#dashboard' },
  { id: 'temperatures', label: 'Températures', href: '#temperatures' },
  { id: 'production', label: 'Production', href: '#production' },
  { id: 'nettoyage', label: 'Nettoyage', href: '#nettoyage' },
  { id: 'reception', label: 'Réception', href: '#reception' },
  { id: 'exports', label: 'Exports', href: '#exports' },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'temperatures':
        return <Temperatures />;
      case 'production':
        return <Production />;
      case 'nettoyage':
        return <Nettoyage />;
      case 'reception':
        return <Reception />;
      case 'exports':
        return <Exports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TabNavigation 
        tabs={TABS} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      <main className="pb-safe">
        {/* Fallback CSS-only navigation for browsers without JS */}
        <div id="dashboard" className="hidden target:block">
          <Dashboard />
        </div>
        <div id="temperatures" className="hidden target:block">
          <Temperatures />
        </div>
        <div id="production" className="hidden target:block">
          <Production />
        </div>
        <div id="nettoyage" className="hidden target:block">
          <Nettoyage />
        </div>
        <div id="reception" className="hidden target:block">
          <Reception />
        </div>
        <div id="exports" className="hidden target:block">
          <Exports />
        </div>
        
        {/* JavaScript-enhanced content (preferred) */}
        <div className="js-enabled">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
