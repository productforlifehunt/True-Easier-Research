import React from 'react';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';

interface ResearcherLayoutProps {
  children?: React.ReactNode;
}

const ResearcherLayout: React.FC<ResearcherLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9faf8' }}>
      <AppHeader />
      <AppSidebar />
      <main className="pt-14 md:pl-56">
        <div className="p-4 sm:p-6 lg:p-8">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default ResearcherLayout;