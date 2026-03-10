import React from 'react';

/**
 * Easier Research Logo — crisp SVG vector
 * L-shaped chart axis frame (emerald) + 2 ascending bars + final bar as letter "E"
 * E horizontals are half the bar width (4.5px) for a refined, proportional look
 * E extends wider to match natural letter "E" proportions
 */
const EasierLogo: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => {
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
        {/* Main bar gradient — emerald with depth */}
        <linearGradient id={`${uid}-bar`} x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="20%" stopColor="#34d399" />
          <stop offset="55%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Axis frame gradient — emerald tones */}
        <linearGradient id={`${uid}-axis`} x1="8" y1="6" x2="58" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Subtle white sheen for gloss */}
        <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* L-shaped axis frame — emerald gradient */}
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

      {/* Bar 3 / Letter "E" — vertical stroke same 9px as other bars */}
      <rect x="42" y="12" width="9" height="38" rx="2" fill={`url(#${uid}-bar)`} />
      <rect x="42" y="12" width="9" height="19" rx="2" fill={`url(#${uid}-sheen)`} />

      {/* E horizontals — 4.5px thick (half of bar width), wider reach for natural E shape */}
      {/* Top bar */}
      <rect x="49" y="12" width="11" height="4.5" rx="1.5" fill={`url(#${uid}-bar)`} />
      <rect x="49" y="12" width="11" height="2.25" rx="1.5" fill={`url(#${uid}-sheen)`} />
      {/* Middle bar */}
      <rect x="49" y="28.75" width="9" height="4.5" rx="1.5" fill={`url(#${uid}-bar)`} />
      <rect x="49" y="28.75" width="9" height="2.25" rx="1.5" fill={`url(#${uid}-sheen)`} />
      {/* Bottom bar */}
      <rect x="49" y="45.5" width="11" height="4.5" rx="1.5" fill={`url(#${uid}-bar)`} />
      <rect x="49" y="45.5" width="11" height="2.25" rx="1.5" fill={`url(#${uid}-sheen)`} />
    </svg>
  );
};

export default EasierLogo;
