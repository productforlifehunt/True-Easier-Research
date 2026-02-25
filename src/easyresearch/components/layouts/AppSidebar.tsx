import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import {
  BarChart3, LayoutDashboard, Plus, Users, Settings,
  LogOut, FileText, Menu, X, ChevronLeft, ChevronRight
} from 'lucide-react';

interface AppSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed = false, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/easyresearch');
  };

  const navItems = [
    { path: '/easyresearch/dashboard', label: 'Projects', icon: LayoutDashboard },
    { path: '/easyresearch/dashboard?create=true', label: 'New Project', icon: Plus },
    { path: '/easyresearch/participants', label: 'Participants', icon: Users },
    { path: '/easyresearch/responses', label: 'Responses', icon: FileText },
    { path: '/easyresearch/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/easyresearch/settings', label: 'Settings', icon: Settings }
  ];

  const isActive = (path: string) => {
    if (path === '/easyresearch/dashboard') {
      return location.pathname === path || location.pathname.startsWith('/easyresearch/project/');
    }
    return location.pathname === path || location.pathname.startsWith(path.split('?')[0]);
  };

  const NavContent = () => (
    <>
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                active
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-slate-100">
        {user && !collapsed && (
          <div className="mb-3 px-3">
            <p className="text-[12px] font-medium text-slate-700 truncate">
              {user.email}
            </p>
            <p className="text-[11px] text-slate-400">Researcher</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[13px] font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={18} strokeWidth={1.5} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-[60px] left-3 z-[60] p-2 bg-white rounded-lg shadow-sm border border-slate-100"
      >
        <Menu size={20} className="text-slate-500" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[70] bg-black/20 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-60 h-full bg-white flex flex-col pt-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <span className="text-white text-[11px] font-bold">E</span>
                </div>
                <span className="text-[14px] font-semibold text-slate-900">Easier</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-50">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="flex-1 flex flex-col py-2">
              <NavContent />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white fixed left-0 top-14 bottom-0 transition-all duration-200 z-40 border-r border-slate-100 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        {onToggle && (
          <button
            onClick={onToggle}
            className="absolute -right-3 top-5 w-6 h-6 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            {collapsed ? <ChevronRight size={12} className="text-slate-400" /> : <ChevronLeft size={12} className="text-slate-400" />}
          </button>
        )}
        <div className="flex-1 flex flex-col py-2 overflow-y-auto">
          <NavContent />
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
