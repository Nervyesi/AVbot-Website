import React, { useEffect, useRef } from 'react';

/**
 * CursorGas. WebGL2 stable-fluid cursor fog.
 *
 * A real GPU fluid simulation (velocity field + dye/density field, semi-
 * Lagrangian advection, divergence-free projection via Jacobi pressure
 * iterations, vorticity confinement for swirl) rendered to low-res float
 * framebuffers and upscaled with bilinear smoothing for soft volumetric
 * edges. The cursor INJECTS velocity + gold dye along the interpolated path
 * between frames, so the fog reads as one continuous connected body rather
 * than stamped particles. Dissipation is tuned HIGH so the fog stays
 * localized and short-lived (no page flood) and emission only happens while
 * the cursor is moving.
 *
 * Technique: Pavel Dobryakov / GPU Gems "stable fluids". Raw WebGL2, no
 * three.js. Touch / no-hover devices and browsers without WebGL2 render
 * nothing (graceful no-op). pointer-events: none, behind nothing it blocks.
 */
export default function CursorGas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const hasHover = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(hover: hover)').matches
      : true;
    if (!hasHover) return; // touch / no cursor → no fog

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', {
      alpha: true, premultipliedAlpha: false, antialias: false,
      depth: false, stencil: false, preserveDrawingBuffer: false,
    });
    if (!gl) return; // WebGL2 unavailable → graceful no-op (no fog)

    // Float render targets. EXT_color_buffer_float is required to render to
    // RGBA16F/RG16F/R16F in WebGL2. If unavailable, bail gracefully.
    const floatExt = gl.getExtension('EXT_color_buffer_float');
    const halfFloatExt = gl.getExtension('EXT_color_buffer_half_float');
    if (!floatExt && !halfFloatExt) return;
    gl.getExtension('OES_texture_float_linear'); // best-effort linear filtering

    // ── Tunables ────────────────────────────────────────────────────────────
    const SIM_RESOLUTION       = 128;   // velocity grid (coarse = fast)
    const DYE_RESOLUTION       = 512;   // dye grid (fine + bilinear = soft)
    const DENSITY_DISSIPATION  = 3.2;   // HIGH → fog is short-lived, no flood
    const VELOCITY_DISSIPATION = 2.0;   // momentum bleeds off quickly → local
    const PRESSURE             = 0.8;
    const PRESSURE_ITERATIONS  = 18;
    const CURL                 = 30;    // vorticity confinement → swirl/billow
    const SPLAT_RADIUS         = 0.0022;// small → localized near cursor
    const SPLAT_FORCE          = 5800;  // cursor velocity → fluid momentum
    const DISPLAY_ALPHA        = 0.9;   // overall fog opacity (subtle/premium)
    const MAX_DT               = 0.0166666;

    // Brand gold. Body is the deep gold, with luminous highlights mixed in per
    // splat so the densest cores glow brighter.
    const GOLD_BODY      = [0.58, 0.45, 0.05];  // ~#94730D
    const GOLD_HIGHLIGHT = [0.91, 0.78, 0.41];  // ~#e8c869

    const dpr = Math.min(2, window.devicePixelRatio || 1);

    // ── Shaders ───────────────────────────────────────────────────────────
    const baseVertex = `#version 300 es
      precision highp float;
      in vec2 aPos;
      out vec2 vUv; out vec2 vL; out vec2 vR; out vec2 vT; out vec2 vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPos * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPos, 0.0, 1.0);
      }`;

    const clearShader = `#version 300 es
      precision highp float;
      in vec2 vUv; out vec4 fragColor;
      uniform sampler2D uTexture; uniform float value;
      void main () { fragColor = value * texture(uTexture, vUv); }`;

    const splatShader = `#version 300 es
      precision highp float;
      in vec2 vUv; out vec4 fragColor;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
      void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture(uTarget, vUv).xyz;
        fragColor = vec4(base + splat, 1.0);
      }`;

    const advectionShader = `#version 300 es
      precision highp float;
      in vec2 vUv; out vec4 fragColor;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform float dt;
      uniform float dissipation;
      void main () {
        vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
        vec4 result = texture(uSource, coord);
        float decay = 1.0 + dissipation * dt;
        fragColor = result / decay;
      }`;

    const divergenceShader = `#version 300 es
      precision highp float;
      in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
      out vec4 fragColor;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture(uVelocity, vL).x;
        float R = texture(uVelocity, vR).x;
        float T = texture(uVelocity, vT).y;
        float B = texture(uVelocity, vB).y;
        vec2 C = texture(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }
        float div = 0.5 * (R - L + T - B);
        fragColor = vec4(div, 0.0, 0.0, 1.0);
      }`;

    const curlShader = `#version 300 es
      precision highp float;
      in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
      out vec4 fragColor;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture(uVelocity, vL).y;
        float R = texture(uVelocity, vR).y;
        float T = texture(uVelocity, vT).x;
        float B = texture(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        fragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }`;

    const vorticityShader = `#version 300 es
      precision highp float;
      in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
      out vec4 fragColor;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;
      void main () {
        float L = texture(uCurl, vL).x;
        float R = texture(uCurl, vR).x;
        float T = texture(uCurl, vT).x;
        float B = texture(uCurl, vB).x;
        float C = texture(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 vel = texture(uVelocity, vUv).xy;
        vel += force * dt;
        vel = clamp(vel, -1000.0, 1000.0);
        fragColor = vec4(vel, 0.0, 1.0);
      }`;

    const pressureShader = `#version 300 es
      precision highp float;
      in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
      out vec4 fragColor;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      void main () {
        float L = texture(uPressure, vL).x;
        float R = texture(uPressure, vR).x;
        float T = texture(uPressure, vT).x;
        float B = texture(uPressure, vB).x;
        float divergence = texture(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        fragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }`;

    const gradientSubtractShader = `#version 300 es
      precision highp float;
      in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
      out vec4 fragColor;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture(uPressure, vL).x;
        float R = texture(uPressure, vR).x;
        float T = texture(uPressure, vT).x;
        float B = texture(uPressure, vB).x;
        vec2 velocity = texture(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        fragColor = vec4(velocity, 0.0, 1.0);
      }`;

    const displayShader = `#version 300 es
      precision highp float;
      in vec2 vUv; out vec4 fragColor;
      uniform sampler2D uTexture;
      uniform float alpha;
      void main () {
        vec3 c = texture(uTexture, vUv).rgb;
        float a = clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0);
        fragColor = vec4(c, a * alpha);
      }`;

    // ── GL helpers ──────────────────────────────────────────────────────────
    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('[CursorGas] shader error:', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, baseVertex);
    if (!vs) return;

    function program(fragSrc) {
      const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
      if (!fs) return null;
      const p = gl.createProgram();
      gl.attachShader(p, vs);
      gl.attachShader(p, fs);
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        console.error('[CursorGas] link error:', gl.getProgramInfoLog(p));
        return null;
      }
      const uniforms = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const name = gl.getActiveUniform(p, i).name;
        uniforms[name] = gl.getUniformLocation(p, name);
      }
      return { program: p, uniforms };
    }

    const progs = {
      clear:    program(clearShader),
      splat:    program(splatShader),
      advect:   program(advectionShader),
      div:      program(divergenceShader),
      curl:     program(curlShader),
      vort:     program(vorticityShader),
      pressure: program(pressureShader),
      grad:     program(gradientSubtractShader),
      display:  program(displayShader),
    };
    for (const k in progs) if (!progs[k]) return; // a shader failed → bail safely

    // Full-screen quad.
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const idx = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    function blit(target) {
      if (target == null) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    const texType = gl.HALF_FLOAT;
    const filtering = gl.LINEAR;

    function createFBO(w, h, internalFormat, format) {
      gl.activeTexture(gl.TEXTURE0);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filtering);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filtering);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, texType, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return {
        texture, fbo, width: w, height: h,
        texelSizeX: 1 / w, texelSizeY: 1 / h,
        attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, texture); return id; },
      };
    }

    function createDoubleFBO(w, h, internalFormat, format) {
      let fbo1 = createFBO(w, h, internalFormat, format);
      let fbo2 = createFBO(w, h, internalFormat, format);
      return {
        width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h,
        get read() { return fbo1; },
        set read(v) { fbo1 = v; },
        get write() { return fbo2; },
        set write(v) { fbo2 = v; },
        swap() { const t = fbo1; fbo1 = fbo2; fbo2 = t; },
      };
    }

    let dye, velocity, divergence, curlFBO, pressure;

    function getResolution(resolution) {
      let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
      if (aspect < 1) aspect = 1 / aspect;
      const min = Math.round(resolution);
      const max = Math.round(resolution * aspect);
      if (gl.drawingBufferWidth > gl.drawingBufferHeight) return { width: max, height: min };
      return { width: min, height: max };
    }

    function initFramebuffers() {
      const simRes = getResolution(SIM_RESOLUTION);
      const dyeRes = getResolution(DYE_RESOLUTION);
      // WebGL2 sized internal formats.
      const RGBA = gl.RGBA16F, RG = gl.RG16F, R = gl.R16F;
      dye        = createDoubleFBO(dyeRes.width, dyeRes.height, RGBA, gl.RGBA);
      velocity   = createDoubleFBO(simRes.width, simRes.height, RG, gl.RG);
      divergence = createFBO(simRes.width, simRes.height, R, gl.RED);
      curlFBO    = createFBO(simRes.width, simRes.height, R, gl.RED);
      pressure   = createDoubleFBO(simRes.width, simRes.height, R, gl.RED);
    }

    function resize() {
      const w = Math.round(window.innerWidth * dpr);
      const h = Math.round(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        initFramebuffers();
      }
    }
    resize();

    // Verify the float render targets are actually usable on this GPU/driver.
    // If not (rare on modern browsers), render nothing rather than break.
    gl.bindFramebuffer(gl.FRAMEBUFFER, dye.read.fbo);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    window.addEventListener('resize', resize);

    // ── Pointer state ───────────────────────────────────────────────────────
    // Normalized coords (0..1), y flipped for texture space.
    let pointerX = 0, pointerY = 0, prevX = 0, prevY = 0;
    let moved = false, initialised = false;

    const onMove = (e) => {
      const nx = e.clientX / window.innerWidth;
      const ny = 1.0 - e.clientY / window.innerHeight;
      if (!initialised) { pointerX = prevX = nx; pointerY = prevY = ny; initialised = true; return; }
      prevX = pointerX; prevY = pointerY;
      pointerX = nx; pointerY = ny;
      moved = true;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    // ── Splat (inject velocity + dye) ────────────────────────────────────────
    function splat(x, y, dx, dy, color) {
      // velocity
      gl.useProgram(progs.splat.program);
      gl.uniform1i(progs.splat.uniforms.uTarget, velocity.read.attach(0));
      gl.uniform1f(progs.splat.uniforms.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(progs.splat.uniforms.point, x, y);
      gl.uniform3f(progs.splat.uniforms.color, dx, dy, 0.0);
      gl.uniform1f(progs.splat.uniforms.radius, SPLAT_RADIUS);
      gl.uniform2f(progs.splat.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      blit(velocity.write); velocity.swap();
      // dye
      gl.uniform1i(progs.splat.uniforms.uTarget, dye.read.attach(0));
      gl.uniform2f(progs.splat.uniforms.texelSize, dye.texelSizeX, dye.texelSizeY);
      gl.uniform3f(progs.splat.uniforms.color, color[0], color[1], color[2]);
      blit(dye.write); dye.swap();
    }

    // Emit along the interpolated path so the trail is continuous, not stamped.
    function applyPointerSplats() {
      if (!moved) return;
      moved = false;
      const dxN = pointerX - prevX;
      const dyN = pointerY - prevY;
      const dist = Math.hypot(dxN, dyN);
      const vx = dxN * SPLAT_FORCE;
      const vy = dyN * SPLAT_FORCE;
      const speed = Math.min(1.0, dist * 12.0);
      // Brighter, denser cores on faster sweeps; soft glow on slow drags.
      // Injected density trimmed ~30% from (0.10 + speed*0.22) for a more
      // subtle, elegant read. Physics (velocity, dissipation, curl) unchanged.
      const lift = 0.07 + speed * 0.154;
      const color = [
        (GOLD_BODY[0] * (1 - speed) + GOLD_HIGHLIGHT[0] * speed) * lift,
        (GOLD_BODY[1] * (1 - speed) + GOLD_HIGHLIGHT[1] * speed) * lift,
        (GOLD_BODY[2] * (1 - speed) + GOLD_HIGHLIGHT[2] * speed) * lift,
      ];
      // Number of splats along the path, filling the gap between frames so the
      // body is connected regardless of pointer event rate. Capped for safety.
      const steps = Math.min(24, Math.max(1, Math.ceil(dist / 0.006)));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        splat(prevX + dxN * t, prevY + dyN * t, vx, vy, color);
      }
    }

    // ── Simulation step ───────────────────────────────────────────────────────
    function step(dt) {
      gl.disable(gl.BLEND);

      // curl
      gl.useProgram(progs.curl.program);
      gl.uniform2f(progs.curl.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(progs.curl.uniforms.uVelocity, velocity.read.attach(0));
      blit(curlFBO);

      // vorticity confinement
      gl.useProgram(progs.vort.program);
      gl.uniform2f(progs.vort.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(progs.vort.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(progs.vort.uniforms.uCurl, curlFBO.attach(1));
      gl.uniform1f(progs.vort.uniforms.curl, CURL);
      gl.uniform1f(progs.vort.uniforms.dt, dt);
      blit(velocity.write); velocity.swap();

      // divergence
      gl.useProgram(progs.div.program);
      gl.uniform2f(progs.div.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(progs.div.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergence);

      // clear pressure (decay)
      gl.useProgram(progs.clear.program);
      gl.uniform1i(progs.clear.uniforms.uTexture, pressure.read.attach(0));
      gl.uniform1f(progs.clear.uniforms.value, PRESSURE);
      blit(pressure.write); pressure.swap();

      // pressure solve (Jacobi)
      gl.useProgram(progs.pressure.program);
      gl.uniform2f(progs.pressure.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(progs.pressure.uniforms.uDivergence, divergence.attach(0));
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(progs.pressure.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write); pressure.swap();
      }

      // gradient subtract → divergence-free velocity
      gl.useProgram(progs.grad.program);
      gl.uniform2f(progs.grad.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(progs.grad.uniforms.uPressure, pressure.read.attach(0));
      gl.uniform1i(progs.grad.uniforms.uVelocity, velocity.read.attach(1));
      blit(velocity.write); velocity.swap();

      // advect velocity
      gl.useProgram(progs.advect.program);
      gl.uniform2f(progs.advect.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(progs.advect.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(progs.advect.uniforms.uSource, velocity.read.attach(0));
      gl.uniform1f(progs.advect.uniforms.dt, dt);
      gl.uniform1f(progs.advect.uniforms.dissipation, VELOCITY_DISSIPATION);
      blit(velocity.write); velocity.swap();

      // advect dye
      gl.uniform2f(progs.advect.uniforms.texelSize, dye.texelSizeX, dye.texelSizeY);
      gl.uniform1i(progs.advect.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(progs.advect.uniforms.uSource, dye.read.attach(1));
      gl.uniform1f(progs.advect.uniforms.dissipation, DENSITY_DISSIPATION);
      blit(dye.write); dye.swap();
    }

    function render() {
      // Composite the dye over the page with straight alpha.
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(progs.display.program);
      gl.uniform1i(progs.display.uniforms.uTexture, dye.read.attach(0));
      gl.uniform1f(progs.display.uniforms.alpha, DISPLAY_ALPHA);
      blit(null);
    }

    // ── Main loop ─────────────────────────────────────────────────────────────
    let raf;
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(MAX_DT, (now - last) / 1000) || MAX_DT;
      last = now;
      gl.disable(gl.BLEND); // splats + sim passes overwrite; only display blends
      applyPointerSplats(); // emit ONLY when the cursor moved
      step(dt);             // always advect + dissipate so existing fog settles
      render();
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      // Release GL resources.
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none',
        zIndex: 60,
      }}
    />
  );
}
