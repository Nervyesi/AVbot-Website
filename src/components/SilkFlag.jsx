import React, { useEffect, useRef } from 'react';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  PlaneGeometry,
  Mesh,
  MeshStandardMaterial,
  DirectionalLight,
  HemisphereLight,
  ACESFilmicToneMapping,
  DoubleSide,
  Color,
} from 'three';

/**
 * SilkFlag (Three.js).
 *
 * A high-subdivision PlaneGeometry rendered with a MeshStandardMaterial in
 * deep black with a soft warm emissive floor. Each frame the vertices are
 * displaced on Z (and a touch of Y) by layered traveling sine waves whose
 * amplitude ramps quadratically from zero at the pinned LEFT edge to maximum
 * at the free right edge. After moving vertices we call
 * geometry.computeVertexNormals() so the lighting reacts to every fold,
 * which is what produces real raking-light silk.
 *
 * One warm gold DirectionalLight rakes the surface from the upper-left back,
 * a deeper-gold fill comes from the opposite side, and a very dim warm
 * HemisphereLight keeps the troughs from going pure dead black. ACES tone
 * mapping ties the highlights together with that cinematic film look.
 *
 * Wind:
 *   ambient   layered sines run at all times so the cloth always undulates
 *             softly. Amplitudes are scaled by an edge factor squared, so
 *             ripples propagate pole to free edge instead of flapping
 *             uniformly.
 *   cursor    raw pointer velocity is smoothed into a wind-strength
 *             multiplier (baseline 0.7, ceiling ~2.7) with 0.93 inertia and
 *             a raw-velocity decay at 0.86 each frame. A separate eased
 *             phase shift driven by cursor X velocity biases the wave
 *             direction subtly so the wind reads as coming from where the
 *             cursor moves.
 *
 * Lifecycle hygiene:
 *   ResizeObserver keeps camera + renderer in sync with the parent.
 *   IntersectionObserver pauses the rAF loop when the flag scrolls out of
 *   view. dispose() is called on the geometry, material, and renderer on
 *   unmount; the canvas is removed from the DOM. Listeners are cleaned up.
 *
 * Overlay sync:
 *   onTick({ tx, ty, skew }) is called once per frame with the average
 *   displacement of nine tracked central vertices. The payload object is
 *   reused across frames so there are no per-frame allocations.
 */
