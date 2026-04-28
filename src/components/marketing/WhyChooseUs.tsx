"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

type Feature = {
  index: string;
  title: string;
  description: string;
  logoSrc: string;
  logoAlt: string;
  logoClassName?: string;
  statNumber: string;
  statSuffix: ReactNode;
  statLabel: string;
};

const FEATURES: Feature[] = [
  {
    index: "01",
    title: "High Quality Influencers",
    description: "Quality",
    logoSrc: "https://cdn.simpleicons.org/trustpilot/F5C518",
    logoAlt: "Trustpilot logo",
    statNumber: "99",
    statSuffix: <em className="not-italic">%</em>,
    statLabel: "Verified Creators",
  },
  {
    index: "02",
    title: "Quick & Fast Results",
    description: "Speed",
    logoSrc: "https://cdn.simpleicons.org/cloudflare/F38020",
    logoAlt: "Cloudflare logo",
    statNumber: "5",
    statSuffix: (
      <span className="text-[clamp(1.25rem,3vw,2rem)]">min</span>
    ),
    statLabel: "Average Launch Time",
  },
  {
    index: "03",
    title: "Secure Payments",
    description: "Security",
    logoSrc: "https://cdn.simpleicons.org/stripe/635BFF",
    logoAlt: "Stripe logo",
    logoClassName: "scale-110",
    statNumber: "256",
    statSuffix: (
      <span className="text-[clamp(1rem,2vw,1.5rem)]">bit</span>
    ),
    statLabel: "Encryption Standard",
  },
  {
    index: "04",
    title: "AI Powered Matching",
    description: "AI",
    logoSrc: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/openai.svg",
    logoAlt: "OpenAI logo",
    statNumber: "50",
    statSuffix: (
      <span className="text-[clamp(1rem,2vw,1.5rem)]">+</span>
    ),
    statLabel: "AI Match Signals",
  },
];

