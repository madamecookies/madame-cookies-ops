import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  href: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange 
}) => {
  const [currentTab, setCurrentTab] = useState(activeTab || 'dashboard');

  useEffect(() => {
    // Check URL hash on mount and handle tab switching
    const hash = window.location.hash.slice(1);
    if (hash && tabs.find(tab => tab.id === hash)) {
      setCurrentTab(hash);
      onTabChange?.(hash);
    }

    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1);
      if (newHash && tabs.find(tab => tab.id === newHash)) {
        setCurrentTab(newHash);
        onTabChange?.(newHash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [tabs, onTabChange]);

  const handleTabClick = (tab: Tab, e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentTab(tab.id);
    window.location.hash = tab.id;
    onTabChange?.(tab.id);
  };

  return (
    <nav className="tab-navigation">
      {tabs.map((tab) => (
        <a
          key={tab.id}
          href={tab.href}
          className={cn(
            "tab-link",
            currentTab === tab.id && "active"
          )}
          onClick={(e) => handleTabClick(tab, e)}
          role="tab"
          aria-selected={currentTab === tab.id}
        >
          {tab.label}
        </a>
      ))}
    </nav>
  );
};