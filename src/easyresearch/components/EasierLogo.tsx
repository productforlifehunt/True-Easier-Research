import React from 'react';

/**
 * Easier Research Logo — crisp SVG vector
 * L-shaped chart axis frame + 2 ascending bars + final bar as letter "E"
 * Emerald-to-teal gradient for modern, premium feel
 */
const EasierLogo: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#14b8a6" />
      </linearGradient>
      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="80%" stopColor="#0d9488" />
      </linearGradient>
    </defs>

    {/* L-shaped axis frame */}
    <path
      d="M8 6 L8 54 L58 54"
      stroke="url(#logoGrad)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Bar 1 — shortest */}
    <rect x="16" y="36" width="9" height="14" rx="2" fill="url(#barGrad)" />

    {/* Bar 2 — medium */}
    <rect x="29" y="24" width="9" height="26" rx="2" fill="url(#barGrad)" />

    {/* Bar 3 — tallest, shaped as "E" */}
    {/* Vertical stroke of E */}
    <rect x="42" y="12" width="4" height="38" rx="1" fill="url(#barGrad)" />
    {/* Top horizontal of E */}
    <rect x="42" y="12" width="12" height="3.5" rx="1" fill="url(#barGrad)" />
    {/* Middle horizontal of E */}
    <rect x="42" y="29" width="10" height="3.5" rx="1" fill="url(#barGrad)" />
    {/* Bottom horizontal of E */}
    <rect x="42" y="46.5" width="12" height="3.5" rx="1" fill="url(#barGrad)" />
  </svg>
);

export default EasierLogo;
