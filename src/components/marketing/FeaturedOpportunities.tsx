'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Opportunity = {
  brand: string;
  title: string;
  budget: string;
  location: string;
  category: string;
  href: string;
  video: string;
};

const spotlightVideoSrc = "/woman-recording-video-by-the-river-2026-01-22-09-25-22-utc.mp4";
const posterSrc = "/hero-headphones-bench.jpg";

const spotlight: Opportunity = {
  brand: "Nike",
  title: "Nike is hiring 12 Fitness Creators in Mumbai",
  budget: "₹50K-₹1L",
  location: "Mumbai",
  category: "Fitness",
  href: "/jobs",
  video: spotlightVideoSrc,
};

const opportunities: Opportunity[] = [
  {
    brand: "Glow Co.",
    title: "Beauty creators for a skincare launch",
    budget: "₹35K-₹80K",
    location: "Delhi",
    category: "Beauty",
    href: "/jobs",
    video: "https://videos.pexels.com/video-files/6925814/6925814-hd_1080_1920_25fps.mp4",
  },
  {
    brand: "Brew House",
    title: "Cafe storytellers for local reels",
    budget: "₹20K-₹55K",
    location: "Bangalore",
    category: "Food",
    href: "/jobs",
    video: "https://videos.pexels.com/video-files/6202070/6202070-uhd_1440_2560_24fps.mp4",
  },
  {
    brand: "Urban Label",
    title: "Streetwear creators for a drop campaign",
    budget: "₹45K-₹90K",
    location: "Mumbai",
    category: "Fashion",
    href: "/jobs",
    video: "https://videos.pexels.com/video-files/8126749/8126749-hd_1080_1920_30fps.mp4",
  },
  {
    brand: "Core Studio",
    title: "Pilates creators for a wellness launch",
    budget: "₹30K-₹75K",
    location: "Pune",
    category: "Wellness",
    href: "/jobs",
    video: "https://videos.pexels.com/video-files/6326783/6326783-hd_1080_1920_25fps.mp4",
  },
];

