import React, { useEffect, useRef, useState } from 'react';

/**
 * BlackHoleVideo.
 *
 * A fixed full-bleed black hole video that sits behind the page. On desktop
 * (and any pointer-hover device) the video's currentTime is driven by the
 * page scroll progress: as the user scrolls past the scrub range, the
 * camera flies toward and around the black hole. We lerp toward the target
 * time each frame so the seek feels buttery, not jumpy.
 *
 * On touch / no-hover devices browsers throttle and unreliably honour
 * currentTime writes, so we fall back to a muted looping autoplay that
 * gives a continuous moving backdrop without scrub jank.
 *
 * Encode notes (handled in the public/blackhole.mp4 file itself):
 *   -an  audio stripped
 *   -g 6 -keyint_min 6 -sc_threshold 0  dense keyframes for smooth seek
 *   -movflags +faststart  moov atom up front for instant streaming
 */
export default function BlackHoleVideo({
  src = '/blackhole.mp4',
  poster = '/blackhole-poster.jpg',
  // Scrub range expressed as multiples of viewport height. The full video
  // (~60s) scrubs across this many viewport heights of scroll, so the user
  // gets a slow, cinematic fly-in instead of blowing through it in one
  // page-down.
  scrollRangeVH = 6,
}) {
  const videoRef     = useRef(null);
  const [scrubMode, setScrubMode] = useState(true);

  // Decide scrub vs autoplay-loop based on pointer/hover capability. iOS
  // Safari in particular cannot reliably scrub via currentTime writes from
  // a scroll handler, so we let it play normally there.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setScrubMode(mq.matches);
    const handler = (e) => setScrubMode(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  // Scroll-linked currentTime scrubbing on the desktop path.
  useEffect(() => {
    if (!scrubMode) return;
    const video = videoRef.current;
    if (!video) return;

    let duration = 0;
    let metaReady = false;

    const onMeta = () => {
      duration = video.duration || 0;
      if (!isFinite(duration) || duration <= 0) return;
      metaReady = true;
      // Pin to the first frame initially so the hero has a stable backdrop
      // before the user scrolls.
      try { video.currentTime = 0; } catch (_) {}
    };
    if (video.readyState >= 1) onMeta();
    else video.addEventListener('loadedmetadata', onMeta);

    let target = 0;
    let current = 0;
    let frame = null;
    let lastWrite = -1;

    const computeTarget = () => {
      // Total scrub distance in pixels: scrollRangeVH * viewport height.
      const vh = window.innerHeight || 1;
      const range = Math.max(1, scrollRangeVH * vh);
      const p = Math.min(1, Math.max(0, window.scrollY / range));
      target = metaReady ? p * duration : 0;
    };

    const tick = () => {
      // Ease current time toward the scroll-driven target. This gives the
      // Apple-style buttery scrub instead of a chattery direct write.
      const delta = target - current;
      current += delta * 0.18;
      if (Math.abs(delta) < 0.002) current = target;

      if (metaReady && Math.abs(current - lastWrite) > 1 / 60) {
        try {
          video.currentTime = current;
          lastWrite = current;
        } catch (_) {
          // some browsers throw if metadata not yet ready; ignored
        }
      }
      frame = requestAnimationFrame(tick);
    };

    const onScroll = () => { computeTarget(); };
    const onResize = () => { computeTarget(); };

    computeTarget();
    frame = requestAnimationFrame(tick);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      video.removeEventListener('loadedmetadata', onMeta);
    };
  }, [scrubMode, scrollRangeVH]);

  // Touch path: regular muted autoplay loop. Some Android browsers need a
  // play() kick after metadata loads.
  useEffect(() => {
    if (scrubMode) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.loop = true;
    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };
    if (video.readyState >= 2) tryPlay();
    else video.addEventListener('canplay', tryPlay, { once: true });
    return () => {
      try { video.pause(); } catch (_) {}
    };
  }, [scrubMode]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        backgroundColor: '#000',
        overflow: 'hidden',
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        playsInline
        preload="auto"
        // autoplay/loop applied imperatively only on touch path
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          // Brighten + slight contrast lift so the disk reads bold over the
          // page-level dark scrim that protects the hero copy.
          filter: 'saturate(1.05) contrast(1.04)',
        }}
      />
    </div>
  );
}
