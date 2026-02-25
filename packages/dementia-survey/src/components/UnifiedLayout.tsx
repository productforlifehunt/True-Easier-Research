import React from 'react';
import { useLocation } from 'react-router-dom';
import HFHHeader from './HFHHeader';
import HFHFooter from './HFHFooter';
import Breadcrumb from './Breadcrumb';

interface UnifiedLayoutProps {
  children: React.ReactNode;
}

const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Unified Header Component */}
      <HFHHeader />

      {/* Breadcrumb Navigation */}
      {location.pathname.startsWith('/humans-for-hire') && <Breadcrumb />}

      {/* Main Content */}
      <main style={{
        minHeight: 'calc(100vh - 68px - 240px)',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        {children}
      </main>

      {/* Unified Footer Component */}
      <HFHFooter />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default UnifiedLayout;
