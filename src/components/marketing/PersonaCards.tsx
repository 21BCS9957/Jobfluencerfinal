'use client';

import type { CSSProperties, PointerEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

type Persona = {
  name: string;
  creator: string;
  location: string;
  description: string;
  href: string;
  image: string;
  imagePosition: string;
  gradient: string;
  glow: string;
  accent: string;
};

const personas: Persona[] = [
  {
    name: "The Trend Setter",
    creator: "Ananya Rao",
    location: "Mumbai",
    description: "Fashion and lifestyle creators shaping what audiences want next.",
    href: "/influencers?persona=trend-setter",
    image: "https://images.unsplash.com/photo-1774437896218-f2606dce4b18?auto=format&fit=crop&w=900&q=85",
    imagePosition: "object-[50%_center]",
    gradient: "from-[#3a102b] via-[#1b1236] to-[#090914]",
    glow: "group-hover/card:shadow-[0_30px_90px_rgba(236,72,153,0.24)]",
    accent: "bg-pink-300",
  },
  {
    name: "The Fitness Authority",
    creator: "Rohan Malhotra",
    location: "Delhi",
    description: "Gym, wellness, and transformation voices built on trust.",
    href: "/influencers?persona=fitness-authority",
    image: "https://images.pexels.com/photos/5327523/pexels-photo-5327523.jpeg?auto=compress&cs=tinysrgb&w=900&h=1200&dpr=2",
    imagePosition: "object-[52%_center]",
    gradient: "from-[#271044] via-[#111b36] to-[#090914]",
    glow: "group-hover/card:shadow-[0_30px_90px_rgba(168,85,247,0.24)]",
    accent: "bg-violet-300",
  },
  {
    name: "The Tech Explainer",
    creator: "Kabir Sethi",
    location: "Bengaluru",
    description: "SaaS and gadget creators who turn features into conviction.",
    href: "/influencers?persona=tech-explainer",
    image: "https://images.pexels.com/photos/4065876/pexels-photo-4065876.jpeg?auto=compress&cs=tinysrgb&w=900&h=1200&dpr=2",
    imagePosition: "object-[47%_center]",
    gradient: "from-[#0d2743] via-[#15133c] to-[#090914]",
    glow: "group-hover/card:shadow-[0_30px_90px_rgba(129,140,248,0.22)]",
    accent: "bg-indigo-300",
  },
  {
    name: "The Storyteller",
    creator: "Meera Nair",
    location: "Kochi",
    description: "Travel and vlog creators who make campaigns feel cinematic.",
    href: "/influencers?persona=storyteller",
    image: "https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=900&h=1200&dpr=2",
    imagePosition: "object-[44%_center]",
    gradient: "from-[#3b1f12] via-[#25143b] to-[#090914]",
    glow: "group-hover/card:shadow-[0_30px_90px_rgba(251,146,60,0.18)]",
    accent: "bg-orange-200",
  },
  {
    name: "The Food Curator",
    creator: "Ishita Kapoor",
    location: "Jaipur",
    description: "Food and hospitality influencers with local discovery power.",
    href: "/influencers?persona=food-curator",
    image: "https://images.pexels.com/photos/4910312/pexels-photo-4910312.jpeg?auto=compress&cs=tinysrgb&w=900&h=1200&dpr=2",
    imagePosition: "object-[54%_center]",
    gradient: "from-[#3a1325] via-[#21163d] to-[#090914]",
    glow: "group-hover/card:shadow-[0_30px_90px_rgba(244,114,182,0.22)]",
    accent: "bg-fuchsia-200",
  },
];

function PersonaCard({ persona, index }: { persona: Persona; index: number }) {
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  const handlePointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setGlow({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  const cardStyle = {
    "--glow-x": `${glow.x}%`,
    "--glow-y": `${glow.y}%`,
    "--parallax-x": `${(glow.x - 50) * 0.16}px`,
    "--parallax-y": `${(glow.y - 50) * 0.16}px`,
  } as CSSProperties;

  return (
    <motion.div
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ delay: index * 0.08, duration: 0.7, ease: "easeOut" }}
      className="snap-center py-4"
    >
      <Link
        href={persona.href}
        onPointerMove={handlePointerMove}
        style={cardStyle}
        className={`group/card relative block h-[22rem] w-[78vw] max-w-[19rem] overflow-hidden rounded-[1.65rem] border border-white/10 bg-gradient-to-br ${persona.gradient} p-5 text-white shadow-[0_22px_70px_rgba(15,23,42,0.16)] ring-1 ring-black/5 transition duration-500 hover:scale-[1.03] hover:border-fuchsia-300/45 sm:h-[24rem] sm:w-[18rem] lg:w-[19rem] ${persona.glow}`}
      >
        <Image
          src={persona.image}
          alt={`${persona.creator}, ${persona.name}`}
          fill
          sizes="(min-width: 1024px) 19rem, (min-width: 640px) 18rem, 78vw"
          className={`absolute inset-0 object-cover ${persona.imagePosition} transition duration-700 group-hover/card:scale-110`}
        />

        <div className="absolute inset-0 opacity-80 transition duration-700 group-hover/card:opacity-100">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-400/25 blur-3xl" />
          <div className="absolute -bottom-24 left-6 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl" />
          <div
            className="absolute inset-[-12%] bg-[radial-gradient(circle_at_var(--glow-x)_var(--glow-y),rgba(255,255,255,0.2),transparent_34%)] opacity-0 transition duration-500 group-hover/card:opacity-100"
            aria-hidden="true"
          />
        </div>

        <div
          className="absolute inset-0 transition-transform duration-300 ease-out"
          style={{ transform: "translate3d(var(--parallax-x), var(--parallax-y), 0)" }}
          aria-hidden="true"
        >
          <div className="absolute left-7 top-9 h-24 w-24 rounded-full border border-white/10" />
          <div className="absolute bottom-20 right-7 h-32 w-32 rounded-full border border-white/10" />
          <div className="absolute left-1/2 top-1/2 h-px w-48 -translate-x-1/2 rotate-[-28deg] bg-white/10" />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />

        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-white/15 bg-white/12 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
              {persona.creator}
            </span>
            <span className={`h-2.5 w-2.5 rounded-full ${persona.accent} shadow-[0_0_24px_currentColor]`} />
          </div>

          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/58">
              {persona.location}
            </p>
            <h3 className="max-w-[11rem] text-3xl font-black leading-[0.9] tracking-[-0.06em] sm:text-[2.35rem]">
              {persona.name}
            </h3>
            <p className="mt-4 max-w-[15rem] text-sm leading-6 text-white/72">{persona.description}</p>
            <span className="mt-5 inline-flex translate-y-2 items-center rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-950 opacity-0 transition duration-500 group-hover/card:translate-y-0 group-hover/card:opacity-100">
              View Creators <span className="ml-2 transition duration-500 group-hover/card:translate-x-1">→</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function PersonaCards() {
  return (
    <section id="product" className="relative overflow-hidden bg-white px-5 py-16 text-black sm:px-8 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(236,72,153,0.11),transparent_26%),radial-gradient(circle_at_84%_10%,rgba(124,58,237,0.1),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/10 to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <p className="text-xs font-black uppercase tracking-[0.28em] text-fuchsia-600/70">
            Explore Creators
          </p>
          <h2 className="mt-4 max-w-4xl text-[clamp(2.35rem,8vw,5rem)] font-black leading-[0.9] tracking-[-0.07em] text-zinc-950">
            Find the Right Voice for Your Brand
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-500 sm:text-lg">
            Swipe through creator personas built around audience trust, intent, and local influence.
          </p>
        </motion.div>
      </div>

      <div className="relative -mx-5 mt-6 overflow-x-auto overflow-y-hidden px-5 py-8 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden">
        <div className="flex snap-x snap-mandatory gap-4 px-[max(1.25rem,calc((100vw-80rem)/2+2rem))] sm:gap-5">
          {personas.map((persona, index) => (
            <PersonaCard key={persona.name} persona={persona} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
