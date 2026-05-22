import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * BlackHole.
 *
 * A real-time GLSL black hole rendered onto a fullscreen plane via three.js
 * ShaderMaterial. Inspired by Gargantua, restyled in the AVbot gold and
 * black brand palette.
 *
 * The fragment shader volume-marches a curved photon path through space
 * around a Schwarzschild-ish singularity, accumulating accretion-disk
 * brightness (a Keplerian-rotating gold plasma with two scales of fbm
 * turbulence and a Doppler asymmetry factor), painting in a thin photon
 * ring at ~1.5 R_s, and sampling a lensed starfield using the final ray
 * direction so the stars warp near the hole's edge. ACES filmic tone
 * mapping ties it together.
 *
 * Performance:
 *   - Pixel ratio capped at 1.4 desktop / 0.85 mobile.
 *   - 26 ray-march steps. Empirically smooth at 60fps on a typical laptop
 *     GPU at 1080p; mobile budgets covered by the lower pixel-ratio cap.
 *   - IntersectionObserver pauses the rAF loop when the hero scrolls
 *     offscreen so the GPU can rest.
 *   - Three.js geometry, material, and renderer disposed on unmount.
 */

const VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  uniform vec2  uRes;
  uniform float uTime;
  uniform float uAspect;
  uniform float uIntensity;

  #define PI       3.14159265359
  #define R_S      0.55
  #define DISK_IN  1.10
  #define DISK_OUT 4.20
  #define STEPS    26
  #define DT       0.22

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.55;
    mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = rot * p * 2.0;
      a *= 0.5;
    }
    return v;
  }

  // Accretion-disk emission colour for a point at disk radius r, angle in
  // the disk plane, at the current uTime. Returns a pre-multiplied light
  // contribution in HDR space (gets tonemapped at the end).
  vec3 diskEmission(float r, float angle) {
    float t = (r - DISK_IN) / (DISK_OUT - DISK_IN);
    if (t < 0.0 || t > 1.0) return vec3(0.0);

    // Keplerian-ish differential rotation. Inner orbits much faster.
    float omega = 0.75 / pow(max(r, 0.5), 1.1);
    float swirl = angle - uTime * omega * 4.6;

    // Two noise scales scrolling at different rates give the
    // multi-frequency plasma streak pattern.
    vec2 nA = vec2(swirl * 2.1, log(max(r, 0.1)) * 4.4 - uTime * 0.42);
    vec2 nB = vec2(swirl * 5.4, log(max(r, 0.1)) * 7.8 + uTime * 0.66);
    float n = fbm(nA) * 0.72 + fbm(nB) * 0.42;

    // Radial intensity profile. Hottest at the ISCO, fading out.
    float radial = pow(1.0 - t, 1.55);
    radial *= smoothstep(0.0, 0.08, t);   // soft inner edge
    radial *= smoothstep(1.0, 0.82, t);   // soft outer edge
    radial *= 0.45 + 0.75 * n;            // streaky modulation

    // Doppler beaming. The disk rotates in the +theta direction; the
    // side moving toward the viewer (camera at -z, so the side with
    // negative x for the parametrisation below) brightens.
    float doppler = 1.0 + 0.62 * sin(angle);
    doppler = pow(max(doppler, 0.0), 1.6);
    radial *= doppler;

    // Brand gold ramp. cHot near the inner edge fading down to cDeep
    // at the outer edge; cBright + cGold are the dominant mids.
    vec3 cHot    = vec3(1.20, 1.04, 0.86);
    vec3 cBright = vec3(0.98, 0.78, 0.40);
    vec3 cGold   = vec3(0.66, 0.50, 0.10);
    vec3 cDeep   = vec3(0.32, 0.22, 0.04);
    vec3 c;
    if (radial > 0.7)      c = mix(cBright, cHot,    (radial - 0.7) / 0.8);
    else if (radial > 0.3) c = mix(cGold,   cBright, (radial - 0.3) / 0.4);
    else                   c = mix(cDeep * 0.5, cGold, max(0.0, radial / 0.3));

    return c * radial * 1.55;
  }

  // Lensed starfield. Sample two scales of cell-based stars in spherical
  // direction coordinates; using the post-bending ray direction means
  // stars naturally warp near the hole's edge.
  vec3 stars(vec3 dir) {
    vec2 sUV = vec2(atan(dir.z, dir.x), asin(clamp(dir.y, -1.0, 1.0)));
    vec3 total = vec3(0.0);
    for (int s = 0; s < 2; s++) {
      float scale = 60.0 * (1.0 + float(s));
      vec2 cell = floor(sUV * scale);
      vec2 frac = fract(sUV * scale) - 0.5;
      float h = hash(cell + float(s) * 17.3);
      float starProb = step(0.988 + float(s) * 0.007, h);
      float d = length(frac);
      float st = starProb * smoothstep(0.045, 0.0, d);
      vec3 tint = mix(
        vec3(1.00, 0.96, 0.84),
        vec3(0.85, 0.93, 1.00),
        hash(cell + 11.7)
      );
      total += tint * st;
    }
    return total * 0.55;
  }

  vec3 aces(vec3 c) {
    c = (c * (2.51 * c + 0.03)) / (c * (2.43 * c + 0.59) + 0.14);
    return clamp(c, 0.0, 1.0);
  }

  void main() {
    // Center the UV. Height-normalised so the disk does not stretch with
    // aspect ratio; the camera FOV stays consistent.
    vec2 uv = (vUv - 0.5) * vec2(uAspect, 1.0) * 2.0;

    // Camera. We start above the disk plane (Y > 0) looking forward and
    // slightly down. The pitch rotation below tips the camera so the
    // disk presents as a near-edge-on ellipse, which is the iconic
    // black-hole composition.
    vec3 origin = vec3(0.0, 1.6, -6.5);
    vec3 dir    = normalize(vec3(uv.x, uv.y * 0.92 - 0.18, 1.65));

    float tilt = 0.46;
    float ct = cos(tilt);
    float st = sin(tilt);
    mat3 R = mat3(
      1.0, 0.0, 0.0,
      0.0,  ct, -st,
      0.0,  st,  ct
    );
    origin = R * origin;
    dir    = R * dir;

    vec3 pos   = origin;
    vec3 vel   = dir;
    vec3 accum = vec3(0.0);
    bool hitHorizon = false;

    // Volume ray-march. Each step bends the velocity toward the
    // singularity (gravitational lensing) and accumulates whatever
    // disk plasma it passes through. Photons that wander too close
    // to R_S fall in; photons that escape feed the starfield sample.
    for (int i = 0; i < STEPS; i++) {
      pos += vel * DT;
      float r = length(pos);
      if (r < R_S)  { hitHorizon = true; break; }
      if (r > 22.0) break;

      // Newtonian-style 1/r^3 bend gives a reasonable approximation of
      // the photon deflection without solving the geodesic equation.
      vec3 toCenter = -pos / r;
      float bend = 2.4 * R_S * R_S / (r * r * r);
      vel = normalize(vel + toCenter * bend);

      // Thin disk in Y (exp falloff away from the plane) intersected
      // with the radial in [DISK_IN, DISK_OUT] annulus. Accumulating
      // emission as a function of step length and disk density gives
      // the lensed arc over the top of the hole for free, because
      // rays bent past the hole pass through the disk on the far side.
      float rxz   = length(pos.xz);
      float dy    = exp(-abs(pos.y) * 13.0);
      float dr    = smoothstep(DISK_IN - 0.15, DISK_IN + 0.10, rxz)
                  * smoothstep(DISK_OUT + 0.30, DISK_OUT - 0.30, rxz);
      float dfac  = dy * dr;
      if (dfac > 0.002) {
        float ang = atan(pos.z, pos.x);
        accum += diskEmission(rxz, ang) * dfac * DT * 3.4;
      }

      // Photon ring: a thin sphere of light near 1.55 R_s.
      float ringD = r - R_S * 1.55;
      accum += vec3(1.00, 0.85, 0.52) * exp(-ringD * ringD * 65.0) * DT * 1.25;
    }

    vec3 col;
    if (hitHorizon) {
      col = vec3(0.0);
    } else {
      // Stars are sampled by the final, lensed ray direction. Rays that
      // skim the hole pick up streaked star light, selling the warp.
      col = stars(vel);
      col += accum;
    }

    // Subtle global vignette so the outer corners settle into darkness.
    float vig = 1.0 - 0.35 * pow(length(uv) * 0.32, 2.0);
    col *= vig;

    // Exposure + ACES filmic + gentle gamma deepening.
    col *= 0.95 * uIntensity;
    col = aces(col);
    col = pow(col, vec3(0.92));

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function BlackHole({ intensity = 1.0 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(max-width: 860px)').matches
      : false;
    const maxPR = isMobile ? 0.85 : 1.4;
    const dpr = Math.min(maxPR, window.devicePixelRatio || 1);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(dpr);
    container.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      position: 'absolute',
      inset: '0',
      width:  '100%',
      height: '100%',
      display: 'block',
      pointerEvents: 'none',
    });

    const scene  = new THREE.Scene();
    const camera = new THREE.Camera(); // no projection; the vertex shader emits clip-space directly

    const uniforms = {
      uTime:      { value: 0 },
      uRes:       { value: new THREE.Vector2(1, 1) },
      uAspect:    { value: 1 },
      uIntensity: { value: intensity },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader:   VERT,
      fragmentShader: FRAG,
      depthTest:  false,
      depthWrite: false,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let width = 1, height = 1;
    const resize = () => {
      width  = container.clientWidth  || 1;
      height = container.clientHeight || 1;
      renderer.setSize(width, height, false);
      uniforms.uRes.value.set(width, height);
      uniforms.uAspect.value = width / height;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Pause when offscreen.
    let visible = true;
    let frame   = null;
    const io = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was && frame === null) {
        frame = requestAnimationFrame(tick);
      }
    });
    io.observe(container);

    const startT = performance.now();

    function tick(now) {
      if (!visible) { frame = null; return; }
      uniforms.uTime.value = (now - startT) * 0.001;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      const el = renderer.domElement;
      if (el && el.parentNode) el.parentNode.removeChild(el);
    };
  }, [intensity]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
