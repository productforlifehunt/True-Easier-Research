import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Generate breadcrumb items from path
  const breadcrumbItems: BreadcrumbItem[] = [];
  
  // Always add home
  breadcrumbItems.push({ label: 'Home', path: '/humans-for-hire' });

  // Build remaining breadcrumbs
  let currentPath = '';
  pathnames.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip if it's the base humans-for-hire path
    if (segment === 'humans-for-hire') return;
    
    // Format label: capitalize and replace hyphens
    let label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Handle special cases
    if (segment === 'browse') label = 'Browse Helpers';
    if (segment === 'helper' && pathnames[index + 1]) label = 'Helper Profile';
    if (segment === 'auth') label = 'Sign In';
    if (segment === 'client' && pathnames[index + 1] === 'dashboard') label = 'Client Dashboard';
    if (segment === 'helper' && pathnames[index + 1] === 'dashboard') label = 'Helper Dashboard';
    
    // Don't add UUIDs or numeric IDs as breadcrumbs
    if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return;
    }
    
    breadcrumbItems.push({ label, path: currentPath });
  });

  // Don't show breadcrumb on home page
  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav 
      aria-label="Breadcrumb"
      style={{
        padding: '16px 0',
        backgroundColor: 'white',
        borderBottom: '1px solid #f3f4f6'
      }}
    >
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px' 
      }}>
        <ol style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          listStyle: 'none',
          margin: 0,
          padding: 0
        }}>
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const isFirst = index === 0;

            return (
              <li
                key={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {!isFirst && (
                  <ChevronRight 
                    size={14} 
                    style={{ color: '#d1d5db', flexShrink: 0 }} 
                  />
                )}
                
                {isLast ? (
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {isFirst && <Home size={16} />}
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#6b7280',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#10b981'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
                  >
                    {isFirst && <Home size={16} />}
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;
