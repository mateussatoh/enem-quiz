"use client";

import type { BandKey } from "@enem-quiz/shared/domain";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { bandStyles } from "@/components/common/band-badge";

const SIZE = 200;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function ScoreRing({ score, band }: { score: number; band: BandKey }) {
  const value = useMotionValue(0);
  const rounded = useTransform(value, (v) => Math.round(v));
  const dashOffset = useTransform(value, (v) => CIRCUMFERENCE * (1 - v / 100));

  useEffect(() => {
    const controls = animate(value, score, { duration: 1.2, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [score, value]);

  return (
    <div
      className="relative grid place-items-center"
      role="img"
      aria-label={`Pontuação ${score} de 100`}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="var(--surface-tint)"
          strokeWidth={STROKE}
        />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={bandStyles[band].fill}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <div className="absolute flex flex-col items-center" aria-hidden>
        <motion.span className="font-serif text-6xl leading-none text-ink tabular-nums">
          {rounded}
        </motion.span>
        <span className="mt-1 text-sm text-subtle">de 100</span>
      </div>
    </div>
  );
}
