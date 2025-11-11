/* eslint-disable @next/next/no-img-element */
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type SmiskiSteady = "sleep" | "rest" | "awake";
type SmiskiTransition =
  | "stir"
  | "wake"
  | "stir-reverse"
  | "wake-reverse";
type SmiskiPhase = SmiskiSteady | SmiskiTransition;

const steadySources: Record<SmiskiSteady, { regular: string; glow: string }> = {
  sleep: { regular: "/smiski_sleep.gif", glow: "/smiski_sleep_glow.gif" },
  rest: { regular: "/smiski_rest.gif", glow: "/smiski_rest_glow.gif" },
  awake: { regular: "/smiski_awake.gif", glow: "/smiski_awake_glow.gif" },
};

const transitionSources: Record<SmiskiTransition, { regular: string; glow: string }> = {
  stir: { regular: "/smiski_stir.gif", glow: "/smiski_stir_glow.gif" },
  wake: { regular: "/smiski_wake.gif", glow: "/smiski_wake_glow.gif" },
  "stir-reverse": { regular: "/smiski_stir_reverse.gif", glow: "/smiski_stir_reverse_glow.gif" },
  "wake-reverse": { regular: "/smiski_wake_reverse.gif", glow: "/smiski_wake_reverse_glow.gif" },
};

const phaseSources: Record<SmiskiPhase, { regular: string; glow: string }> = {
  ...steadySources,
  ...transitionSources,
};

// Helper function to get the source based on dark mode
const getPhaseSource = (phase: SmiskiPhase, isDark: boolean): string => {
  return isDark ? phaseSources[phase].glow : phaseSources[phase].regular;
};

const transitionDurations: Record<SmiskiTransition, number> = {
  stir: 550,
  wake: 950,
  "stir-reverse": 550,
  "wake-reverse": 950,
};

const HOVER_DELAY = 200;
const DECAY_DELAYS: Record<SmiskiSteady, number> = {
  sleep: 1000,
  rest: 0,
  awake: 1000,
};

const transitions: Record<SmiskiSteady, Partial<Record<SmiskiSteady, SmiskiTransition[]>>> = {
  // Defines transition order:
  // sleep -> stir -> rest -> wake -> awake
  // awake -> wake-reverse -> rest -> stir-reverse -> sleep
  sleep: {
    rest: ["stir"],
    awake: ["stir", "wake"],
  },
  rest: {
    sleep: ["stir-reverse"],
    awake: ["wake"],
  },
  awake: {
    rest: ["wake-reverse"],
    sleep: ["wake-reverse", "stir-reverse"],
  },
};

type SmiskiAnimationProps = {
  className?: string;
  showCaption?: boolean;
};

type SmiskiImageProps = {
  src: string;
  alt: string;
};

function SmiskiImage({ src, alt }: SmiskiImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className="smiski-img h-24 w-24 select-none object-contain sm:h-28 sm:w-28"
      draggable={false}
    />
  );
}

export function SmiskiAnimation({ className }: SmiskiAnimationProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const baseline = isDark ? "awake" : "sleep";

  const [currentPhase, setCurrentPhase] = useState<SmiskiPhase>(baseline);
  const [currentSteadyTarget, setCurrentSteadyTarget] = useState<SmiskiSteady>(baseline);
  const [isHovering, setIsHovering] = useState(false);
  const [isTransitionRunning, setIsTransitionRunning] = useState(false);

  useEffect(() => {
    // Mark the component as mounted, so we can safely render UI that depends on the current theme
    // We need this because the theme is not visible on the server
    setMounted(true);

    // Preload all gif images (both regular and glow) so they're cached before use
    Object.values(phaseSources).forEach((sources) => {
      const regularImg = new window.Image();
      regularImg.src = sources.regular;
      const glowImg = new window.Image();
      glowImg.src = sources.glow;
    });

    setCurrentSteadyTarget(baseline);
    setCurrentPhase(baseline);
  }, []);

  useEffect(() => {
    // Don't decay if the user is hovering, or a transition is running
    if (isHovering || isTransitionRunning) return;

    // Decay towards the baseline if the current state is NOT the baseline
    if (currentSteadyTarget !== baseline) {
      startDecay();
    }
  }, [theme, isHovering, isTransitionRunning, currentSteadyTarget])

  const startDecay = () => {
    if (currentSteadyTarget === baseline) return;

    const delay = DECAY_DELAYS[currentSteadyTarget];
     window.setTimeout(() => {
      goToState(baseline);
    }, delay);
  };

  const goToState = async (target: SmiskiSteady) => {
    const from = currentSteadyTarget;
    if (from === target) {
      return;
    }

    // If a transition is already in progress, don't do anything
    if (isTransitionRunning) {
      return;
    }

    setCurrentSteadyTarget(target);
    const transitionSteps = transitions[from]?.[target] ?? [];

    // Run through the transition steps to get to the end state (no decays in between)
    for (const step of transitionSteps) {
      setIsTransitionRunning(true);
      setCurrentPhase(step);
      await new Promise<void>((resolve) => {
        const duration = transitionDurations[step];
        window.setTimeout(() => {
          resolve();
        }, duration);
      });
    }

    // Set the target state
    setCurrentPhase(target);
    setIsTransitionRunning(false);
  };

  const handlePointerEnter = () => {
    setIsHovering(true);

    if (isTransitionRunning) return;

    // Maybe transition to the "rest" state
    let target: SmiskiSteady;
    if (currentSteadyTarget === "awake" && isDark || currentSteadyTarget === "sleep" && !isDark) {
      // The ONLY two states where hovering should do anything are the two base states:
      // - dark mode, Smiski is awake
      // - light mode, Smiski is asleep
      target = "rest";
    } else {
      return;
    }

    window.setTimeout(() => {
      goToState(target);
    }, HOVER_DELAY);
  };

  const handlePointerLeave = () => {
    setIsHovering(false);
  };

  const handleClick = () => {
    // Toggle dark mode
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`smiski-wrapper flex flex-col items-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#a1b57a] focus-visible:ring-offset-[var(--background)] ${className ?? ""}`}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      <div className="relative h-24 w-24 sm:h-28 sm:w-28">
        {!mounted ? (
          // Don't render Smiski until the component is mounted, but DO render an invisible placeholder so the layout doesn't shift
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E"
            alt=""
            className="smiski-img h-24 w-24 sm:h-28 sm:w-28 invisible"
            aria-hidden="true"
          />
        ) : (
          <>
            {/* Regular version - visible when NOT dark */}
            <div className={`absolute inset-0 ${isDark ? 'opacity-0' : 'opacity-100'}`}>
              <SmiskiImage src={phaseSources[currentPhase].regular} alt="Smiski animation" />
            </div>
            {/* Glow version - visible when dark */}
            <div className={`absolute inset-y-0 -left-1.5 right-1.5 ${isDark ? 'opacity-100' : 'opacity-0'}`}>
              <SmiskiImage src={phaseSources[currentPhase].glow} alt="Smiski glow animation" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
