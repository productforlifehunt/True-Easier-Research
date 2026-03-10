import React from 'react';

/**
 * Easier Research Logo — crisp SVG vector
 * L-shaped chart axis frame + 2 ascending bars + final bar as letter "E"
 * Premium emerald-to-teal gradient with silver/white highlights for modern commercial feel
 */
const EasierLogo: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => {
  // Unique ID prefix to avoid SVG gradient conflicts when multiple logos render
  const uid = 'el';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Axis frame — subtle silver-to-emerald */}
        <linearGradient id={`${uid}-axis`} x1="8" y1="6" x2="58" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c0c9c4" />
          <stop offset="40%" stopColor="#94a3a8" />
          <stop offset="100%" stopColor="#6b8076" />
        </linearGradient>

        {/* Bar gradient — emerald with bright white highlight at top */}
        <linearGradient id={`${uid}-bar`} x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="15%" stopColor="#34d399" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* E gradient — same feel but slightly shifted for depth */}
        <linearGradient id={`${uid}-e`} x1="42" y1="10" x2="56" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="20%" stopColor="#34d399" />
          <stop offset="60%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Subtle white sheen overlay */}
        <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* L-shaped axis frame — silver/slate feel */}
      <path
        d="M8 6 L8 54 L58 54"
        stroke={`url(#${uid}-axis)`}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Bar 1 — shortest */}
      <rect x="16" y="36" width="9" height="14" rx="2" fill={`url(#${uid}-bar)`} />
      <rect x="16" y="36" width="9" height="7" rx="2" fill={`url(#${uid}-sheen)`} />

      {/* Bar 2 — medium */}
      <rect x="29" y="24" width="9" height="26" rx="2" fill={`url(#${uid}-bar)`} />
      <rect x="29" y="24" width="9" height="13" rx="2" fill={`url(#${uid}-sheen)`} />

      {/* Bar 3 / Letter "E" — same bar width (9px) for consistency */}
      {/* Vertical stroke of E */}
      <rect x="42" y="12" width="9" height="38" rx="2" fill={`url(#${uid}-e)`} />
      <rect x="42" y="12" width="9" height="19" rx="2" fill={`url(#${uid}-sheen)`} />
      {/* Top horizontal of E */}
      <rect x="51" y="12" width="5" height="4" rx="1" fill={`url(#${uid}-e)`} />
      {/* Middle horizontal of E */}
      <rect x="51" y="29" width="4" height="4" rx="1" fill={`url(#${uid}-e)`} />
      {/* Bottom horizontal of E */}
      <rect x="51" y="46" width="5" height="4" rx="1" fill={`url(#${uid}-e)`} />
    </svg>
  );
};

export default EasierLogo;
