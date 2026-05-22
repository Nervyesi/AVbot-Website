import React from 'react';

/**
 * HeroCenterpiece.
 *
 * Code-generated cinematic gold motif sitting behind the logo. Three
 * counter-rotating SVG orbital rings with travelling gold "node" dots, a
 * breathing radial core, a hot white-gold inner spot, and a faint outer
 * halo. Pure CSS animation on SVG transforms, so the entire effect is
 * GPU-friendly and effectively free at 60fps.
 */
export default function HeroCenterpiece() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'clamp(420px, 60vw, 780px)',
        aspectRatio: '1 / 1',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Outer atmospheric halo (static, large, soft) */}
      <div
        style={{
          position: 'absolute',
          inset: '6%',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(200,168,78,0.08) 0%, rgba(148,115,13,0.04) 38%, transparent 70%)',
          filter: 'blur(28px)',
        }}
      />

      {/* Ring 1 (outermost, slowest) */}
      <svg
        viewBox="0 0 400 400"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          animation: 'av-orbit-ccw 70s linear infinite',
        }}
      >
        <defs>
          <radialGradient id="hc-node">
            <stop offset="0%"  stopColor="#fff5cf" stopOpacity="1" />
            <stop offset="55%" stopColor="#e8c869" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#94730D" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle
          cx="200" cy="200" r="195"
          stroke="rgba(200,168,78,0.18)"
          strokeWidth="1" fill="none"
          strokeDasharray="80 38"
          vectorEffect="non-scaling-stroke"
        />
        {/* Travelling node along this ring */}
        <circle cx="200" cy="5" r="5" fill="url(#hc-node)" opacity="0.85" />
      </svg>

      {/* Ring 2 (middle, contra-rotating) */}
      <svg
        viewBox="0 0 400 400"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          animation: 'av-orbit-cw 46s linear infinite',
        }}
      >
        <circle
          cx="200" cy="200" r="148"
          stroke="rgba(200,168,78,0.32)"
          strokeWidth="1.5" fill="none"
          strokeDasharray="130 70"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="200" cy="52" r="4" fill="url(#hc-node)" opacity="0.9" />
        <circle cx="200" cy="348" r="3" fill="url(#hc-node)" opacity="0.7" />
      </svg>

      {/* Ring 3 (inner, brighter, faster) */}
      <svg
        viewBox="0 0 400 400"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          animation: 'av-orbit-ccw 26s linear infinite',
        }}
      >
        <circle
          cx="200" cy="200" r="108"
          stroke="rgba(232,200,105,0.5)"
          strokeWidth="2" fill="none"
          strokeDasharray="50 70"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="200" cy="92" r="3.5" fill="url(#hc-node)" opacity="1" />
      </svg>

      {/* Inner faint solid ring (no rotation; reads as a horizon) */}
      <div
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '36%', aspectRatio: '1 / 1',
          borderRadius: '50%',
          border: '1px solid rgba(232,200,105,0.42)',
          boxShadow:
            '0 0 28px rgba(232,200,105,0.32), inset 0 0 22px rgba(232,200,105,0.18)',
        }}
      />

      {/* Breathing radial core */}
      <div
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '52%', aspectRatio: '1 / 1',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(248,225,138,0.85) 0%, rgba(200,168,78,0.55) 28%, rgba(148,115,13,0.22) 56%, transparent 100%)',
          filter: 'blur(10px)',
          animation: 'av-core-pulse 4.2s ease-in-out infinite',
        }}
      />

      {/* Hot inner spot */}
      <div
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '14%', aspectRatio: '1 / 1',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, #fffdf2 0%, #fbe9ad 38%, rgba(232,200,105,0.55) 70%, transparent 100%)',
          filter: 'blur(3px)',
          animation: 'av-core-pulse 2.6s ease-in-out infinite',
        }}
      />
    </div>
  );
}
