import React from 'react';
import { FileJson, Navigation } from 'lucide-react';

export type TabId = 'translator' | 'routes';

interface TabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="tabs-navigation" aria-label="Navegación de módulos">
      <button
        onClick={() => onTabChange('translator')}
        className={`tab-btn ${activeTab === 'translator' ? 'active' : ''}`}
      >
        <FileJson size={18} />
        <span>Ejercicio 1: Traductor de Endosos</span>
      </button>

      <button
        onClick={() => onTabChange('routes')}
        className={`tab-btn ${activeTab === 'routes' ? 'active' : ''}`}
      >
        <Navigation size={18} />
        <span>Ejercicio 2: Rutas Óptimas (Golang)</span>
      </button>
    </nav>
  );
};