export default function SilkFlag({ onTick, segments }) {
  // Hold the live onTick callback in a ref so changes to the prop never
  // re-init the Three.js scene.
  const onTickRef = useRef(onTick);
  useEffect(() => { onTickRef.current = onTick; }, [onTick]);

  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const hasHover = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(hover: hover)').matches
      : true;

    // Lower segment count for touch devices (graceful mobile degradation).
    const SEG_X = segments?.x ?? (hasHover ? 48 : 32);
    const SEG_Y = segments?.y ?? (hasHover ? 32 : 20);
    const VERTS_X = SEG_X + 1; // one more vertex than segments

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(new Color(0x000000), 0); // transparent
    container.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      display: 'block',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
    });

    // ── Scene + Camera ────────────────────────────────────────────────────
    const scene = new Scene();
    const camera = new PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 4.5);
    camera.lookAt(0, 0, 0);

    // ── Geometry + initial positions snapshot ─────────────────────────────
    const W_WORLD = 4.4;
    const H_WORLD = 2.7;
    const geo = new PlaneGeometry(W_WORLD, H_WORLD, SEG_X, SEG_Y);
    const posAttr = geo.attributes.position;
    const posArr = posAttr.array;
    const vCount = posArr.length / 3;
    const original = new Float32Array(posArr); // copy of rest positions

    // ── Material: deep black satin ────────────────────────────────────────
    const mat = new MeshStandardMaterial({
      color: 0x080808,
      metalness: 0.45,
      roughness: 0.42,
      emissive: 0x0e0700,
      emissiveIntensity: 0.7,
      side: DoubleSide,
    });

    // ── Mesh, posed at a flattering 3D angle ──────────────────────────────
    const mesh = new Mesh(geo, mat);
    mesh.rotation.y = -0.18;   // ~10 degrees, pole comes slightly forward
    mesh.rotation.z = -0.025;  // ~1.5 degrees, subtle hang tilt
    scene.add(mesh);

    // ── Lights: raking gold key + opposite-side fill + warm hemisphere ────
    const keyLight = new DirectionalLight(0xf3d690, 3.2);
    keyLight.position.set(-2.4, 3.0, 3.5);
    scene.add(keyLight);

    const fillLight = new DirectionalLight(0xc89a1f, 0.85);
    fillLight.position.set(2.5, -1.2, 2.0);
    scene.add(fillLight);

    const hemi = new HemisphereLight(0x40300a, 0x050300, 0.4);
    scene.add(hemi);

    // ── Indices used to sample displacement for the overlay sync ──────────
    const trackedIndices = [];
    for (let j = 1; j <= 3; j++) {
      for (let i = 1; i <= 3; i++) {
        const xi = Math.round(SEG_X * (0.30 + (i - 1) * 0.20));
        const yi = Math.round(SEG_Y * (0.30 + (j - 1) * 0.20));
        trackedIndices.push(yi * VERTS_X + xi);
      }
    }
    const trackedCount = trackedIndices.length;

    // ── Resize handling ──────────────────────────────────────────────────
    const resize = () => {
      const w = container.clientWidth  || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // ── Pointer + wind state ─────────────────────────────────────────────
    let mouseClientVx = 0;
    let mouseClientVy = 0;
    let prevX = 0, prevY = 0;
    let pointerKnown = false;
    let windStrength = 0.85;       // baseline ambient strength
    let windPhaseShift = 0;        // smoothed directional bias from cursor X

    const onPointerMove = (e) => {
      if (!pointerKnown) {
        prevX = e.clientX; prevY = e.clientY;
        pointerKnown = true;
        return;
      }
      mouseClientVx = e.clientX - prevX;
      mouseClientVy = e.clientY - prevY;
      prevX = e.clientX; prevY = e.clientY;
    };
    if (hasHover) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    }

    // ── Pause when the container is offscreen ─────────────────────────────
    let visible = true;
    let frame = null;

    const io = new IntersectionObserver(([entry]) => {
      const wasVisible = visible;
      visible = entry.isIntersecting;
      // Resume the loop if we just became visible and the loop was paused.
      if (visible && !wasVisible && frame === null) {
        frame = requestAnimationFrame(tick);
      }
    }, { threshold: 0 });
    io.observe(container);

    // ── Reused payload object so onTick allocates nothing per frame ───────
    const payload = { tx: 0, ty: 0, skew: 0 };

    const startT = performance.now();

    function tick(now) {
      if (!visible) {
        frame = null;
        return;
      }
      const elapsed = (now - startT) * 0.001;

      // Smooth wind toward target derived from cursor speed.
      const speed = Math.hypot(mouseClientVx, mouseClientVy);
      const targetStrength = 0.85 + Math.min(2.0, speed * 0.045);
      windStrength = windStrength * 0.93 + targetStrength * 0.07;

      // Directional phase bias from cursor x velocity.
      const targetPhase = mouseClientVx * 0.018;
      windPhaseShift = windPhaseShift * 0.88 + targetPhase * 0.12;

      // Decay raw velocity so a parked cursor returns wind to baseline.
      mouseClientVx *= 0.86;
      mouseClientVy *= 0.86;

      const t = elapsed + windPhaseShift;

      // ── Displace every vertex ───────────────────────────────────────────
      // Pole at -W/2 (left), free edge at +W/2 (right). edge in [0..1].
      // amp = edge^2 makes the curve aggressive: pole barely moves, free
      // edge billows.
      const invW = 1 / W_WORLD;
      const halfW = W_WORLD * 0.5;
      const halfH = H_WORLD * 0.5;
      for (let i = 0; i < vCount; i++) {
        const base = i * 3;
        const ox = original[base];
        const oy = original[base + 1];

        const edge = (ox + halfW) * invW; // 0 at pole, 1 at free edge
        const amp = edge * edge;

        // Layered traveling waves (sum of three).
        const w =
          Math.sin(ox * 1.7 - t * 1.40 + oy * 0.25) * 0.30 * amp +
          Math.sin(ox * 2.7 - t * 2.10 - oy * 0.50) * 0.15 * amp +
          Math.sin(ox * 4.5 - t * 3.00 + oy * 0.80) * 0.06 * amp;

        // Gentle vertical sag scaled by edge factor so the lower-free
        // corner droops with weight. A small wave on Y too.
        const lower = oy < 0 ? -oy / halfH : 0; // 0..1 in lower half
        const sagY =
          -edge * 0.16
          - lower * edge * 0.12
          + Math.sin(t * 0.7 + ox * 0.5) * 0.025 * edge;

        // Write the displaced positions.
        posArr[base]     = ox;
        posArr[base + 1] = oy + sagY * windStrength * 0.6;
        posArr[base + 2] = w * windStrength;
      }
      posAttr.needsUpdate = true;
      // Recompute per-vertex normals so lighting reacts to every fold.
      // This is the line that turns shaded quads into real silk.
      geo.computeVertexNormals();

      // ── Sample tracked vertices for the HTML overlay sync ───────────────
      let sumZ = 0, sumY = 0;
      for (let k = 0; k < trackedCount; k++) {
        const b = trackedIndices[k] * 3;
        sumZ += posArr[b + 2];
        sumY += posArr[b + 1] - original[b + 1];
      }
      const avgZ = sumZ / trackedCount;
      const avgY = sumY / trackedCount;

      payload.tx = avgZ * 12;   // amplify so a few px of sway is visible
      payload.ty = avgY * 7;
      payload.skew = avgZ * 1.2; // degrees (parent clamps tightly)

      const cb = onTickRef.current;
      if (cb) cb(payload);

      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      if (hasHover) window.removeEventListener('pointermove', onPointerMove);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      const el = renderer.domElement;
      if (el && el.parentNode) el.parentNode.removeChild(el);
    };
    // segments is the only re-init trigger; onTick is stored in a ref.
  }, [segments]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
