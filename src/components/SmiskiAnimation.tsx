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
  sleep: 4000,
  rest: 4000,
  awake: 4000,
};

const transitions: Record<SmiskiSteady, Partial<Record<SmiskiSteady, SmiskiTransition[]>>> = {
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

export function SmiskiAnimation({ className, showCaption = true }: SmiskiAnimationProps) {
  const [isDark, setIsDark] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(phaseSources.sleep);

  const steadyRef = useRef<SmiskiSteady>("sleep");
  const hoveringRef = useRef(false);
  const transitionRunningRef = useRef(false);

  const hoverTimeoutRef = useRef<number | null>(null);
  const decayTimeoutRef = useRef<number | null>(null);
  const transitionTokenRef = useRef(0);
  const activeTimeoutRef = useRef<number | null>(null);
  const activeWaitResolverRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      Object.values(phaseSources).forEach((src) => {
        const img = new window.Image();
        img.src = src;
      });

      const stored = window.localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialDark = stored ? stored === "dark" : prefersDark;
      setIsDark(initialDark);
      document.documentElement.classList.toggle("dark", initialDark);
      window.localStorage.setItem("theme", initialDark ? "dark" : "light");
      const baseState: SmiskiSteady = initialDark ? "awake" : "sleep";
      steadyRef.current = baseState;
      setCurrentSrc(phaseSources[baseState]);
    }

    return () => {
      if (hoverTimeoutRef.current) {
        window.clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      if (decayTimeoutRef.current) {
        window.clearTimeout(decayTimeoutRef.current);
        decayTimeoutRef.current = null;
      }
      if (activeTimeoutRef.current) {
        window.clearTimeout(activeTimeoutRef.current);
        activeTimeoutRef.current = null;
      }
      if (activeWaitResolverRef.current) {
        activeWaitResolverRef.current();
        activeWaitResolverRef.current = null;
      }
    };
  }, []);

  const clearDecayTimer = () => {
    if (decayTimeoutRef.current) {
      clearTimeout(decayTimeoutRef.current);
      decayTimeoutRef.current = null;
    }
  };

  const startDecayChain = () => {
    clearDecayTimer();
    if (hoveringRef.current || transitionRunningRef.current) return;

    const currentSteady = steadyRef.current;
    const baseline = isDark ? "awake" : "sleep";
    if (currentSteady === baseline) return;

    const nextTarget = isDark
      ? currentSteady === "sleep"
        ? "rest"
        : "awake"
      : currentSteady === "awake"
      ? "rest"
      : "sleep";

    const delay = DECAY_DELAYS[currentSteady] ?? 6000;
    decayTimeoutRef.current = window.setTimeout(() => {
      decayTimeoutRef.current = null;
      if (hoveringRef.current) return;
      void goToState(nextTarget).then(() => {
        if (!hoveringRef.current) {
          startDecayChain();
        }
      });
    }, delay);
  };

  const goToState = async (target: SmiskiSteady) => {
    const from = steadyRef.current;
    if (from === target) {
      setCurrentSrc(phaseSources[target]);
      return;
    }

    const steps = transitions[from]?.[target];
    const token = transitionTokenRef.current + 1;
    transitionTokenRef.current = token;
    transitionRunningRef.current = true;
    clearDecayTimer();
    if (activeTimeoutRef.current) {
      clearTimeout(activeTimeoutRef.current);
      activeTimeoutRef.current = null;
    }
    if (activeWaitResolverRef.current) {
      activeWaitResolverRef.current();
      activeWaitResolverRef.current = null;
    }

    if (!steps || steps.length === 0) {
      steadyRef.current = target;
      setCurrentSrc(phaseSources[target]);
      transitionRunningRef.current = false;
      return;
    }

    for (const step of steps) {
      if (transitionTokenRef.current !== token) {
        transitionRunningRef.current = false;
        return;
      }

      const src = isTransitionPhase(step)
        ? `${phaseSources[step]}?cycle=${performance.now()}`
        : phaseSources[step];
      setCurrentSrc(src);
      await new Promise<void>((resolve) => {
        const duration = transitionDurations[step];
        const timeout = window.setTimeout(() => {
          if (transitionTokenRef.current === token) {
            activeTimeoutRef.current = null;
            activeWaitResolverRef.current = null;
            resolve();
          }
        }, duration);
        activeTimeoutRef.current = timeout;
        activeWaitResolverRef.current = () => {
          clearTimeout(timeout);
          activeTimeoutRef.current = null;
          activeWaitResolverRef.current = null;
          resolve();
        };
      });
    }

    if (transitionTokenRef.current !== token) {
      transitionRunningRef.current = false;
      return;
    }

    steadyRef.current = target;
    setCurrentSrc(phaseSources[target]);
    transitionRunningRef.current = false;
  };

  const applyTheme = useCallback((nextDark: boolean) => {
    if (typeof document === "undefined" || typeof window === "undefined") return;
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem("theme", nextDark ? "dark" : "light");
  }, []);

  const setThemeImmediate = useCallback(
    (nextDark: boolean) => {
      applyTheme(nextDark);
      setIsDark(nextDark);
    },
    [applyTheme],
  );

  const handlePointerEnter = () => {
    hoveringRef.current = true;
    clearDecayTimer();

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (transitionRunningRef.current) return;

    const current = steadyRef.current;
    const target = isDark
      ? current === "awake"
        ? "rest"
        : null
      : current === "sleep"
      ? "rest"
      : null;

    if (!target) return;

    hoverTimeoutRef.current = window.setTimeout(() => {
      hoverTimeoutRef.current = null;
      void goToState(target).then(() => {
        if (!hoveringRef.current) {
          startDecayChain();
        }
      });
    }, HOVER_DELAY);
  };

  const handlePointerLeave = () => {
    hoveringRef.current = false;

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    startDecayChain();
  };

  const handleClick = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    clearDecayTimer();

    const nextDark = !isDark;
    const target: SmiskiSteady = nextDark ? "awake" : "sleep";

    setThemeImmediate(nextDark);

    if (transitionRunningRef.current) {
      transitionTokenRef.current += 1;
      transitionRunningRef.current = false;
    }

    void goToState(target);
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
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
          event.preventDefault();
          handleClick();
        }
      }}
    >
      <SmiskiSvg src={currentSrc} alt="Smiski animation" dark={isDark} />
      {showCaption ? (
        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-[var(--text-caption)] transition-colors duration-200">
          smiski
        </p>
      ) : null}
    </div>
  );
}