function ViewportVideo({ src, className = "" }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => undefined);
          return;
        }

        video.pause();
      },
      { threshold: 0.35 }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-zinc-950">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterSrc}
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
      />
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${className}`}
        poster={posterSrc}
        preload="metadata"
        muted
        loop
        playsInline
        onLoadedData={() => setIsLoaded(true)}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}

function InfoPill({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-zinc-700">
      {children}
    </span>
  );
}

function SpotlightCard() {
  const videoWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoWrapRef.current) return;

    const animation = gsap.to(videoWrapRef.current, {
      scale: 1.05,
      duration: 14,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    return () => {
      animation.kill();
    };
  }, []);

  return (
    <div className="group/spotlight overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-white shadow-[0_26px_90px_rgba(15,23,42,0.1)] ring-1 ring-fuchsia-200/30 transition duration-500 hover:scale-[1.01] hover:border-fuchsia-300/50 hover:shadow-[0_30px_100px_rgba(217,70,239,0.14)]">
      <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="order-2 flex flex-col justify-center p-6 sm:p-8 lg:order-1 lg:p-10">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-fuchsia-600/70">
            Featured Opportunity
          </p>
          <h2 className="mt-4 max-w-2xl text-[clamp(2rem,5.6vw,3.9rem)] font-black leading-[0.9] tracking-[-0.07em] text-zinc-950">
            {spotlight.title}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-zinc-500">
            High-intent campaign brief, local creator fit, and premium payout window.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <InfoPill>{spotlight.budget}</InfoPill>
            <InfoPill>{spotlight.location}</InfoPill>
            <InfoPill>{spotlight.category}</InfoPill>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={spotlight.href}
              className="inline-flex w-fit items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 px-6 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_55px_rgba(217,70,239,0.35)] transition hover:scale-105"
            >
              Apply Now <span className="ml-2">→</span>
            </Link>
            <Link
              href={spotlight.href}
              className="inline-flex w-fit items-center justify-center rounded-full border border-zinc-200 px-6 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-zinc-700 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
            >
              View Details
            </Link>
          </div>
        </div>

        <div className="order-1 relative min-h-[16rem] overflow-hidden sm:min-h-[20rem] lg:order-2 lg:min-h-[27rem]">
          <div ref={videoWrapRef} className="absolute inset-0">
            <ViewportVideo src={spotlight.video} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent lg:bg-gradient-to-r lg:from-black/45 lg:via-black/10 lg:to-transparent" />
          <div className="absolute right-5 top-5 rounded-full border border-white/15 bg-black/25 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/78 backdrop-blur-md">
            Live Brief
          </div>
        </div>
      </div>
    </div>
  );
}

function OpportunityCard({ opportunity, index }: { opportunity: Opportunity; index: number }) {
  return (
    <div className="opportunity-card snap-center py-4" data-card-index={index}>
      <Link
        href={opportunity.href}
        className="group/card relative block h-[22rem] w-[82vw] max-w-[21rem] overflow-hidden rounded-[1.65rem] border border-white/10 bg-white/[0.04] text-white shadow-[0_24px_90px_rgba(0,0,0,0.25)] transition duration-500 hover:-translate-y-1.5 hover:scale-[1.03] hover:border-fuchsia-300/40 hover:shadow-[0_30px_100px_rgba(217,70,239,0.22)] sm:w-[20rem] lg:w-[21rem]"
      >
        <ViewportVideo src={opportunity.video} className="transition duration-700 group-hover/card:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/36 to-black/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(236,72,153,0.22),transparent_34%)] opacity-0 transition duration-500 group-hover/card:opacity-100" />

        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-fuchsia-100/70">
            {opportunity.brand}
          </p>
          <h3 className="mt-3 max-w-[17rem] text-3xl font-black leading-[0.95] tracking-[-0.06em]">
            {opportunity.title}
          </h3>
          <div className="mt-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/62">
            <span>{opportunity.budget}</span>
            <span className="h-1 w-1 rounded-full bg-white/35" />
            <span>{opportunity.location}</span>
          </div>
          <span className="mt-5 inline-flex translate-y-2 rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-zinc-950 opacity-0 transition duration-500 group-hover/card:translate-y-0 group-hover/card:opacity-100">
            Apply <span className="ml-2">→</span>
          </span>
        </div>
      </Link>
    </div>
  );
}

export default function FeaturedOpportunities() {
  const sectionRef = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      if (spotlightRef.current) {
        gsap.fromTo(
          spotlightRef.current,
          { autoAlpha: 0, y: 44 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: spotlightRef.current,
              start: "top 78%",
            },
          }
        );
      }

      gsap.fromTo(
        cardRefs.current,
        { autoAlpha: 0, y: 34 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
          stagger: 0.09,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".opportunity-card",
            start: "top 86%",
          },
        }
      );
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <section
      id="solutions"
      ref={sectionRef}
      className="relative overflow-hidden bg-white px-5 py-16 text-zinc-950 sm:px-8 sm:py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(236,72,153,0.1),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(124,58,237,0.1),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-zinc-100" />

      <div className="relative mx-auto max-w-7xl">
        <div ref={spotlightRef}>
          <SpotlightCard />
        </div>

        <div className="mt-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-fuchsia-600/65">
              Premium briefs
            </p>
            <h2 className="mt-3 text-[clamp(2rem,5.4vw,3.8rem)] font-black leading-[0.9] tracking-[-0.07em] text-zinc-950">
              More campaigns opening now
            </h2>
          </div>
          <p className="hidden max-w-sm text-sm leading-6 text-zinc-500 lg:block">
            Swipe through high-fit opportunities curated for creators, not scraped like listings.
          </p>
        </div>
      </div>

      <div className="relative -mx-5 mt-4 overflow-x-auto overflow-y-hidden px-5 py-8 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden">
        <div className="flex snap-x snap-mandatory gap-5 px-[max(1.25rem,calc((100vw-80rem)/2+2rem))]">
          {opportunities.map((opportunity, index) => (
            <div
              key={opportunity.title}
              ref={(node) => {
                if (node) cardRefs.current[index] = node;
              }}
            >
              <OpportunityCard opportunity={opportunity} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
