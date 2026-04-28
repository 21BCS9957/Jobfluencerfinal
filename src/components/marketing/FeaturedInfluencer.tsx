'use client';

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const creators = [
  {
    name: "Ananya Rao",
    category: "Fashion",
    followers: "214K followers",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    name: "Kabir Sethi",
    category: "Food",
    followers: "118K followers",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Meera Nair",
    category: "Travel",
    followers: "306K followers",
    avatar: "https://i.pravatar.cc/150?img=32",
  },
  {
    name: "Rohan Malhotra",
    category: "Fitness",
    followers: "192K followers",
    avatar: "https://i.pravatar.cc/150?img=60",
  },
  {
    name: "Ishita Kapoor",
    category: "Beauty",
    followers: "164K followers",
    avatar: "https://i.pravatar.cc/150?img=44",
  },
  {
    name: "Aarav Mehta",
    category: "Tech",
    followers: "89K followers",
    avatar: "https://i.pravatar.cc/150?img=15",
  },
];

export default function FeaturedInfluencer() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      gsap.set(".white-overlay", { opacity: 0 });
      gsap.set(".final-layout", { opacity: 0 });
      gsap.set(".left-content", { x: -60, opacity: 0 });
      gsap.set(".creator-card", { x: 80, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      tl.to(".marquee-track", { x: "-50%", scale: 2.5, ease: "none" }, 0)
        .to(".white-overlay", { opacity: 1, ease: "none" }, 0.4)
        .to(".marquee-wrapper", { opacity: 0, ease: "none" }, 0.4)
        .to(".final-layout", { opacity: 1, ease: "none" }, 0.65)
        .to(".left-content", { x: 0, opacity: 1, ease: "power2.out" }, 0.7)
        .to(".creator-card", { x: 0, opacity: 1, stagger: 0.08, ease: "power2.out" }, 0.75);
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <section id="featured-influencer" ref={sectionRef} className="relative h-screen w-full overflow-hidden">
      <div className="phase-yellow-bg absolute inset-0 z-0 bg-[#F5C518]" />

      <div className="marquee-wrapper absolute inset-0 z-20 flex items-center overflow-hidden">
        <div className="marquee-track flex w-max origin-center whitespace-nowrap will-change-transform">
          {Array.from({ length: 8 }).map((_, index) => (
            <span
              key={index}
              className="px-8 text-[clamp(4rem,12vw,8rem)] font-black uppercase leading-none tracking-[-0.08em] text-white"
            >
              Hire Influencers Locally
            </span>
          ))}
        </div>
      </div>

      <div className="white-overlay absolute inset-0 z-10 bg-white" />

      <div className="final-layout absolute inset-0 z-30 grid items-center gap-10 bg-white px-5 py-12 sm:px-8 lg:grid-cols-2 lg:px-[5%]">
        <div className="left-content max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-500">
            Local creator network
          </p>
          <h2 className="mt-5 text-[clamp(3rem,9vw,7rem)] font-black leading-[0.86] tracking-[-0.08em] text-zinc-950">
            Hire Influencers
            <br />
            Locally
          </h2>
          <p className="mt-6 max-w-md text-lg leading-8 text-zinc-500">
            Connect with authentic local creators who know your audience.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex rounded-full bg-zinc-950 px-7 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
          >
            Get Started
          </Link>
        </div>

        <div className="right-content grid gap-4 sm:grid-cols-2 lg:gap-5">
          {creators.map((creator, index) => (
            <div
              key={creator.name}
              data-index={index}
              className={`creator-card rounded-2xl border border-zinc-100 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ${
                index % 2 === 1 ? "lg:translate-y-8" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-yellow-100"
                />
                <div>
                  <h3 className="text-lg font-black tracking-[-0.04em] text-zinc-950">{creator.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-zinc-400">{creator.followers}</p>
                </div>
              </div>
              <span className="mt-5 inline-flex rounded-full bg-yellow-100 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-yellow-700">
                {creator.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
