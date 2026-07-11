"use client";

import { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    color: string;
    born: number;
    size: number;
}

interface PixelBgProps {
    spawnRate?: number;
    fadeDuration?: number;
    maxAlpha?: number;
    className?: string;
}

const randomHex = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`

export default function PixelBg({
                                    spawnRate = 5,
                                    fadeDuration = 2200,
                                    maxAlpha = 1,
                                    className = "",
                                }: PixelBgProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const rafRef = useRef<number | null>(null);
    const lastSpawnCheckRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const parent = canvas.parentElement;
        if (!parent) return;

        let width = 0;
        let height = 0;
        let dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

        const resize = () => {
            width = parent.clientWidth;
            height = parent.clientHeight;
            dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        resize();

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(parent);

        const spawnPixel = () => {
            const rand = Math.random()
            let size
            if (rand < 0.7) {
                size = Math.random() * 17 + 2
            } else if (rand < 0.99) {
                size = Math.random() * 29 + 10
            } else {
                size = Math.random() * 300 + 30
            }
            particlesRef.current.push({
                x: Math.random() * width,
                y: Math.random() * height,
                color: randomHex(),
                born: performance.now(),
                size,
            });
        };

        lastSpawnCheckRef.current = performance.now();

        const tick = (now: number) => {
            const elapsed = now - lastSpawnCheckRef.current;
            lastSpawnCheckRef.current = now;
            const expectedSpawns = (spawnRate * elapsed) / 1000;
            let spawnCount = Math.floor(expectedSpawns);
            if (Math.random() < expectedSpawns - spawnCount) spawnCount += 1;
            for (let i = 0; i < spawnCount; i++) spawnPixel();

            ctx.clearRect(0, 0, width, height);

            particlesRef.current = particlesRef.current.filter((p) => {
                const age = now - p.born;
                if (age >= fadeDuration) return false;

                const t = age / fadeDuration;
                const alpha = maxAlpha * (1 - t);

                ctx.globalAlpha = alpha;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);

                return true;
            });

            ctx.globalAlpha = 1;
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            resizeObserver.disconnect();
        };
    }, [spawnRate, fadeDuration, maxAlpha]);

    return (
        <div
            className={className}
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "#f9f9f9",
                overflow: "hidden",
                zIndex: -1,
            }}
        >
            <canvas ref={canvasRef} style={{ display: "block" }} />
        </div>
    );
}