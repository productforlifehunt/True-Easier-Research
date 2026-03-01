import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import {
  LayoutDashboard, Plus, Users, Settings,
  LogOut, FileText, Search
} from 'lucide-react';

const AppSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/easyresearch');
  };

  const navItems = [
    { path: '/easyresearch/dashboard', label: 'Projects', icon: LayoutDashboard },
    { path: '/easyresearch/dashboard?create=true', label: 'New Project', icon: Plus },
    { path: '/easyresearch/participants', label: 'Participants', icon: Users },
    { path: '/easyresearch/responses', label: 'Responses', icon: FileText },
    { path: '/easyresearch/settings', label: 'Settings', icon: Settings },
    { path: '/easyresearch/participant/join', label: 'Browse & Participate', icon: Search },
  ];

  const isActive = (path: string) => {
    if (path === '/easyresearch/dashboard') {
      return location.pathname === path || location.pathname.startsWith('/easyresearch/project/');
    }
    return location.pathname === path || location.pathname.startsWith(path.split('?')[0]);
  };

  return (
    <aside
      className="hidden md:flex flex-col bg-white/80 backdrop-blur-sm fixed left-0 top-14 bottom-0 w-56 z-40"
      style={{ borderRight: '1px solid rgba(16,185,129,0.08)' }}
    >
      <div className="flex-1 flex flex-col py-2 overflow-y-auto">
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  active
                    ? 'text-emerald-700 bg-gradient-to-r from-emerald-50 to-teal-50'
                    : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2 : 1.5} className={active ? 'text-emerald-600' : ''} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-stone-100">
          {user && (
            <div className="mb-3 px-3">
              <p className="text-[12px] font-medium text-stone-700 truncate">
                {user.email}
              </p>
              <p className="text-[11px] text-stone-400">Researcher</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-[13px] font-medium text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <LogOut size={18} strokeWidth={1.5} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;