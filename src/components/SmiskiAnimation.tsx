/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState, useCallback, useId } from "react";

type SmiskiSteady = "sleep" | "rest" | "awake";
type SmiskiTransition =
  | "stir"
  | "wake"
  | "stir-reverse"
  | "wake-reverse";
type SmiskiPhase = SmiskiSteady | SmiskiTransition;

const steadySources: Record<SmiskiSteady, string> = {
  sleep: "/smiski_sleep.gif",
  rest: "/smiski_rest.gif",
  awake: "/smiski_awake.gif",
};

const transitionSources: Record<SmiskiTransition, string> = {
  stir: "/smiski_stir.gif",
  wake: "/smiski_wake.gif",
  "stir-reverse": "/smiski_stir_reverse.gif",
  "wake-reverse": "/smiski_wake_reverse.gif",
};

const phaseSources: Record<SmiskiPhase, string> = {
  ...steadySources,
  ...transitionSources,
};

const isTransitionPhase = (
  value: SmiskiPhase,
): value is SmiskiTransition =>
  value in transitionSources;

const transitionDurations: Record<SmiskiTransition, number> = {
  stir: 650,
  wake: 800,
  "stir-reverse": 650,
  "wake-reverse": 800,
};

const HOVER_DELAY = 200;
const DECAY_DELAYS: Record<SmiskiSteady, number> = {
  sleep: 1000,
  rest: 1000,
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

type SmiskiSvgProps = {
  src: string;
  alt: string;
  dark: boolean;
};

function SmiskiSvg({ src, alt, dark }: SmiskiSvgProps) {
  const uniqueId = useId();

  if (!dark) {
    return (
      <img
        src={src}
        alt={alt}
        className="smiski-img h-24 w-24 select-none object-contain transition-all duration-300 sm:h-28 sm:w-28"
        draggable={false}
      />
    );
  }

  const outlineFilterId = `smiski-outline-${uniqueId}`;
  const fillFilterId = `smiski-fill-${uniqueId}`;
  const fillMaskId = `smiski-mask-${uniqueId}`;

  return (
    <svg
      className="smiski-img h-24 w-24 select-none transition-all duration-300 sm:h-28 sm:w-28"
      viewBox="0 0 512 512"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={alt}
    >
      <defs>
        <filter id={outlineFilterId} colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="
              -1 0 0 0 1
              0 -1 0 0 1
              0 0 -1 0 1
              0 0 0 1 0
            "
          />
        </filter>

        <filter id={fillFilterId} colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="dilate" radius="28" result="expanded" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 1" />
          </feComponentTransfer>
        </filter>

        <mask id={fillMaskId} maskUnits="userSpaceOnUse">
          <image
            href={src}
            x="0"
            y="0"
            width="512"
            height="512"
            filter={`url(#${fillFilterId})`}
          />
        </mask>
      </defs>

      <rect width="512" height="512" fill="rgba(150,255,190,0.85)" mask={`url(#${fillMaskId})`} />

      <image
        href={src}
        x="0"
        y="0"
        width="512"
        height="512"
        filter={`url(#${outlineFilterId})`}
      />
    </svg>
  );
}

export function SmiskiAnimation({ className }: SmiskiAnimationProps) {
  // final state: wake if isDark, sleep if not isDark
  // clicking while animation in progress doesn't change the smiski (though it does toggle the theme)
  // after a brief pause, animations always evolve towards their final state

  const [isDark, setIsDark] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(phaseSources.sleep);

  const steadyRef = useRef<SmiskiSteady>("sleep");
  const hoveringRef = useRef(false);
  const transitionRunningRef = useRef(false);

  const hoverTimeoutRef = useRef<number | null>(null);
  const decayTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    Object.values(phaseSources).forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });

    const stored = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDark = stored ? stored === "dark" : prefersDark;
    console.log(prefersDark, initialDark, stored)

    // TODO: light -> dark transition shouldn't run on page load if starting in dark mode
    setIsDark(initialDark);
    document.documentElement.classList.toggle("dark", initialDark);
    window.localStorage.setItem("theme", initialDark ? "dark" : "light");
    const baseState: SmiskiSteady = initialDark ? "awake" : "sleep";
    steadyRef.current = baseState;
    setCurrentSrc(phaseSources[baseState]);
    
    clearDecayTimer();
    clearHoverTimer();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    window.localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const clearDecayTimer = () => {
    if (decayTimeoutRef.current) {
      clearTimeout(decayTimeoutRef.current);
      decayTimeoutRef.current = null;
    }
  };

  const clearHoverTimer = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }

  const startDecay = () => {
    clearDecayTimer();

    // Don't decay if a transition is already happening
    // TODO: wait until the transition is done before continuing the decay
    if (transitionRunningRef.current) return;

    const currentSteady = steadyRef.current;
    const baseline = isDark ? "awake" : "sleep";
    if (currentSteady === baseline) return;

    const delay = DECAY_DELAYS[currentSteady];
    decayTimeoutRef.current = window.setTimeout(() => {
      decayTimeoutRef.current = null;
      if (hoveringRef.current) return;

      goToState(baseline);
    }, delay);
  };

  const goToState = async (target: SmiskiSteady) => {
    const from = steadyRef.current;
    if (from === target) {
      return;
    }

    // If a transition is already in progress, don't do anything
    if (transitionRunningRef.current) {
      return;
    }

    // 1. Reset the decay timer
    clearDecayTimer();

    const transitionSteps = transitions[from]?.[target] ?? [];
    transitionRunningRef.current = true;

    // 2. Run through the transition steps to get to the end state (no decays in between)
    for (const step of transitionSteps) {
      setCurrentSrc(phaseSources[step]);
      await new Promise<void>((resolve) => {
        const duration = transitionDurations[step];
        const timeout = window.setTimeout(() => {
          resolve();
        }, duration);
      });
    }

    // 3. Set the target state
    steadyRef.current = target;
    setCurrentSrc(phaseSources[target]);
    transitionRunningRef.current = false;
  };

  const handlePointerEnter = () => {
    // 1. Reset the decay and hover timers
    hoveringRef.current = true;
    clearDecayTimer();
    clearHoverTimer();

    if (transitionRunningRef.current) return;

    // 2. Maybe transition to the "rest" state
    const current = steadyRef.current;
    let target: SmiskiSteady;
    if (current === "awake" && isDark || current === "sleep" && !isDark) {
      // The ONLY two states where hovering should do anything are the two base states:
      // - dark mode, Smiski is awake
      // - light mode, Smiski is asleep
      target = "rest";
    } else {
      return;
    }

    hoverTimeoutRef.current = window.setTimeout(() => {
      goToState(target).then(() => {
        if (!hoveringRef.current) {
          // Only start decaying back to the base state if we're not still hovering
          startDecay();
        }
      });
    }, HOVER_DELAY);
  };

  const handlePointerLeave = () => {
    hoveringRef.current = false;
    clearHoverTimer();
    startDecay();
  };

  const handleClick = () => {
    // 1. Reset hover and decay timers
    clearHoverTimer();
    clearDecayTimer();

    // 2. Toggle dark mode
    const nextDark = !isDark;
    const target: SmiskiSteady = nextDark ? "awake" : "sleep";

    setIsDark(nextDark)

    // 3. Transition to end state
    goToState(target);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`smiski-wrapper flex flex-col items-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#a1b57a] focus-visible:ring-offset-[var(--background)] ${className ?? ""}`}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      <SmiskiSvg src={currentSrc} alt="Smiski animation" dark={isDark} />
    </div>
  );
}
