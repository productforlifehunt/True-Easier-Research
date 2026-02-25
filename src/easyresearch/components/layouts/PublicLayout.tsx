import React from 'react';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';

interface PublicLayoutProps {
  children?: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AppHeader />
      <main className="pt-16">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default PublicLayout;
