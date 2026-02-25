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

  const SidebarContent = () => (
    <>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active ? 'bg-green-50' : ''
              }`}
              onMouseEnter={(e) => !active && (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
              onMouseLeave={(e) => !active && (e.currentTarget.style.backgroundColor = 'transparent')}
              style={{
                color: active ? 'var(--color-green)' : 'var(--text-secondary)'
              }}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-3 py-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
        {user && !collapsed && (
          <div className="mb-4 px-4">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {user.email}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Researcher Account
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          style={{ color: 'var(--text-secondary)' }}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={20} />
          {!collapsed && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Toggle Button - Shows in header area on mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-white rounded-lg shadow-md"
        style={{ marginTop: '64px' }}
      >
        <Menu size={24} style={{ color: 'var(--text-primary)' }} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-[70] bg-black/50"
          onClick={() => setMobileOpen(false)}
        >
          <div 
            className="w-64 h-full bg-white flex flex-col pt-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pb-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex items-center gap-2">
                <BarChart3 style={{ color: 'var(--color-green)' }} size={24} />
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>EasierResearch</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 flex flex-col py-4">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar - positioned below header */}
      <aside 
        className={`hidden lg:flex flex-col bg-white fixed left-0 top-16 bottom-0 transition-all duration-300 z-40 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
        style={{ borderRight: '1px solid var(--border-light)' }}
      >
        {onToggle && (
          <button
            onClick={onToggle}
            className="absolute -right-3 top-6 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
            style={{ border: '1px solid var(--border-light)' }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
        <div className="flex-1 flex flex-col py-4 overflow-y-auto">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
