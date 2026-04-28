'use client';

import Image from "next/image";
import { motion } from "framer-motion";

const marqueeItems = [
  {
    name: "Neha Sharma",
    meta: "128K FOLLOWERS",
    text: "Booked a cafe campaign in Mumbai and got paid faster than my agency collabs...",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Urban Label",
    meta: "BRAND TEAM",
    text: "Found local fashion creators for a reel launch without scrolling Instagram for hours...",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Arjun Mehta",
    meta: "FITNESS CREATOR",
    text: "Jobfluencer matched me with wellness brands already hiring in my city...",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    name: "Glow Co.",
    meta: "D2C BEAUTY",
    text: "The creator shortlist felt curated, local, and campaign-ready from day one...",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Ishita Kapoor",
    meta: "FOOD CREATOR",
    text: "Local restaurant gigs finally feel organized, premium, and worth applying to...",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
  },
];

function MarqueeContent() {
  return (
    <>
      {marqueeItems.map((item) => (
        <div key={`${item.name}-${item.meta}`} className="flex min-w-[32rem] items-center gap-3 px-6">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-zinc-100 ring-1 ring-zinc-200">
            <Image
              src={item.avatar}
              alt={`${item.name} avatar`}
              fill
              unoptimized
              sizes="32px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.22em] text-zinc-950">
              <span>{item.name}</span>
              <span className="text-zinc-400">{item.meta}</span>
            </div>
            <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-700">
              {item.text}
            </p>
          </div>
        </div>
      ))}
    </>
  );
}

export default function BrandMarquee() {
  return (
    <section className="relative z-10 overflow-hidden border-y border-zinc-100 bg-white">
      <div className="grid min-h-14 lg:grid-cols-[19rem_1fr]">
        <div className="flex items-center border-b border-zinc-100 px-5 py-3 sm:px-8 lg:border-b-0 lg:border-r lg:border-zinc-100">
          <p className="max-w-[15rem] text-lg font-black leading-[0.92] tracking-[-0.05em] text-zinc-950 sm:text-xl">
            <span className="text-red-500">❤</span>d by 5K+ creators,
            <br />
            brands & agencies
          </p>
        </div>

        <div className="relative flex items-center overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
          <motion.div
            className="flex w-max items-center py-3"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 34, ease: "linear", repeat: Infinity }}
          >
            <MarqueeContent />
            <MarqueeContent />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
