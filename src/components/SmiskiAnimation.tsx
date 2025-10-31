"use client";

import { useEffect, useRef, useState } from "react";

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
  Object.prototype.hasOwnProperty.call(transitionSources, value);

const transitionDurations: Record<SmiskiTransition, number> = {
  stir: 650,
  wake: 800,
  "stir-reverse": 600,
  "wake-reverse": 650,
};

const hoverDelay = 200;
const hoverAdvanceDelay = 1000;
const decayDelays: Record<Exclude<SmiskiSteady, "sleep">, number> = {
  rest: 6500,
  awake: 8500,
};

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

type SmiskiAnimationProps = {
  className?: string;
  showCaption?: boolean;
};

export function SmiskiAnimation({ className, showCaption = true }: SmiskiAnimationProps) {
  const [phase, setPhase] = useState<SmiskiPhase>("sleep");
  const [sequenceKey, setSequenceKey] = useState(0);

  const steadyRef = useRef<SmiskiSteady>("sleep");
  const hoveringRef = useRef(false);
  const transitionRunningRef = useRef(false);

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const decayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      Object.values(phaseSources).forEach((src) => {
        const img = new window.Image();
        img.src = src;
      });
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (hoverAdvanceTimeoutRef.current) {
        clearTimeout(hoverAdvanceTimeoutRef.current);
      }
      if (decayTimeoutRef.current) {
        clearTimeout(decayTimeoutRef.current);
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
    if (currentSteady === "sleep") return;

    const delay = decayDelays[currentSteady];
    decayTimeoutRef.current = setTimeout(async () => {
      decayTimeoutRef.current = null;
      if (hoveringRef.current) return;
      await runTransition("down");
      if (!hoveringRef.current) {
        startDecayChain();
      }
    }, delay);
  };

  const scheduleHoverAdvance = () => {
    if (!hoveringRef.current) return;
    if (steadyRef.current === "awake") return;

    if (hoverAdvanceTimeoutRef.current) {
      clearTimeout(hoverAdvanceTimeoutRef.current);
    }

    hoverAdvanceTimeoutRef.current = setTimeout(() => {
      hoverAdvanceTimeoutRef.current = null;
      if (!hoveringRef.current) {
        startDecayChain();
        return;
      }
      if (transitionRunningRef.current) {
        scheduleHoverAdvance();
        return;
      }
      void runTransition("up");
    }, hoverAdvanceDelay);
  };

  const stepThroughTransitions = async (
    transitions: SmiskiTransition[],
    nextSteady: SmiskiSteady,
  ) => {
    transitionRunningRef.current = true;
    clearDecayTimer();
    if (hoverAdvanceTimeoutRef.current) {
      clearTimeout(hoverAdvanceTimeoutRef.current);
      hoverAdvanceTimeoutRef.current = null;
    }

    for (const step of transitions) {
      setPhase(step);
      setSequenceKey((current) => current + 1);
      await wait(transitionDurations[step]);
    }

    steadyRef.current = nextSteady;
    setPhase(nextSteady);
    transitionRunningRef.current = false;

    if (hoveringRef.current) {
      scheduleHoverAdvance();
    } else {
      startDecayChain();
    }
  };

  const runTransition = async (direction: "up" | "down") => {
    if (transitionRunningRef.current) return steadyRef.current;

    const currentSteady = steadyRef.current;
    if (direction === "up") {
      if (currentSteady === "sleep") {
        await stepThroughTransitions(["stir"], "rest");
      } else if (currentSteady === "rest") {
        await stepThroughTransitions(["wake"], "awake");
      }
    } else {
      if (currentSteady === "awake") {
        await stepThroughTransitions(["wake-reverse"], "rest");
      } else if (currentSteady === "rest") {
        await stepThroughTransitions(["stir-reverse"], "sleep");
      }
    }

    return steadyRef.current;
  };

  const handlePointerEnter = () => {
    hoveringRef.current = true;
    clearDecayTimer();

    if (hoverTimeoutRef.current || transitionRunningRef.current) return;

    hoverTimeoutRef.current = setTimeout(() => {
      hoverTimeoutRef.current = null;
      void runTransition("up");
    }, hoverDelay);
  };

  const handlePointerLeave = () => {
    hoveringRef.current = false;

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (hoverAdvanceTimeoutRef.current) {
      clearTimeout(hoverAdvanceTimeoutRef.current);
      hoverAdvanceTimeoutRef.current = null;
    }

    startDecayChain();
  };

  return (
    <div
      className={`flex flex-col items-center ${className ?? ""}`}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <img
        key={isTransitionPhase(phase) ? `${phase}-${sequenceKey}` : phase}
        src={
          isTransitionPhase(phase)
            ? `${phaseSources[phase]}?cycle=${sequenceKey}`
            : phaseSources[phase]
        }
        alt="Smiski animation"
        className="h-24 w-24 select-none object-contain sm:h-28 sm:w-28"
        draggable={false}
      />
      {showCaption ? (
        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-[#7a7a7a]">
          smiski
        </p>
      ) : null}
    </div>
  );
}
