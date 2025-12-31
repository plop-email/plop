"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const steps = [
  {
    phase: 0,
    title: "A user requests a code",
    description: "Your app sends the real login email, just like production.",
  },
  {
    phase: 1,
    title: "Plop catches it instantly",
    description: "It lands in a dedicated test inbox with no setup.",
  },
  {
    phase: 2,
    title: "Plop pulls the code",
    description: "Codes, links, and key fields are pulled out for you.",
  },
  {
    phase: 3,
    title: "Clean fields are ready",
    description: "Structured data is ready to drop into your test.",
  },
  {
    phase: 4,
    title: "Your test uses the code",
    description: "No inbox hunting. No flaky waiting.",
  },
  {
    phase: 5,
    title: "Flow verified",
    description: "Stable auth tests. Confident releases.",
  },
];

export function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastProgressRef = useRef(0);
  const lastPhaseRef = useRef(0);

  const computeProgress = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const containerHeight = containerRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollRange = Math.max(1, containerHeight - viewportHeight);
    const scrolled = -rect.top;
    const rawProgress = scrolled / scrollRange;
    const clampedProgress = Math.max(0, Math.min(1, rawProgress));

    if (Math.abs(clampedProgress - lastProgressRef.current) > 0.0005) {
      lastProgressRef.current = clampedProgress;
      setProgress(clampedProgress);
    }

    const totalPhases = steps.length;
    const phase = Math.min(
      totalPhases - 1,
      Math.floor(clampedProgress * totalPhases),
    );
    if (phase !== lastPhaseRef.current) {
      lastPhaseRef.current = phase;
      setCurrentPhase(phase);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      computeProgress();
    });
  }, [computeProgress]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(media.matches);
    updatePreference();
    media.addEventListener("change", updatePreference);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();
    return () => {
      media.removeEventListener("change", updatePreference);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [handleScroll]);

  const totalPhases = steps.length;
  const phaseSize = 1 / totalPhases;
  const phaseStart = currentPhase * phaseSize;
  const phaseProgress = Math.min(
    1,
    Math.max(0, (progress - phaseStart) / phaseSize),
  );
  const resolvedPhaseProgress = prefersReducedMotion ? 1 : phaseProgress;

  return (
    <section
      ref={containerRef}
      id="how-it-works"
      className="relative border-b border-white/10"
      style={{ height: "900vh" }}
    >
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="mx-auto w-full max-w-[1400px] px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-6 lg:mb-8">
            <p className="font-mono text-xs text-[#B8FF2C] tracking-wider uppercase mb-3">
              How it works
            </p>
            <h2 className="font-heading text-3xl lg:text-5xl text-white text-balance">
              From email to confidence in seconds.
            </h2>
          </div>

          <div className="flex gap-6 lg:gap-10 items-stretch">
            {/* Vertical Progress Bar */}
            <div className="hidden md:flex flex-col items-center py-4 shrink-0">
              <div className="relative h-[420px] lg:h-[500px] w-px bg-white/10">
                {/* Progress fill */}
                <div
                  className="absolute top-0 left-0 w-full bg-[#B8FF2C] origin-top"
                  style={{
                    height: `${progress * 100}%`,
                    transition: "height 0.1s ease-out",
                  }}
                />

                {/* Step markers */}
                {steps.map((step, index) => {
                  const dotPosition = (index / (steps.length - 1)) * 100;
                  const isActive = index <= currentPhase;
                  const isCurrent = index === currentPhase;

                  return (
                    <div
                      key={step.phase}
                      className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3"
                      style={{ top: `${dotPosition}%` }}
                    >
                      {/* Dot with ring for current */}
                      <div className="relative">
                        {isCurrent && (
                          <div
                            className="absolute inset-0 bg-[#B8FF2C] animate-ping"
                            style={{ animationDuration: "1.5s" }}
                          />
                        )}
                        <div
                          className={`relative w-3 h-3  border-2 transition-all duration-500 ${
                            isActive
                              ? "bg-[#B8FF2C] border-[#B8FF2C]"
                              : "bg-[#0B0D0F] border-white/20"
                          } ${isCurrent ? "scale-125" : ""}`}
                        />
                      </div>
                      <span
                        className={`font-mono text-[10px] uppercase tracking-wider whitespace-nowrap transition-all duration-500 ${
                          isCurrent
                            ? "text-[#B8FF2C] translate-x-1"
                            : isActive
                              ? "text-[#B8FF2C]/60"
                              : "text-white/20"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
              {/* Current Step Info */}
              <div className="mb-4 lg:mb-6">
                {/* Mobile progress */}
                <div className="flex gap-1.5 mb-4 md:hidden">
                  {steps.map((step, index) => (
                    <div
                      key={step.phase}
                      className={`h-1 flex-1  transition-all duration-500 ${
                        index < currentPhase
                          ? "bg-[#B8FF2C]"
                          : index === currentPhase
                            ? "bg-[#B8FF2C]/60"
                            : "bg-white/10"
                      }`}
                      style={{
                        background:
                          index === currentPhase
                            ? `linear-gradient(to right, #B8FF2C ${resolvedPhaseProgress * 100}%, rgba(255,255,255,0.1) ${resolvedPhaseProgress * 100}%)`
                            : undefined,
                      }}
                    />
                  ))}
                </div>

                {/* Step content */}
                <div className="relative min-h-[70px]">
                  {steps.map((step, index) => (
                    <div
                      key={step.phase}
                      className="absolute inset-0"
                      style={{
                        opacity: index === currentPhase ? 1 : 0,
                        transform: `translateY(${index === currentPhase ? 0 : index < currentPhase ? -20 : 20}px)`,
                        pointerEvents: index === currentPhase ? "auto" : "none",
                        transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-xs text-[#B8FF2C]">
                          {String(index + 1).padStart(2, "0")}/
                          {String(steps.length).padStart(2, "0")}
                        </span>
                        <div className="w-6 h-px bg-white/20" />
                        <h3 className="font-heading text-xl lg:text-2xl text-white">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-[#A3A7AE] text-sm lg:text-base leading-relaxed max-w-xl pl-[72px]">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Animation Canvas */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-full max-w-[950px] aspect-[16/9]">
                  <EmailAnimation
                    phase={currentPhase}
                    phaseProgress={resolvedPhaseProgress}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmailAnimation({
  phase,
  phaseProgress,
  prefersReducedMotion = false,
}: {
  phase: number;
  phaseProgress: number;
  prefersReducedMotion?: boolean;
}) {
  // Smoother easing function
  const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));
  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

  const normalizedProgress = prefersReducedMotion ? 1 : phaseProgress;
  const easedProgress = easeInOutCubic(normalizedProgress);

  // Clean phase visibility - only current phase shows
  const getPhaseOpacity = (targetPhase: number) => {
    if (phase !== targetPhase) return 0;
    // Last phase stays fully visible
    if (targetPhase === 5) {
      return easedProgress < 0.1 ? easeOutExpo(easedProgress / 0.1) : 1;
    }
    // Fade in first 10%, fade out last 10%
    if (easedProgress < 0.1) return easeOutExpo(easedProgress / 0.1);
    if (easedProgress > 0.9)
      return 1 - easeOutExpo((easedProgress - 0.9) / 0.1);
    return 1;
  };

  // Internal progress for animations within each phase
  const getInternalProgress = () => {
    if (phase === 5) {
      if (easedProgress < 0.1) return 0;
      return (easedProgress - 0.1) / 0.9;
    }
    if (easedProgress < 0.1) return 0;
    if (easedProgress > 0.9) return 1;
    return (easedProgress - 0.1) / 0.8;
  };

  const p = getInternalProgress();

  // Staggered animation helper
  const stagger = (index: number, total: number) => {
    const delay = index / total;
    return Math.max(0, Math.min(1, (p - delay * 0.5) / (1 - delay * 0.5)));
  };

  return (
    <svg
      viewBox="0 0 960 540"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      overflow="hidden"
    >
      <defs>
        {/* Glow filter */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Soft shadow */}
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3" />
        </filter>

        {/* Gradient for cards */}
        <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1d21" />
          <stop offset="100%" stopColor="#111418" />
        </linearGradient>

        {/* Scanning line gradient */}
        <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B8FF2C" stopOpacity="0" />
          <stop offset="50%" stopColor="#B8FF2C" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#B8FF2C" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Subtle grid background */}
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path
          d="M 40 0 L 0 0 0 40"
          fill="none"
          stroke="white"
          strokeOpacity="0.02"
          strokeWidth="1"
        />
      </pattern>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* ============================================ */}
      {/* PHASE 0: User Requests Code */}
      {/* ============================================ */}
      <g
        style={{
          opacity: getPhaseOpacity(0),
          transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* App Window */}
        <g
          filter="url(#shadow)"
          style={{
            transform: `translateX(${(1 - stagger(0, 4)) * -30}px)`,
            opacity: stagger(0, 4),
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <rect
            x="120"
            y="80"
            width="280"
            height="380"
            rx="0"
            fill="url(#cardGrad)"
            stroke="#2a2d33"
            strokeWidth="1"
          />

          {/* Window header */}
          <rect x="120" y="80" width="280" height="40" rx="0" fill="#1a1d21" />
          <rect x="120" y="112" width="280" height="8" fill="#1a1d21" />
          <circle cx="144" cy="100" r="6" fill="#ff5f57" />
          <circle cx="164" cy="100" r="6" fill="#febc2e" />
          <circle cx="184" cy="100" r="6" fill="#28c840" />
          <text
            x="260"
            y="105"
            textAnchor="middle"
            fontSize="11"
            fontFamily="monospace"
            fill="#6b7280"
          >
            acme.com/login
          </text>

          {/* Form content */}
          <text
            x="150"
            y="160"
            fontSize="18"
            fontFamily="sans-serif"
            fill="#e4e4e7"
            fontWeight="600"
          >
            Log in
          </text>

          <text
            x="150"
            y="195"
            fontSize="11"
            fontFamily="sans-serif"
            fill="#6b7280"
          >
            Email
          </text>
          <rect
            x="150"
            y="205"
            width="220"
            height="40"
            rx="0"
            fill="#0B0D0F"
            stroke="#2a2d33"
            strokeWidth="1"
          />
          <text
            x="166"
            y="231"
            fontSize="13"
            fontFamily="monospace"
            fill="#A3A7AE"
          >
            alex@acme.com
          </text>

          <text
            x="150"
            y="275"
            fontSize="11"
            fontFamily="sans-serif"
            fill="#6b7280"
          >
            Password
          </text>
          <rect
            x="150"
            y="285"
            width="220"
            height="40"
            rx="0"
            fill="#0B0D0F"
            stroke="#2a2d33"
            strokeWidth="1"
          />
          <text
            x="166"
            y="311"
            fontSize="13"
            fontFamily="monospace"
            fill="#6b7280"
          >
            ••••••••••
          </text>

          {/* Submit button */}
          <rect
            x="150"
            y="355"
            width="220"
            height="48"
            rx="0"
            fill={p > 0.3 ? "#9FE622" : "#B8FF2C"}
            style={{ transition: "fill 0.2s" }}
          />
          <text
            x="260"
            y="385"
            textAnchor="middle"
            fontSize="14"
            fontFamily="sans-serif"
            fill="#0B0D0F"
            fontWeight="600"
          >
            {p > 0.3 ? "Sending..." : "Send code"}
          </text>

          {/* Click ripple */}
          {p > 0.25 && p < 0.6 && (
            <circle
              cx="260"
              cy="379"
              r={20 + (p - 0.25) * 100}
              fill="#B8FF2C"
              opacity={0.3 - (p - 0.25) * 0.8}
            />
          )}
        </g>

        {/* Email envelope flying */}
        <g
          style={{
            opacity: p > 0.4 ? 1 : 0,
            transform: `translate(${p > 0.4 ? (p - 0.4) * 550 : 0}px, ${p > 0.4 ? Math.sin((p - 0.4) * Math.PI * 2) * 30 : 0}px) rotate(${p > 0.4 ? (p - 0.4) * -10 : 0}deg)`,
            transformOrigin: "480px 270px",
            transition: "opacity 0.3s",
          }}
        >
          <g transform="translate(420, 250)">
            {/* Envelope body */}
            <rect
              x="-40"
              y="-25"
              width="80"
              height="55"
              rx="0"
              fill="#1a1d21"
              stroke="#B8FF2C"
              strokeWidth="2"
            />
            {/* Envelope flap */}
            <path
              d="M-40 -25 L0 10 L40 -25"
              fill="none"
              stroke="#B8FF2C"
              strokeWidth="2"
            />

            {/* Motion trail */}
            <line
              x1="-65"
              y1="-8"
              x2="-50"
              y2="-8"
              stroke="#B8FF2C"
              strokeWidth="2"
              opacity="0.4"
            />
            <line
              x1="-70"
              y1="2"
              x2="-52"
              y2="2"
              stroke="#B8FF2C"
              strokeWidth="2"
              opacity="0.6"
            />
            <line
              x1="-65"
              y1="12"
              x2="-50"
              y2="12"
              stroke="#B8FF2C"
              strokeWidth="2"
              opacity="0.4"
            />
          </g>
        </g>

        {/* Plop inbox waiting */}
        <g
          style={{
            opacity: 0.4 + p * 0.6,
            transform: `translateX(${(1 - p) * 20}px)`,
            transition: "all 0.3s",
          }}
        >
          <rect
            x="640"
            y="140"
            width="220"
            height="260"
            rx="0"
            fill="url(#cardGrad)"
            stroke="#2a2d33"
            strokeWidth="1"
            strokeDasharray={p > 0.7 ? "0" : "6 6"}
          />
          <text
            x="750"
            y="280"
            textAnchor="middle"
            fontSize="11"
            fontFamily="monospace"
            fill="#6b7280"
          >
            qa+login@in.plop.email
          </text>
          <text
            x="750"
            y="305"
            textAnchor="middle"
            fontSize="11"
            fontFamily="monospace"
            fill="#4b5563"
          >
            {p > 0.7 ? "incoming..." : "listening..."}
          </text>

          {/* Pulsing dot when receiving */}
          {p > 0.7 && (
            <circle
              cx="750"
              cy="250"
              r="8"
              fill="#B8FF2C"
              opacity={0.3 + Math.sin(p * 20) * 0.3}
            >
              <animate
                attributeName="r"
                values="8;16;8"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </g>
      </g>

      {/* ============================================ */}
      {/* PHASE 1: Inbox Receives Email */}
      {/* ============================================ */}
      <g
        style={{
          opacity: getPhaseOpacity(1),
          transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Inbox panel */}
        <g filter="url(#shadow)">
          <rect
            x="280"
            y="60"
            width="400"
            height="420"
            rx="0"
            fill="url(#cardGrad)"
            stroke="#B8FF2C"
            strokeWidth="2"
          />

          {/* Header */}
          <rect x="280" y="60" width="400" height="48" rx="0" fill="#1a1d21" />
          <rect x="280" y="100" width="400" height="8" fill="#1a1d21" />

          <g transform="translate(300, 84)">
            <rect width="28" height="28" rx="0" fill="#B8FF2C" opacity="0.2" />
            <text
              x="14"
              y="19"
              textAnchor="middle"
              fontSize="14"
              fill="#B8FF2C"
            >
              📬
            </text>
          </g>
          <text
            x="340"
            y="92"
            fontSize="14"
            fontFamily="sans-serif"
            fill="#e4e4e7"
            fontWeight="600"
          >
            Plop Inbox
          </text>
          <g transform="translate(620, 76)">
            <circle cx="0" cy="8" r="4" fill="#B8FF2C" />
            <text
              x="12"
              y="12"
              fontSize="11"
              fontFamily="monospace"
              fill="#B8FF2C"
            >
              LIVE
            </text>
          </g>

          {/* Email arriving with slide */}
          <g
            style={{
              transform: `translateY(${(1 - easeOutExpo(Math.min(1, p * 1.5))) * -50}px)`,
              opacity: easeOutExpo(Math.min(1, p * 1.5)),
            }}
          >
            <rect
              x="300"
              y="125"
              width="360"
              height="100"
              rx="0"
              fill="#0B0D0F"
              stroke="#B8FF2C"
              strokeWidth="1"
            />

            {/* Sender avatar */}
            <circle cx="340" cy="175" r="24" fill="#B8FF2C" opacity="0.15" />
            <text
              x="340"
              y="181"
              textAnchor="middle"
              fontSize="18"
              fill="#B8FF2C"
            >
              A
            </text>

            {/* Email info */}
            <text
              x="380"
              y="158"
              fontSize="13"
              fontFamily="sans-serif"
              fill="#e4e4e7"
              fontWeight="500"
            >
              no-reply@acme.com
            </text>
            <text
              x="380"
              y="178"
              fontSize="12"
              fontFamily="sans-serif"
              fill="#A3A7AE"
            >
              Your login code
            </text>
            <text
              x="380"
              y="198"
              fontSize="11"
              fontFamily="monospace"
              fill="#6b7280"
            >
              Hi Alex, your login code is: 483920...
            </text>

            {/* NEW badge */}
            <rect
              x="600"
              y="150"
              width="44"
              height="22"
              rx="0"
              fill="#B8FF2C"
            />
            <text
              x="622"
              y="165"
              textAnchor="middle"
              fontSize="10"
              fontFamily="monospace"
              fill="#0B0D0F"
              fontWeight="700"
            >
              NEW
            </text>

            {/* Time */}
            <text
              x="600"
              y="198"
              fontSize="10"
              fontFamily="monospace"
              fill="#6b7280"
            >
              just now
            </text>
          </g>

          {/* Previous emails - faded */}
          <g opacity="0.25">
            <rect
              x="300"
              y="240"
              width="360"
              height="70"
              rx="0"
              fill="#0f1114"
              stroke="#2a2d33"
              strokeWidth="1"
            />
            <circle cx="340" cy="275" r="20" fill="#2a2d33" />
            <text
              x="380"
              y="268"
              fontSize="12"
              fontFamily="sans-serif"
              fill="#6b7280"
            >
              support@stripe.com
            </text>
            <text
              x="380"
              y="288"
              fontSize="11"
              fontFamily="sans-serif"
              fill="#4b5563"
            >
              Your invoice is ready
            </text>

            <rect
              x="300"
              y="320"
              width="360"
              height="70"
              rx="0"
              fill="#0f1114"
              stroke="#2a2d33"
              strokeWidth="1"
            />
            <circle cx="340" cy="355" r="20" fill="#2a2d33" />
            <text
              x="380"
              y="348"
              fontSize="12"
              fontFamily="sans-serif"
              fill="#6b7280"
            >
              noreply@github.com
            </text>
            <text
              x="380"
              y="368"
              fontSize="11"
              fontFamily="sans-serif"
              fill="#4b5563"
            >
              Security alert
            </text>

            <rect
              x="300"
              y="400"
              width="360"
              height="60"
              rx="0"
              fill="#0f1114"
              stroke="#2a2d33"
              strokeWidth="1"
            />
            <circle cx="340" cy="430" r="16" fill="#2a2d33" />
            <text
              x="380"
              y="435"
              fontSize="11"
              fontFamily="sans-serif"
              fill="#4b5563"
            >
              qa+login@in.plop.email
            </text>
          </g>
        </g>

        {/* Speed indicator */}
        <g
          style={{
            opacity: p > 0.4 ? 1 : 0,
            transform: `translateY(${p > 0.4 ? 0 : 20}px)`,
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <rect
            x="380"
            y="495"
            width="200"
            height="36"
            rx="0"
            fill="#0B0D0F"
            stroke="#B8FF2C"
            strokeWidth="1"
          />
          <text
            x="480"
            y="518"
            textAnchor="middle"
            fontSize="12"
            fontFamily="monospace"
            fill="#B8FF2C"
          >
            ⚡ EMAIL CAPTURED
          </text>
        </g>
      </g>

      {/* ============================================ */}
      {/* PHASE 2: Extract Key Fields */}
      {/* ============================================ */}
      <g
        style={{
          opacity: getPhaseOpacity(2),
          transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Email content panel */}
        <g filter="url(#shadow)">
          <rect
            x="160"
            y="60"
            width="320"
            height="420"
            rx="0"
            fill="url(#cardGrad)"
            stroke="#2a2d33"
            strokeWidth="1"
          />

          {/* Header */}
          <rect x="160" y="60" width="320" height="48" rx="0" fill="#1a1d21" />
          <rect x="160" y="100" width="320" height="8" fill="#1a1d21" />
          <text
            x="320"
            y="90"
            textAnchor="middle"
            fontSize="11"
            fontFamily="monospace"
            fill="#6b7280"
          >
            email preview
          </text>

          {/* Email content */}
          <g transform="translate(185, 125)">
            <text fontSize="11" fontFamily="monospace" fill="#6b7280">
              From: no-reply@acme.com
            </text>
            <text y="18" fontSize="11" fontFamily="monospace" fill="#6b7280">
              Subject: Your login code
            </text>
            <line
              x1="0"
              y1="35"
              x2="270"
              y2="35"
              stroke="#2a2d33"
              strokeWidth="1"
            />

            <text y="65" fontSize="14" fill="#e4e4e7">
              Hi Alex,
            </text>
            <text y="95" fontSize="14" fill="#e4e4e7">
              Your login code is:
            </text>

            {/* Code - highlighted when scanned */}
            <rect
              x="-5"
              y="110"
              width="155"
              height="60"
              rx="0"
              fill="#B8FF2C"
              opacity={p > 0.3 ? 0.15 : 0}
              stroke="#B8FF2C"
              strokeWidth={p > 0.5 ? 2 : 0}
              style={{ transition: "all 0.4s" }}
            />
            <text
              y="150"
              x="70"
              textAnchor="middle"
              fontSize="32"
              fontFamily="monospace"
              fill={p > 0.3 ? "#B8FF2C" : "#e4e4e7"}
              fontWeight="700"
              style={{ transition: "fill 0.3s" }}
            >
              483920
            </text>

            {/* Expiry text - highlighted */}
            <rect
              x="-5"
              y="185"
              width="220"
              height="28"
              rx="0"
              fill="#B8FF2C"
              opacity={p > 0.6 ? 0.1 : 0}
              stroke="#B8FF2C"
              strokeWidth={p > 0.7 ? 1 : 0}
              strokeDasharray="4 4"
              style={{ transition: "all 0.3s" }}
            />
            <text
              y="205"
              fontSize="13"
              fill={p > 0.6 ? "#B8FF2C" : "#A3A7AE"}
              style={{ transition: "fill 0.3s" }}
            >
              Expires in 10 minutes.
            </text>

            <text y="245" fontSize="13" fill="#A3A7AE">
              Best,
            </text>
            <text y="265" fontSize="13" fill="#A3A7AE">
              The Acme Team
            </text>
          </g>

          {/* Scanning line */}
          <rect
            x="160"
            y={80 + p * 400}
            width="320"
            height="3"
            fill="url(#scanGrad)"
            style={{ transition: "y 2s linear" }}
          />
        </g>

        {/* Arrow */}
        <g style={{ opacity: p > 0.3 ? 1 : 0, transition: "opacity 0.3s" }}>
          <path
            d="M 490 270 L 510 270"
            stroke="#B8FF2C"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
          <polygon points="510,265 520,270 510,275" fill="#B8FF2C" />
        </g>

        {/* Extraction preview */}
        <g
          filter="url(#shadow)"
          style={{
            opacity: p > 0.35 ? 1 : 0,
            transform: `translateX(${p > 0.35 ? 0 : 30}px)`,
            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <rect
            x="520"
            y="120"
            width="300"
            height="300"
            rx="0"
            fill="url(#cardGrad)"
            stroke="#B8FF2C"
            strokeWidth="1"
          />
          <rect x="520" y="120" width="300" height="40" rx="0" fill="#1a1d21" />
          <rect x="520" y="152" width="300" height="8" fill="#1a1d21" />
          <text
            x="670"
            y="146"
            textAnchor="middle"
            fontSize="11"
            fontFamily="monospace"
            fill="#B8FF2C"
          >
            extracted fields
          </text>

          {/* JSON preview */}
          <g transform="translate(545, 180)">
            <text fontSize="13" fontFamily="monospace" fill="#B8FF2C">
              {"{"}
            </text>

            <g style={{ opacity: stagger(0, 4), transition: "opacity 0.3s" }}>
              <text
                y="26"
                x="15"
                fontSize="12"
                fontFamily="monospace"
                fill="#A3A7AE"
              >
                "code":
              </text>
              <text
                y="26"
                x="65"
                fontSize="12"
                fontFamily="monospace"
                fill="#B8FF2C"
                fontWeight="600"
              >
                "483920"
              </text>
              <text
                y="26"
                x="140"
                fontSize="12"
                fontFamily="monospace"
                fill="#4b5563"
              >
                ,
              </text>
            </g>

            <g style={{ opacity: stagger(1, 4), transition: "opacity 0.3s" }}>
              <text
                y="50"
                x="15"
                fontSize="12"
                fontFamily="monospace"
                fill="#A3A7AE"
              >
                "expires":
              </text>
              <text
                y="50"
                x="95"
                fontSize="12"
                fontFamily="monospace"
                fill="#e4e4e7"
              >
                "10 min"
              </text>
              <text
                y="50"
                x="190"
                fontSize="12"
                fontFamily="monospace"
                fill="#4b5563"
              >
                ,
              </text>
            </g>

            <g style={{ opacity: stagger(2, 4), transition: "opacity 0.3s" }}>
              <text
                y="74"
                x="15"
                fontSize="12"
                fontFamily="monospace"
                fill="#A3A7AE"
              >
                "link":
              </text>
              <text
                y="74"
                x="85"
                fontSize="12"
                fontFamily="monospace"
                fill="#e4e4e7"
              >
                "acme.com/verify"
              </text>
              <text
                y="74"
                x="230"
                fontSize="12"
                fontFamily="monospace"
                fill="#4b5563"
              >
                ,
              </text>
            </g>

            <g style={{ opacity: stagger(3, 4), transition: "opacity 0.3s" }}>
              <text
                y="98"
                x="15"
                fontSize="12"
                fontFamily="monospace"
                fill="#A3A7AE"
              >
                "recipient":
              </text>
              <text
                y="98"
                x="90"
                fontSize="11"
                fontFamily="monospace"
                fill="#e4e4e7"
              >
                "qa+login@in.plop.email"
              </text>
            </g>

            <text y="125" fontSize="13" fontFamily="monospace" fill="#B8FF2C">
              {"}"}
            </text>
          </g>
        </g>

        {/* Status badge */}
        <g
          style={{
            opacity: p > 0.5 ? 1 : 0,
            transform: `translateY(${p > 0.5 ? 0 : 20}px)`,
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <rect
            x="380"
            y="495"
            width="200"
            height="36"
            rx="0"
            fill="#0B0D0F"
            stroke="#B8FF2C"
            strokeWidth="1"
          />
          <text
            x="480"
            y="518"
            textAnchor="middle"
            fontSize="12"
            fontFamily="monospace"
            fill="#B8FF2C"
          >
            {p < 0.7 ? "⟳ EXTRACTING..." : "✓ CODE READY"}
          </text>
        </g>
      </g>

      {/* ============================================ */}
      {/* PHASE 3: Structured Fields Ready */}
      {/* ============================================ */}
      <g
        style={{
          opacity: getPhaseOpacity(3),
          transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* JSON Schema panel */}
        <g filter="url(#shadow)">
          <rect
            x="230"
            y="50"
            width="500"
            height="440"
            rx="0"
            fill="#0f1114"
            stroke="#B8FF2C"
            strokeWidth="2"
          />

          {/* Editor header */}
          <rect x="230" y="50" width="500" height="44" rx="0" fill="#1a1d21" />
          <rect x="230" y="86" width="500" height="8" fill="#1a1d21" />
          <circle cx="256" cy="72" r="6" fill="#ff5f57" />
          <circle cx="276" cy="72" r="6" fill="#febc2e" />
          <circle cx="296" cy="72" r="6" fill="#28c840" />
          <text
            x="480"
            y="77"
            textAnchor="middle"
            fontSize="12"
            fontFamily="monospace"
            fill="#6b7280"
          >
            structured fields
          </text>

          {/* Full JSON with line numbers */}
          <g transform="translate(255, 115)">
            {/* Line numbers */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((n, i) => (
              <text
                key={n}
                y={i * 24}
                fontSize="11"
                fontFamily="monospace"
                fill="#4b5563"
              >
                {n}
              </text>
            ))}

            {/* JSON content */}
            <g transform="translate(35, 0)">
              <text
                fontSize="13"
                fontFamily="monospace"
                fill="#B8FF2C"
                style={{ opacity: stagger(0, 12) }}
              >
                {"{"}
              </text>

              <text
                y="24"
                fontSize="12"
                fontFamily="monospace"
                fill="#A3A7AE"
                style={{ opacity: stagger(1, 12) }}
              >
                {" "}
                "emailId":
              </text>
              <text
                y="24"
                x="90"
                fontSize="12"
                fontFamily="monospace"
                fill="#e4e4e7"
                style={{ opacity: stagger(1, 12) }}
              >
                "email_0123"
              </text>
              <text
                y="24"
                x="195"
                fontSize="12"
                fontFamily="monospace"
                fill="#4b5563"
                style={{ opacity: stagger(1, 12) }}
              >
                ,
              </text>

              <text
                y="48"
                fontSize="12"
                fontFamily="monospace"
                fill="#A3A7AE"
                style={{ opacity: stagger(2, 12) }}
              >
                {" "}
                "from":
              </text>
              <text
                y="48"
                x="70"
                fontSize="12"
                fontFamily="monospace"
                fill="#e4e4e7"
                style={{ opacity: stagger(2, 12) }}
              >
                "Acme"
              </text>
              <text
                y="48"
                x="245"
                fontSize="12"
                fontFamily="monospace"
                fill="#4b5563"
                style={{ opacity: stagger(2, 12) }}
              >
                ,
              </text>

              <text
                y="72"
                fontSize="12"
                fontFamily="monospace"
                fill="#A3A7AE"
                style={{ opacity: stagger(3, 12) }}
              >
                {" "}
                "subject":
              </text>
              <text
                y="72"
                x="95"
                fontSize="12"
                fontFamily="monospace"
                fill="#e4e4e7"
                style={{ opacity: stagger(3, 12) }}
              >
                "Your login code"
              </text>
              <text
                y="72"
                x="300"
                fontSize="12"
                fontFamily="monospace"
                fill="#4b5563"
                style={{ opacity: stagger(3, 12) }}
              >
                ,
              </text>

              <text
                y="96"
                fontSize="12"
                fontFamily="monospace"
                fill="#A3A7AE"
                style={{ opacity: stagger(4, 12) }}
              >
                {" "}
                "received":
              </text>
              <text
                y="96"
                x="120"
                fontSize="12"
                fontFamily="monospace"
                fill="#e4e4e7"
                style={{ opacity: stagger(4, 12) }}
              >
                "Just now"
              </text>
              <text
                y="96"
                x="260"
                fontSize="12"
                fontFamily="monospace"
                fill="#4b5563"
                style={{ opacity: stagger(4, 12) }}
              >
                ,
              </text>

              <text
                y="120"
                fontSize="12"
                fontFamily="monospace"
                fill="#A3A7AE"
                style={{ opacity: stagger(5, 12) }}
              >
                {" "}
                "inbox":
              </text>
              <text
                y="120"
                x="95"
                fontSize="12"
                fontFamily="monospace"
                fill="#e4e4e7"
                style={{ opacity: stagger(5, 12) }}
              >
                "QA"
              </text>
              <text
                y="120"
                x="130"
                fontSize="12"
                fontFamily="monospace"
                fill="#4b5563"
                style={{ opacity: stagger(5, 12) }}
              >
                ,
              </text>

              {/* Highlighted data block */}
              <rect
                x="10"
                y="135"
                width="390"
                height="85"
                rx="0"
                fill="#B8FF2C"
                opacity={stagger(6, 12) * 0.1}
              />

              <text
                y="154"
                fontSize="12"
                fontFamily="monospace"
                fill="#B8FF2C"
                style={{ opacity: stagger(6, 12) }}
              >
                {" "}
                "code":
              </text>
              <text
                y="154"
                x="75"
                fontSize="12"
                fontFamily="monospace"
                fill="#B8FF2C"
                fontWeight="700"
                style={{ opacity: stagger(6, 12) }}
              >
                "483920"
              </text>
              <text
                y="154"
                x="155"
                fontSize="12"
                fontFamily="monospace"
                fill="#4b5563"
                style={{ opacity: stagger(6, 12) }}
              >
                ,
              </text>

              <text
                y="178"
                fontSize="12"
                fontFamily="monospace"
                fill="#B8FF2C"
                style={{ opacity: stagger(7, 12) }}
              >
                {" "}
                "link":
              </text>
              <text
                y="178"
                x="100"
                fontSize="11"
                fontFamily="monospace"
                fill="#B8FF2C"
                style={{ opacity: stagger(7, 12) }}
              >
                "acme.com/verify"
              </text>
              <text
                y="178"
                x="200"
                fontSize="12"
                fontFamily="monospace"
                fill="#4b5563"
                style={{ opacity: stagger(7, 12) }}
              >
                ,
              </text>

              <text
                y="202"
                fontSize="12"
                fontFamily="monospace"
                fill="#B8FF2C"
                style={{ opacity: stagger(8, 12) }}
              >
                {" "}
                "expires":
              </text>
              <text
                y="202"
                x="120"
                fontSize="12"
                fontFamily="monospace"
                fill="#B8FF2C"
                style={{ opacity: stagger(8, 12) }}
              >
                "10 min"
              </text>

              <text
                y="226"
                fontSize="12"
                fontFamily="monospace"
                fill="#A3A7AE"
                style={{ opacity: stagger(9, 12) }}
              >
                {" "}
                "recipient":
              </text>
              <text
                y="226"
                x="110"
                fontSize="11"
                fontFamily="monospace"
                fill="#e4e4e7"
                style={{ opacity: stagger(9, 12) }}
              >
                "qa+login@in.plop.email"
              </text>

              <text
                y="260"
                fontSize="13"
                fontFamily="monospace"
                fill="#B8FF2C"
                style={{ opacity: stagger(10, 12) }}
              >
                {"}"}
              </text>
            </g>
          </g>
        </g>

        {/* TypeScript badge */}
        <g
          style={{
            opacity: p > 0.4 ? 1 : 0,
            transform: `translateY(${p > 0.4 ? 0 : 20}px)`,
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <rect
            x="380"
            y="505"
            width="200"
            height="36"
            rx="0"
            fill="#0B0D0F"
            stroke="#B8FF2C"
            strokeWidth="1"
          />
          <text
            x="480"
            y="528"
            textAnchor="middle"
            fontSize="12"
            fontFamily="monospace"
            fill="#B8FF2C"
          >
            ✓ READY TO USE
          </text>
        </g>
      </g>

      {/* ============================================ */}
      {/* PHASE 4: Use Code in Test */}
      {/* ============================================ */}
      <g
        style={{
          opacity: getPhaseOpacity(4),
          transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Code editor */}
        <g filter="url(#shadow)">
          <rect
            x="180"
            y="50"
            width="600"
            height="440"
            rx="0"
            fill="#0f1114"
            stroke="#2a2d33"
            strokeWidth="1"
          />

          {/* Editor header */}
          <rect x="180" y="50" width="600" height="44" rx="0" fill="#1a1d21" />
          <rect x="180" y="86" width="600" height="8" fill="#1a1d21" />
          <circle cx="206" cy="72" r="6" fill="#ff5f57" />
          <circle cx="226" cy="72" r="6" fill="#febc2e" />
          <circle cx="246" cy="72" r="6" fill="#28c840" />
          <text
            x="480"
            y="77"
            textAnchor="middle"
            fontSize="12"
            fontFamily="monospace"
            fill="#6b7280"
          >
            login-flow.ts
          </text>

          {/* Code content */}
          <g transform="translate(205, 115)">
            {/* Line numbers */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((n, i) => (
              <text
                key={n}
                y={i * 24}
                fontSize="11"
                fontFamily="monospace"
                fill="#4b5563"
              >
                {n}
              </text>
            ))}

            {/* Code */}
            <g transform="translate(35, 0)">
              {/* Import */}
              <g
                style={{ opacity: stagger(0, 10), transition: "opacity 0.2s" }}
              >
                <text fontSize="12" fontFamily="monospace" fill="#c586c0">
                  import
                </text>
                <text
                  x="50"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#e4e4e7"
                >
                  {" { plop } "}
                </text>
                <text
                  x="120"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#c586c0"
                >
                  from
                </text>
                <text
                  x="160"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#ce9178"
                >
                  "plop.email"
                </text>
              </g>

              {/* Select inbox */}
              <g
                style={{ opacity: stagger(1, 10), transition: "opacity 0.2s" }}
              >
                <text
                  y="48"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#569cd6"
                >
                  const
                </text>
                <text
                  y="48"
                  x="50"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#9cdcfe"
                >
                  inbox
                </text>
                <text
                  y="48"
                  x="85"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#e4e4e7"
                >
                  =
                </text>
                <text
                  y="48"
                  x="100"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#569cd6"
                >
                  plop.inbox("qa")
                </text>
              </g>

              {/* Test block */}
              <g
                style={{ opacity: stagger(2, 10), transition: "opacity 0.2s" }}
              >
                <text
                  y="96"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#dcdcaa"
                >
                  flow
                </text>
                <text
                  y="96"
                  x="30"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#e4e4e7"
                >
                  (
                </text>
                <text
                  y="96"
                  x="40"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#ce9178"
                >
                  "login flow"
                </text>
                <text
                  y="96"
                  x="175"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#e4e4e7"
                >
                  ,
                </text>
                <text
                  y="96"
                  x="185"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#569cd6"
                >
                  async
                </text>
                <text
                  y="96"
                  x="230"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#e4e4e7"
                >
                  {"() => {"}
                </text>
              </g>

              {/* Comment */}
              <g
                style={{ opacity: stagger(3, 10), transition: "opacity 0.2s" }}
              >
                <text
                  y="120"
                  x="20"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#6a9955"
                >
                  {"// trigger login email"}
                </text>
              </g>

              {/* Page login */}
              <g
                style={{ opacity: stagger(4, 10), transition: "opacity 0.2s" }}
              >
                <text
                  y="144"
                  x="20"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#569cd6"
                >
                  await
                </text>
                <text
                  y="144"
                  x="70"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#9cdcfe"
                >
                  page
                </text>
                <text
                  y="144"
                  x="100"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#e4e4e7"
                >
                  .
                </text>
                <text
                  y="144"
                  x="110"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#dcdcaa"
                >
                  login
                </text>
                <text
                  y="144"
                  x="160"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#e4e4e7"
                >
                  (
                </text>
                <text
                  y="144"
                  x="170"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#ce9178"
                >
                  "test@plop.email"
                </text>
                <text
                  y="144"
                  x="315"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#e4e4e7"
                >
                  )
                </text>
              </g>

              {/* Inbound fetch - highlighted */}
              <rect
                x="10"
                y="158"
                width="460"
                height="28"
                rx="0"
                fill="#B8FF2C"
                opacity={stagger(5, 10) * 0.12}
              />
              <g
                style={{ opacity: stagger(5, 10), transition: "opacity 0.2s" }}
              >
                <text
                  y="178"
                  x="20"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#569cd6"
                >
                  const
                </text>
                <text
                  y="178"
                  x="65"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#9cdcfe"
                >
                  code
                </text>
                <text
                  y="178"
                  x="105"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#e4e4e7"
                >
                  =
                </text>
                <text
                  y="178"
                  x="120"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#569cd6"
                >
                  await
                </text>
                <text
                  y="178"
                  x="170"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#9cdcfe"
                >
                  inbox
                </text>
                <text
                  y="178"
                  x="200"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#e4e4e7"
                >
                  .
                </text>
                <text
                  y="178"
                  x="210"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#dcdcaa"
                >
                  latest
                </text>
                <text
                  y="178"
                  x="315"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#e4e4e7"
                >
                  ("login")
                </text>
              </g>

              {/* Use code - highlighted */}
              <rect
                x="10"
                y="192"
                width="340"
                height="28"
                rx="0"
                fill="#B8FF2C"
                opacity={stagger(6, 10) * 0.12}
              />
              <g
                style={{ opacity: stagger(6, 10), transition: "opacity 0.2s" }}
              >
                <text
                  y="212"
                  x="20"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#569cd6"
                >
                  await
                </text>
                <text
                  y="212"
                  x="70"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#9cdcfe"
                >
                  page
                </text>
                <text
                  y="212"
                  x="100"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#e4e4e7"
                >
                  .
                </text>
                <text
                  y="212"
                  x="108"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#dcdcaa"
                >
                  enterCode
                </text>
                <text
                  y="212"
                  x="175"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#e4e4e7"
                >
                  (
                </text>
                <text
                  y="212"
                  x="185"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#9cdcfe"
                >
                  code
                </text>

                <text
                  y="212"
                  x="300"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#e4e4e7"
                >
                  )
                </text>
              </g>

              {/* Success */}
              <g
                style={{ opacity: stagger(7, 10), transition: "opacity 0.2s" }}
              >
                <text
                  y="250"
                  x="20"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#6a9955"
                >
                  {"// user lands on dashboard"}
                </text>
              </g>

              {/* Close */}
              <g
                style={{ opacity: stagger(8, 10), transition: "opacity 0.2s" }}
              >
                <text
                  y="284"
                  fontSize="12"
                  fontFamily="monospace"
                  fill="#e4e4e7"
                >
                  {"})"}
                </text>
              </g>
            </g>
          </g>
        </g>

        {/* Badge */}
        <g
          style={{
            opacity: p > 0.6 ? 1 : 0,
            transform: `translateY(${p > 0.6 ? 0 : 20}px)`,
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <rect
            x="365"
            y="505"
            width="230"
            height="36"
            rx="0"
            fill="#0B0D0F"
            stroke="#B8FF2C"
            strokeWidth="1"
          />
          <text
            x="480"
            y="528"
            textAnchor="middle"
            fontSize="12"
            fontFamily="monospace"
            fill="#B8FF2C"
          >
            ↑ DROP CODE INTO TEST
          </text>
        </g>
      </g>

      {/* ============================================ */}
      {/* PHASE 5: Flow Verified - STAYS VISIBLE */}
      {/* ============================================ */}
      <g
        style={{
          opacity: getPhaseOpacity(5),
          transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Terminal */}
        <g filter="url(#shadow)">
          <rect
            x="230"
            y="70"
            width="500"
            height="360"
            rx="0"
            fill="#0f1114"
            stroke="#28c840"
            strokeWidth="2"
          />

          {/* Header */}
          <rect x="230" y="70" width="500" height="44" rx="0" fill="#1a1d21" />
          <rect x="230" y="106" width="500" height="8" fill="#1a1d21" />
          <circle cx="256" cy="92" r="6" fill="#ff5f57" />
          <circle cx="276" cy="92" r="6" fill="#febc2e" />
          <circle cx="296" cy="92" r="6" fill="#28c840" />
          <text
            x="480"
            y="97"
            textAnchor="middle"
            fontSize="12"
            fontFamily="monospace"
            fill="#6b7280"
          >
            Terminal
          </text>

          {/* Terminal output */}
          <g transform="translate(260, 135)">
            <text fontSize="13" fontFamily="monospace" fill="#A3A7AE">
              $ npm test
            </text>

            <g style={{ opacity: stagger(0, 6), transition: "opacity 0.3s" }}>
              <text y="35" fontSize="12" fontFamily="monospace" fill="#6b7280">
                Running tests...
              </text>
            </g>

            <g style={{ opacity: stagger(1, 6), transition: "opacity 0.3s" }}>
              <text y="75" fontSize="13" fontFamily="monospace" fill="#28c840">
                ✓
              </text>
              <text
                y="75"
                x="25"
                fontSize="13"
                fontFamily="monospace"
                fill="#e4e4e7"
              >
                verify login flow
              </text>
              <text
                y="75"
                x="200"
                fontSize="12"
                fontFamily="monospace"
                fill="#6b7280"
              >
                (1.2s)
              </text>
            </g>

            {/* Results box */}
            <g style={{ opacity: stagger(3, 6), transition: "opacity 0.3s" }}>
              <rect
                x="0"
                y="110"
                width="440"
                height="70"
                rx="0"
                fill="#28c840"
                opacity="0.08"
                stroke="#28c840"
                strokeWidth="1"
              />
              <text
                y="140"
                x="20"
                fontSize="14"
                fontFamily="monospace"
                fill="#28c840"
              >
                Test Suites: 1 passed, 1 total
              </text>
              <text
                y="165"
                x="20"
                fontSize="14"
                fontFamily="monospace"
                fill="#28c840"
              >
                Tests: 1 passed, 1 total
              </text>
            </g>

            <g style={{ opacity: stagger(4, 6), transition: "opacity 0.3s" }}>
              <text y="210" fontSize="12" fontFamily="monospace" fill="#6b7280">
                Done in 2.3s
              </text>
            </g>
          </g>
        </g>

        {/* Big Ship It badge */}
        <g
          style={{
            opacity: p > 0.5 ? 1 : 0,
            transform: `scale(${p > 0.5 ? 1 : 0.85})`,
            transformOrigin: "480px 475px",
            transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <rect x="355" y="450" width="250" height="54" rx="0" fill="#28c840" />
          <text
            x="480"
            y="485"
            textAnchor="middle"
            fontSize="18"
            fontFamily="monospace"
            fill="#0B0D0F"
            fontWeight="700"
          >
            ✓ SHIP IT
          </text>
        </g>
      </g>
    </svg>
  );
}
