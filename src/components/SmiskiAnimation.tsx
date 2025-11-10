/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState, useId } from "react";

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
        className="smiski-img h-24 w-24 select-none object-contain sm:h-28 sm:w-28"
        draggable={false}
      />
    );
  }

  const outlineFilterId = `smiski-outline-${uniqueId}`;
  const fillFilterId = `smiski-fill-${uniqueId}`;
  const fillMaskId = `smiski-mask-${uniqueId}`;

  return (
    <svg
      className="smiski-img h-24 w-24 select-none sm:h-28 sm:w-28"
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
  // const [isDark, setIsDark] = useState(false);
  // const [isDark, setIsDark] = useState(() => {
  //   if (typeof window === "undefined") return false; // during SSR
  //   const stored = window.localStorage.getItem("theme");
  //   const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  //   return stored ? stored === "dark" : prefersDark;
  // });
  const [isDark, setIsDark] = useState(false);
  const baseline = isDark ? "awake" : "sleep";

  const [currentSrc, setCurrentSrc] = useState<string>(phaseSources[baseline]);

  const [currentSteadyTarget, setCurrentSteadyTarget] = useState<SmiskiSteady>(baseline);
  const [isHovering, setIsHovering] = useState(false);
  const [isTransitionRunning, setIsTransitionRunning] = useState(false);


  useEffect(() => {
    // Preload gif images so they're cached before use
    Object.values(phaseSources).forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });

    const stored = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDark = stored ? stored === "dark" : prefersDark;

    setIsDark(initialDark);
    setCurrentSteadyTarget(baseline);
    setCurrentSrc(phaseSources[baseline]);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    window.localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    // Don't decay if the user is hovering, or a transition is running
    if (isHovering || isTransitionRunning) return;

    // Decay towards the baseline if the current state is NOT the baseline
    if (currentSteadyTarget !== baseline) {
      startDecay();
    }
  }, [isDark, isHovering, isTransitionRunning])

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
    setIsTransitionRunning(true);

    // Run through the transition steps to get to the end state (no decays in between)
    for (const step of transitionSteps) {
      setCurrentSrc(phaseSources[step]);
      await new Promise<void>((resolve) => {
        const duration = transitionDurations[step];
        window.setTimeout(() => {
          resolve();
        }, duration);
      });
    }

    // Set the target state
    setCurrentSrc(phaseSources[target]);
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
    const nextDark = !isDark;
    setIsDark(nextDark)
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
