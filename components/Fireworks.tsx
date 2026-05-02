"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  alpha: number; decay: number;
  color: string; radius: number;
  gravity: number;
}

interface Rocket {
  x: number; y: number;
  vy: number;
  targetY: number;
  color: string;
  trail: { x: number; y: number; alpha: number }[];
}

// School + celebration colors
const COLORS = [
  "#FFCB05", "#CFB991", "#ffffff",
  "#FFE066", "#E8D5A3", "#FFF5CC",
  "#00274C", "#4a90d9", "#7ec8f7",
];

function randomColor() { return COLORS[Math.floor(Math.random() * COLORS.length)]; }
function rand(min: number, max: number) { return Math.random() * (max - min) + min; }

export default function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const rockets: Rocket[] = [];
    const particles: Particle[] = [];
    let frameId: number;
    let lastLaunch = 0;

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    function launchRocket() {
      rockets.push({
        x: rand(W * 0.15, W * 0.85),
        y: H + 10,
        vy: rand(-14, -10),
        targetY: rand(H * 0.08, H * 0.45),
        color: randomColor(),
        trail: [],
      });
    }

    function explode(x: number, y: number, color: string) {
      const count = Math.floor(rand(80, 130));
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + rand(-0.1, 0.1);
        const speed = rand(1.5, 6);
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: rand(0.012, 0.022),
          color,
          radius: rand(1.5, 3),
          gravity: 0.08,
        });
      }
      // Add a few bright white sparks
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = rand(3, 9);
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: rand(0.02, 0.035),
          color: "#ffffff",
          radius: rand(0.8, 1.8),
          gravity: 0.05,
        });
      }
    }

    function draw(ts: number) {
      frameId = requestAnimationFrame(draw);

      // Fade trail
      ctx.fillStyle = "rgba(11,14,23,0.22)";
      ctx.fillRect(0, 0, W, H);

      // Launch rockets on interval
      if (ts - lastLaunch > rand(600, 1400)) {
        launchRocket();
        if (Math.random() > 0.6) launchRocket(); // double burst
        lastLaunch = ts;
      }

      // Update & draw rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.trail.push({ x: r.x, y: r.y, alpha: 0.6 });

        r.y += r.vy;
        r.vy += 0.25; // gravity slowing rocket

        // Draw trail
        for (let j = r.trail.length - 1; j >= 0; j--) {
          const t = r.trail[j];
          t.alpha -= 0.06;
          if (t.alpha <= 0) { r.trail.splice(j, 1); continue; }
          ctx.beginPath();
          ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,220,100,${t.alpha})`;
          ctx.fill();
        }

        // Draw rocket head
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.fill();

        // Explode when it reaches target or starts falling
        if (r.y <= r.targetY || r.vy >= 0) {
          explode(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.alpha -= p.decay;

        if (p.alpha <= 0) { particles.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
      }
    }

    frameId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
