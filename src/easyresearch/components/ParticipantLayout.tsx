import React from 'react';
import { Outlet } from 'react-router-dom';
import EasyResearchBottomNav from './EasyResearchBottomNav';

const ParticipantLayout: React.FC = () => {
  return (
    <>
      <div className="md:pt-14 md:min-h-screen flex flex-col bg-stone-50/50">
        <div className="flex-grow">
          <Outlet />
        </div>
      </div>
      <EasyResearchBottomNav />
    </>
  );
};

export default ParticipantLayout;
