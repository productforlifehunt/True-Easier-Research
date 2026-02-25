import React, { ReactNode } from 'react';
import { MobileService } from '../utils/mobile';

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, showBottomNav = true }) => {
  const isMobile = MobileService.isMobile();

  return (
    <div className={`flex flex-col min-h-screen ${isMobile ? 'mobile-app' : ''}`}>
      {/* Safe area top for mobile */}
      {isMobile && (
        <div className="safe-area-top bg-white" style={{ paddingTop: 'env(safe-area-inset-top)' }} />
      )}
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      
      {/* Safe area bottom for mobile */}
      {isMobile && showBottomNav && (
        <div className="safe-area-bottom bg-white" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
      )}
    </div>
  );
};

export default MobileLayout;
