import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className = '',
  style = {}
}) => (
  <div
    className={`skeleton ${className}`}
    style={{
      width,
      height,
      borderRadius,
      backgroundColor: '#f3f4f6',
      background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style
    }}
  />
);

export const HelperCardSkeleton: React.FC = () => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  }}>
    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
      <Skeleton width={80} height={80} borderRadius="50%" />
      <div style={{ flex: 1 }}>
        <Skeleton width="60%" height={24} style={{ marginBottom: '8px' }} />
        <Skeleton width="40%" height={16} style={{ marginBottom: '4px' }} />
        <Skeleton width="50%" height={16} />
      </div>
    </div>
    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
      <Skeleton width={60} height={24} borderRadius="12px" />
      <Skeleton width={70} height={24} borderRadius="12px" />
      <Skeleton width={80} height={24} borderRadius="12px" />
    </div>
    <Skeleton height={60} style={{ marginBottom: '12px' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Skeleton width={100} height={24} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <Skeleton width={80} height={36} borderRadius="6px" />
        <Skeleton width={80} height={36} borderRadius="6px" />
      </div>
    </div>
  </div>
);

export const ServiceCardSkeleton: React.FC = () => (
  <div style={{
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    textAlign: 'center'
  }}>
    <div style={{
      width: '60px',
      height: '60px',
      margin: '0 auto 16px',
      borderRadius: '20px',
      overflow: 'hidden'
    }}>
      <Skeleton width="100%" height="100%" />
    </div>
    <Skeleton width="70%" height={20} style={{ margin: '0 auto 8px' }} />
    <Skeleton width="90%" height={14} style={{ margin: '0 auto' }} />
  </div>
);

export const ListItemSkeleton: React.FC = () => (
  <div style={{
    padding: '16px',
    backgroundColor: 'white',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  }}>
    <Skeleton width={48} height={48} borderRadius="8px" />
    <div style={{ flex: 1 }}>
      <Skeleton width="30%" height={18} style={{ marginBottom: '6px' }} />
      <Skeleton width="50%" height={14} />
    </div>
    <Skeleton width={80} height={32} borderRadius="6px" />
  </div>
);

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 4 }) => (
  <tr>
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} style={{ padding: '12px' }}>
        <Skeleton height={16} />
      </td>
    ))}
  </tr>
);

export default Skeleton;
