import React from 'react';

/**
 * ForeSafe AI Brand Logo & Emblem
 * Represents Autonomous Predictive Security, Neural Defect Intelligence, and Risk Prevention.
 * 
 * @param {string|number} size - 'sm' (28px), 'md' (36px), 'lg' (48px), 'xl' (64px), or numeric pixel size.
 * @param {boolean} withText - Whether to render the 'ForeSafe AI' wordmark.
 * @param {boolean} withTagline - Whether to render the sub-header tagline.
 * @param {boolean} animated - Adds subtle hover glow and radar pulse.
 */
export const ForeSafeLogo = ({
  size = 'md',
  withText = true,
  withTagline = false,
  animated = true,
  className = '',
  style = {},
}) => {
  // Compute pixel dimensions
  let iconSize = 36;
  let fontSize = '1.22rem';
  let badgeSize = '0.72rem';
  let taglineSize = '0.62rem';
  let gap = '10px';

  if (typeof size === 'number') {
    iconSize = size;
    fontSize = `${size * 0.42}px`;
    badgeSize = `${size * 0.26}px`;
    taglineSize = `${size * 0.22}px`;
  } else {
    switch (size) {
      case 'xs':
        iconSize = 22;
        fontSize = '0.95rem';
        badgeSize = '0.58rem';
        taglineSize = '0.5rem';
        gap = '6px';
        break;
      case 'sm':
        iconSize = 28;
        fontSize = '1.05rem';
        badgeSize = '0.64rem';
        taglineSize = '0.55rem';
        gap = '8px';
        break;
      case 'lg':
        iconSize = 48;
        fontSize = '1.55rem';
        badgeSize = '0.86rem';
        taglineSize = '0.68rem';
        gap = '14px';
        break;
      case 'xl':
        iconSize = 64;
        fontSize = '2.1rem';
        badgeSize = '1.1rem';
        taglineSize = '0.78rem';
        gap = '16px';
        break;
      case 'md':
      default:
        iconSize = 36;
        fontSize = '1.22rem';
        badgeSize = '0.72rem';
        taglineSize = '0.62rem';
        gap = '10px';
        break;
    }
  }

  const uniqueId = `fs-grad-${iconSize}`;

  return (
    <div
      className={`foresave-logo-container ${animated ? 'foresave-logo-animated' : ''} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: gap,
        userSelect: 'none',
        textDecoration: 'none',
        ...style,
      }}
    >
      {/* Visual Emblem (Faceted Predictive Security Shield + Neural Circuit Nodes) */}
      <div
        style={{
          position: 'relative',
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Ambient Glow Backdrop */}
        <div
          style={{
            position: 'absolute',
            inset: '-10%',
            background: 'radial-gradient(circle at 50% 45%, rgba(0, 245, 212, 0.4) 0%, rgba(56, 189, 248, 0.15) 55%, transparent 75%)',
            borderRadius: '50%',
            filter: 'blur(6px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'relative',
            zIndex: 1,
            filter: 'drop-shadow(0 4px 12px rgba(0, 245, 212, 0.35))',
          }}
        >
          <defs>
            {/* Emerald to Ice Cyan Gradient */}
            <linearGradient id={`${uniqueId}-primary`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f5d4" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>

            {/* Deep Glass Shield Body Gradient */}
            <linearGradient id={`${uniqueId}-body`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#0a2238" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#040c17" stopOpacity="0.98" />
            </linearGradient>

            {/* Glowing Accent Stroke */}
            <linearGradient id={`${uniqueId}-glow`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f5d4" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            {/* Inner Core Gradient */}
            <radialGradient id={`${uniqueId}-core`} cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#00f5d4" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#040d1a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer Cyber Shield Base */}
          <path
            d="M50 8 L88 24 C88 56 72 78 50 92 C28 78 12 56 12 24 L50 8 Z"
            fill={`url(#${uniqueId}-body)`}
            stroke={`url(#${uniqueId}-primary)`}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />

          {/* Inner Safety Shield Glow Layer */}
          <path
            d="M50 16 L80 29 C80 54 67 71 50 82 C33 71 20 54 20 29 L50 16 Z"
            fill={`url(#${uniqueId}-core)`}
            stroke="rgba(0, 245, 212, 0.25)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />

          {/* Predictive Neural Pathway Circuit (Geometric 'F' & 'S' Interlock) */}
          {/* Top 'F' Horizontal Bar & Sensor Node */}
          <path
            d="M34 32 L68 32 M34 44 L58 44 M34 32 L34 68"
            stroke={`url(#${uniqueId}-glow)`}
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Forward Predictive Trajectory Vector (Ascending Arrow & Diamond Node) */}
          <path
            d="M48 68 L66 50 L58 50 M66 50 L66 58"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Predictive Security Sensor Nodes (Pulse Dots) */}
          <circle cx="68" cy="32" r="3.6" fill="#00f5d4" filter="drop-shadow(0 0 4px #00f5d4)" />
          <circle cx="58" cy="44" r="3" fill="#38bdf8" />
          <circle cx="34" cy="68" r="3.2" fill="#00f5d4" />
          <circle cx="50" cy="8" r="3" fill="#00f5d4" />
        </svg>
      </div>

      {/* Wordmark (Typography) */}
      {withText && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1.1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading, "Outfit", "Inter", sans-serif)',
                fontWeight: 800,
                fontSize: fontSize,
                letterSpacing: '-0.025em',
                background: 'linear-gradient(90deg, #ffffff 0%, #f0fdf4 60%, #e0f2fe 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ForeSafe
            </span>

            {/* AI Emerald Badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: badgeSize,
                fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                fontWeight: 800,
                letterSpacing: '0.04em',
                padding: '2px 6px',
                borderRadius: '5px',
                background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.22) 0%, rgba(56, 189, 248, 0.18) 100%)',
                border: '1px solid rgba(0, 245, 212, 0.5)',
                color: '#00f5d4',
                boxShadow: '0 0 10px rgba(0, 245, 212, 0.25)',
              }}
            >
              AI
            </span>
          </div>

          {/* Optional Tagline */}
          {withTagline && (
            <span
              style={{
                fontSize: taglineSize,
                fontFamily: 'var(--font-sans, "Inter", sans-serif)',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-dim, #5a7a97)',
                marginTop: '3px',
              }}
            >
              Predictive Defect Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ForeSafeLogo;