export default function WhyChooseUs() {
  const sectionRef = useRef<HTMLElement>(null);
  const flightSequenceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const flightEl = flightSequenceRef.current;
    if (!section || !flightEl) return;

    const hoverCleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isMobile: "(max-width: 767px)",
          isDesktop: "(min-width: 768px)",
        },
        (context) => {
          const end =
            context.conditions?.isMobile === true ? "+=120%" : "+=200%";

          const act1 = gsap.timeline({
            scrollTrigger: {
              trigger: flightEl,
              start: "top top",
              end,
              pin: true,
              scrub: 1.2,
              anticipatePin: 1,
            },
          });

          act1.fromTo(
            ".flight-track",
            { x: "15%" },
            { x: "-40%", ease: "none", duration: 1 },
            0,
          );

          act1.fromTo(
            "#plane",
            {
              motionPath: {
                path: "#planePath",
                align: "#planePath",
                alignOrigin: [0.5, 0.5],
                autoRotate: true,
                start: -0.1,
                end: -0.1,
              },
            },
            {
              motionPath: {
                path: "#planePath",
                align: "#planePath",
                alignOrigin: [0.5, 0.5],
                autoRotate: true,
                start: -0.1,
                end: 1.1,
              },
              ease: "none",
              duration: 1,
            },
            0,
          );

          act1.to(
            ".plane-svg",
            {
              scale: 1.08,
              transformOrigin: "50% 50%",
              ease: "sine.inOut",
              yoyo: true,
              repeat: 1,
              duration: 0.22,
            },
            0.38,
          );

          act1.to(
            flightEl,
            { backgroundColor: "#FFFDF0", ease: "none", duration: 0.12 },
            0.78,
          );
          act1.to(
            flightEl,
            { backgroundColor: "#FFFFFF", ease: "none", duration: 0.12 },
            0.9,
          );

          return () => {
            act1.scrollTrigger?.kill();
            act1.kill();
          };
        },
      );

      gsap.from(".features-label", {
        y: 30,
        opacity: 0,
        duration: 0.85,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".features-label",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      section.querySelectorAll(".feature-row").forEach((row) => {
        const el = row as HTMLElement;

        gsap.from(el, {
          y: 50,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        });

        const num = el.querySelector(".feature-number");
        const div = el.querySelector(".feature-divider");
        const icon = el.querySelector(".feature-icon-wrap");
        const text = el.querySelector(".feature-text");
        const statNum = el.querySelector(".stat-number");

        const childTl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        });

        if (num) {
          childTl.from(
            num,
            {
              y: 24,
              opacity: 0,
              duration: 0.45,
              ease: "power2.out",
              immediateRender: false,
            },
            0.05,
          );
        }
        if (div) {
          childTl.from(
            div,
            {
              scaleY: 0,
              transformOrigin: "top center",
              duration: 0.5,
              ease: "power2.inOut",
              immediateRender: false,
            },
            0.12,
          );
        }
        if (icon) {
          childTl.from(
            icon,
            {
              scale: 0.6,
              opacity: 0,
              duration: 0.55,
              ease: "back.out(1.8)",
              immediateRender: false,
            },
            0.18,
          );
        }
        if (text) {
          childTl.from(
            text,
            {
              x: -20,
              opacity: 0,
              duration: 0.5,
              ease: "power2.out",
              immediateRender: false,
            },
            0.22,
          );
        }
        if (statNum) {
          childTl.from(
            statNum,
            {
              y: 20,
              opacity: 0,
              duration: 0.45,
              ease: "power2.out",
              immediateRender: false,
            },
            0.28,
          );
        }
      });
    }, section);

    const rows = section.querySelectorAll<HTMLElement>(".feature-row");

    rows.forEach((row) => {
      const numberEl = row.querySelector<HTMLElement>(".feature-number");
      const onEnter = () => {
        gsap.to(row, {
          paddingLeft: 16,
          duration: 0.35,
          ease: "power2.out",
        });
        if (numberEl) {
          gsap.to(numberEl, {
            color: "#F5C518",
            duration: 0.35,
            ease: "power2.out",
          });
        }
      };
      const onLeave = () => {
        gsap.to(row, {
          paddingLeft: 0,
          duration: 0.35,
          ease: "power2.out",
        });
        if (numberEl) {
          gsap.to(numberEl, {
            color: "#d4d4d4",
            duration: 0.35,
            ease: "power2.out",
          });
        }
      };
      row.addEventListener("mouseenter", onEnter);
      row.addEventListener("mouseleave", onLeave);
      hoverCleanups.push(() => {
        row.removeEventListener("mouseenter", onEnter);
        row.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => {
      hoverCleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="why-choose"
      ref={sectionRef}
      className="bg-white text-black"
    >
      <div
        ref={flightSequenceRef}
        className="flight-sequence relative h-[100dvh] min-h-[100svh] overflow-hidden bg-white"
      >
        <svg
          className="motion-path-svg pointer-events-none absolute inset-0 h-full w-full opacity-0"
          viewBox="0 0 1400 200"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            id="planePath"
            d="M -200,100 C 200,80 400,120 700,100 C 1000,80 1200,110 1600,100"
            fill="none"
            stroke="none"
          />
        </svg>

        <div className="flight-track-wrapper pointer-events-none absolute inset-0 flex items-center overflow-hidden">
          <div className="flight-track flex shrink-0 items-center whitespace-nowrap will-change-transform">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="inline-flex items-center">
                <span className="flight-text text-[clamp(5rem,12vw,10rem)] font-semibold tracking-[-0.03em] text-black">
                  WHY CHOOSE US
                </span>
                <span className="flight-separator mx-6 text-[clamp(2rem,5vw,4rem)] text-[#F5C518] md:mx-10">
                  ✦
                </span>
              </span>
            ))}
          </div>
        </div>

        <div
          id="plane"
          className="plane-wrapper pointer-events-none absolute left-0 top-0 z-10 h-24 w-24 md:h-28 md:w-28"
        >
          <svg
            className="plane-svg h-full w-full drop-shadow-md"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <ellipse cx="58" cy="62" rx="38" ry="14" fill="#171717" />
            <path
              d="M20 62 L55 42 L95 62 L55 82 Z"
              fill="#262626"
              stroke="#171717"
              strokeWidth="1"
            />
            <path d="M95 62 L108 58 L108 66 Z" fill="#F5C518" />
            <path d="M22 62 L8 64 L8 60 Z" fill="#F5C518" />
            <rect x="48" y="54" width="14" height="10" rx="2" fill="#93c5fd" />
            <ellipse
              cx="102"
              cy="62"
              rx="4"
              ry="6"
              fill="#F5C518"
              opacity="0.85"
            />
          </svg>
          <div className="why-plane-trail pointer-events-none absolute bottom-[18%] left-[6%] flex h-16 w-6 flex-col items-end justify-end gap-1">
            <span className="block h-3 w-1 rounded-full bg-[#F5C518]/70" />
            <span className="block h-4 w-1.5 rounded-full bg-[#F5C518]/55" />
            <span className="block h-5 w-2 rounded-full bg-[#F5C518]/40" />
          </div>
        </div>
      </div>

      <div className="features-section mx-auto max-w-5xl px-6 py-20 md:px-10 md:py-28">
        <p className="features-label mb-14 max-w-2xl text-lg font-medium leading-snug text-neutral-800 md:text-xl">
          Four reasons brands choose us over everyone else
          <span className="mt-3 block h-1 w-16 rounded-full bg-[#F5C518]" />
        </p>

        <div className="flex flex-col gap-10 md:gap-12">
          {FEATURES.map((f) => (
            <div
              key={f.index}
              className="feature-row group flex cursor-default gap-4 border-b border-[#EBEBEB] pb-10 md:gap-6 md:pb-12"
              data-index={f.index}
            >
              <span className="feature-number shrink-0 pt-1 font-mono text-sm tabular-nums text-neutral-300 md:text-base">
                {f.index}
              </span>
              <div className="feature-divider hidden w-px shrink-0 self-stretch bg-[#EBEBEB] md:block" />
              <div className="feature-content flex min-w-0 flex-1 flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-10">
                <div className="flex min-w-0 flex-1 gap-4 md:gap-5">
                  <div className="feature-icon-wrap flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#EBEBEB] bg-white shadow-[0_14px_35px_rgba(0,0,0,0.08)] md:h-14 md:w-14">
                    {/* External free SVG logos keep the row feeling more like a premium brand board. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.logoSrc}
                      alt={f.logoAlt}
                      className={`h-7 w-7 object-contain md:h-8 md:w-8 ${f.logoClassName ?? ""}`}
                      loading="lazy"
                    />
                  </div>
                  <div className="feature-text min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      {f.description}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight text-black md:text-2xl">
                      {f.title}
                    </h3>
                  </div>
                </div>
                <div className="feature-stat shrink-0 md:text-right">
                  <div className="stat-number flex flex-wrap items-baseline gap-1 text-[clamp(1.75rem,4vw,2.75rem)] font-semibold tabular-nums text-black md:justify-end">
                    <span>{f.statNumber}</span>
                    {f.statSuffix}
                  </div>
                  <p className="stat-label mt-1 text-sm text-neutral-500 md:text-base">
                    {f.statLabel}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
