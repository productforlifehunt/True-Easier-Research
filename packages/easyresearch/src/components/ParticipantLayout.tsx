import React from 'react';
import { Outlet } from 'react-router-dom';
import EasyResearchBottomNav from './EasyResearchBottomNav';

const ParticipantLayout: React.FC = () => {
  return (
    <>
      <div className="md:pt-16 md:min-h-screen flex flex-col">
        <div className="flex-grow">
          <Outlet />
        </div>
      </div>
      <EasyResearchBottomNav />
    </>
  );
};

export default ParticipantLayout;
