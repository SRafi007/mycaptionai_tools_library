"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    suffix?: string;
    className?: string;
    formatter?: (n: number) => string;
}

const defaultFormat = (n: number) => n.toLocaleString();

export default function AnimatedCounter({
    value,
    duration = 1100,
    suffix = "",
    className,
    formatter = defaultFormat,
}: AnimatedCounterProps) {
    const [display, setDisplay] = useState(value);
    const ref = useRef<HTMLSpanElement>(null);
    const startedRef = useRef(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const reduced = typeof window !== "undefined"
            && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

        if (reduced) {
            setDisplay(value);
            return;
        }

        setDisplay(0);

        const start = () => {
            if (startedRef.current) return;
            startedRef.current = true;

            const startTime = performance.now();
            const animate = (now: number) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setDisplay(Math.round(value * eased));
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            requestAnimationFrame(animate);
        };

        if (typeof IntersectionObserver === "undefined") {
            start();
            return;
        }

        const io = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    start();
                    io.disconnect();
                }
            },
            { threshold: 0.3 }
        );
        io.observe(node);

        return () => io.disconnect();
    }, [value, duration]);

    return (
        <span ref={ref} className={className}>
            {formatter(display)}{suffix}
        </span>
    );
}
