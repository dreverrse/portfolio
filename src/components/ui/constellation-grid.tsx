"use client";

import React, { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  radius: number;
  label: string;
  pulse: number;
}

interface ConstellationGridProps {
  className?: string;
}

/**
 * Latar global mesh partikel interaktif (adaptasi dari 21st.dev).
 * - Dipasang di RootLayout sebagai layer fixed -z-10 di semua halaman.
 * - Kanvas transparan: warna latar situs (globals.css) terlihat menembus.
 * - Tema mengikuti class "light" pada <html> (mekanisme ThemeToggle situs).
 * - Interaksi via window pointer events: mendukung mouse dan sentuh.
 * - Spasi grid lebih renggang di layar kecil demi performa; DPR dibatasi 2.
 * - Menghormati prefers-reduced-motion (render statis tanpa animasi).
 */
export default function ConstellationGrid({
  className = "",
}: ConstellationGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const rootEl = document.documentElement;
    const isLight = () => rootEl.classList.contains("light");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let rafId = 0;
    let lastTime = performance.now();
    let width = 0;
    let height = 0;

    const mouse = {
      x: -1000,
      y: -1000,
      prevX: -1000,
      prevY: -1000,
      vx: 0,
      vy: 0,
      radius: 220,
    };

    let nodes: Node[] = [];

    const initNodes = () => {
      nodes = [];
      const spacing = width < 640 ? 90 : 55;
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;
          nodes.push({
            x,
            y,
            vx: 0,
            vy: 0,
            baseX: x,
            baseY: y,
            radius: Math.random() * 1.2 + 1.2,
            label: `${(i * 7).toString(16).toUpperCase()}:${(j * 11)
              .toString(16)
              .toUpperCase()}`,
            pulse: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = host.clientWidth;
      height = host.clientHeight;
      if (!width || !height) return;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initNodes();
    };

    const palette = () => {
      const light = isLight();
      return {
        node: light ? "15, 23, 42" : "255, 255, 255",
        accent: light ? "2, 132, 199" : "56, 189, 248",
        linkAlpha: light ? 0.08 : 0.18,
      };
    };

    // Pegas Hooke + redaman (spring-mass-damping).
    const SPRING_K = 18;
    const DAMPING = 0.82;

    const stepPhysics = (dt: number) => {
      const speed = Math.min(
        Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy),
        4000
      );

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.pulse += dt * 3;

        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          const power = 1 - dist / mouse.radius;
          const force = power * (1500 + speed * 150);
          const angle = Math.atan2(dy, dx);
          n.vx -= Math.cos(angle) * force * dt;
          n.vy -= Math.sin(angle) * force * dt;
        }

        const homeDx = n.baseX - n.x;
        const homeDy = n.baseY - n.y;
        n.vx += homeDx * SPRING_K * dt;
        n.vy += homeDy * SPRING_K * dt;

        n.vx *= DAMPING;
        n.vy *= DAMPING;

        n.x += n.vx * dt * 60;
        n.y += n.vy * dt * 60;
      }
    };

    const drawScene = () => {
      const { node, accent, linkAlpha } = palette();

      ctx.clearRect(0, 0, width, height);

      const MAX_CONN_DIST = 75;
      const MAX_CONN_DIST_SQ = MAX_CONN_DIST * MAX_CONN_DIST;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const ndx = n.x - n2.x;
          const ndy = n.y - n2.y;
          const distSq = ndx * ndx + ndy * ndy;

          if (distSq < MAX_CONN_DIST_SQ) {
            const nDist = Math.sqrt(distSq);
            const alpha = (1 - nDist / MAX_CONN_DIST) * linkAlpha;

            ctx.strokeStyle = `rgba(${node}, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isNear = dist < mouse.radius;

        const baseAlpha = isNear ? 0.95 : 0.25 + Math.sin(n.pulse) * 0.1;

        ctx.fillStyle = isNear
          ? `rgba(${accent}, ${baseAlpha})`
          : `rgba(${node}, ${baseAlpha})`;

        const currentRadius = isNear
          ? n.radius * 2.2
          : n.radius + Math.sin(n.pulse) * 0.3;

        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(0.5, currentRadius), 0, Math.PI * 2);
        ctx.fill();

        if (dist < 90) {
          const pulseRing = ((n.pulse * 20) % 30) + 4;
          const ringAlpha = (1 - pulseRing / 34) * 0.4;

          ctx.strokeStyle = `rgba(${accent}, ${ringAlpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(n.x, n.y, pulseRing, 0, Math.PI * 2);
          ctx.stroke();

          ctx.font = "8px ui-monospace, SFMono-Regular, Consolas, monospace";
          ctx.fillStyle = `rgba(${accent}, 0.85)`;
          ctx.fillText(n.label, n.x + 10, n.y - 10);
        }
      }
    };

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      mouse.vx = (mouse.x - mouse.prevX) / ((dt * 1000) || 1);
      mouse.vy = (mouse.y - mouse.prevY) / ((dt * 1000) || 1);
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;

      stepPhysics(dt);
      drawScene();

      rafId = requestAnimationFrame(render);
    };

    const handlePointerMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handlePointerDown = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    // Sentuh: lepas titik gaya saat jari diangkat agar tidak "nyangkut".
    const releasePointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") {
        mouse.x = -1000;
        mouse.y = -1000;
      }
    };

    handleResize();

    if (reducedMotion) {
      // Render statis: gambar sekali, ulangi saat tema/ukuran berubah.
      drawScene();
      const themeObserver = new MutationObserver(drawScene);
      themeObserver.observe(rootEl, { attributes: true, attributeFilter: ["class"] });
      const resizeObserver = new ResizeObserver(() => {
        handleResize();
        drawScene();
      });
      resizeObserver.observe(host);

      return () => {
        themeObserver.disconnect();
        resizeObserver.disconnect();
      };
    }

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(host);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", releasePointer, { passive: true });
    window.addEventListener("pointercancel", releasePointer, { passive: true });
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", releasePointer);
      window.removeEventListener("pointercancel", releasePointer);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
    </div>
  );
}
