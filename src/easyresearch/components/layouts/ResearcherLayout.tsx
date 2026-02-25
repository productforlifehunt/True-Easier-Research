import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';

interface ResearcherLayoutProps {
  children?: React.ReactNode;
}

const ResearcherLayout: React.FC<ResearcherLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AppHeader />
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main
        className={`pt-14 transition-all duration-200 ${
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-56'
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default ResearcherLayout;
