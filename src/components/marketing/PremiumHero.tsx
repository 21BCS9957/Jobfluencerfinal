'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BadgeCheck, MessageCircle, ShieldCheck, Star } from "lucide-react";

const navLinks = ["Product", "Solutions", "Agencies", "Pricing", "Resources"];

const trustItems = [
  { label: "Meta Business Partner", icon: BadgeCheck },
  { label: "TikTok Marketing Partner", icon: MessageCircle },
  { label: "4.8/5 Creator Rating", icon: Star },
  { label: "Verified Brand Network", icon: ShieldCheck },
];

const heroImage = "/hero-headphones-bench.jpg";

const chatMessages = [
  "Hey, here are influencers for your campaign in your city locally.",
  "Hire influencers locally to get the best impact.",
];

export default function PremiumHero() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const navTone = Math.round(255 - scrollProgress * 238);
  const navTextColor = `rgb(${navTone}, ${navTone}, ${navTone})`;

  useEffect(() => {
    const updateScrollProgress = () => {
      setScrollProgress(Math.min(window.scrollY / 180, 1));
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });

    return () => window.removeEventListener("scroll", updateScrollProgress);
  }, []);

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#070707] text-white">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full"
        >
          <Image
            src={heroImage}
            alt=""
            aria-hidden="true"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-[62%_center]"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/25 to-black/75 lg:bg-gradient-to-r lg:from-black/70 lg:via-black/25 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(236,72,153,0.2),transparent_28%),radial-gradient(circle_at_70%_75%,rgba(124,58,237,0.22),transparent_28%)]" />

      <header
        className="fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-500"
        style={{
          backgroundColor: `rgba(255, 255, 255, ${scrollProgress * 0.96})`,
          borderColor: `rgba(${navTone}, ${navTone}, ${navTone}, ${0.1 + scrollProgress * 0.08})`,
          boxShadow: `0 18px 45px rgba(0, 0, 0, ${scrollProgress * 0.08})`,
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="text-xl font-black tracking-[-0.04em] transition-colors duration-500"
            style={{ color: navTextColor }}
          >
            Jobfluencer
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link}
                href={link === "Pricing" ? "/pricing" : `#${link.toLowerCase()}`}
                className="text-[12px] font-semibold uppercase tracking-[0.22em] transition-colors duration-500 hover:opacity-100"
                style={{ color: `rgba(${navTone}, ${navTone}, ${navTone}, ${0.72 + scrollProgress * 0.2})` }}
              >
                {link}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/register"
              className="hidden rounded-full border px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] transition duration-500 hover:scale-105 sm:inline-flex"
              style={{
                borderColor: `rgba(${navTone}, ${navTone}, ${navTone}, ${0.4 + scrollProgress * 0.25})`,
                color: navTextColor,
              }}
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="text-[11px] font-bold uppercase tracking-[0.18em] transition-colors duration-500 hover:opacity-100"
              style={{ color: `rgba(${navTone}, ${navTone}, ${navTone}, ${0.75 + scrollProgress * 0.2})` }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-between px-5 pb-7 pt-28 sm:px-8 lg:grid lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:pb-20 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <h1 className="max-w-3xl text-[clamp(2.9rem,15vw,5rem)] font-black leading-[0.86] tracking-[-0.07em] text-white lg:text-[clamp(3.3rem,8vw,6.9rem)]">
            Make every creator conversation convert.
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-7 text-white/70 sm:text-[18px]">
            Sell more, hire faster, and grow your creator network with premium workflows for
            campaigns, conversations, approvals, and payouts.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/register"
              className="inline-flex w-fit items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 px-7 py-3.5 text-[12px] font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_55px_rgba(217,70,239,0.42)] transition hover:scale-105 hover:shadow-[0_20px_70px_rgba(217,70,239,0.55)]"
            >
              Get Started
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8, ease: "easeOut" }}
          className="relative mt-10 lg:mt-0"
        >
          <div className="hidden overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl lg:hidden">
            <Image
              src={heroImage}
              alt="Relaxed creator working from a bright studio setup"
              width={900}
              height={900}
              sizes="100vw"
              className="h-[430px] w-full scale-105 object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ delay: 0.45, duration: 0.65, ease: "easeOut" }}
            className="ml-auto w-[min(15rem,72vw)] rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-3 shadow-2xl shadow-purple-950/50 sm:w-[min(19rem,80vw)] sm:p-4 lg:absolute lg:bottom-12 lg:right-16 lg:mt-0 lg:w-[min(21rem,88vw)]"
          >
            <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold leading-snug text-white sm:mb-4 sm:text-[14px]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-8 sm:w-8">
                <MessageCircle className="h-4 w-4" />
              </span>
              <span className="relative block min-h-[3.2rem] flex-1 sm:min-h-[2.6rem]">
                {chatMessages.map((message, index) => (
                  <motion.span
                    key={message}
                    aria-hidden={index === 1}
                    className="absolute inset-0 flex items-center"
                    animate={{
                      opacity: [0, 1, 1, 0, 0],
                      y: [8, 0, 0, -8, -8],
                      scale: [0.98, 1, 1, 0.98, 0.98],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      delay: index * 3,
                      times: [0, 0.12, 0.45, 0.57, 1],
                      ease: "easeOut",
                    }}
                  >
                    {message}
                  </motion.span>
                ))}
              </span>
            </div>
            <button className="w-full rounded-2xl bg-white/20 px-4 py-2.5 text-[12px] font-bold text-white backdrop-blur transition hover:scale-[1.02] hover:bg-white hover:text-purple-700 sm:px-5 sm:py-3 sm:text-[13px]">
              Hire Influencers
            </button>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.55, ease: "easeOut" }}
              className="absolute -bottom-14 left-3 max-w-[15rem] rounded-2xl bg-black/85 px-4 py-3 text-[11px] font-semibold leading-snug text-white shadow-xl sm:left-5 sm:text-[12px]"
            >
              Show me creators near my city.
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.7, ease: "easeOut" }}
          className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 opacity-70 grayscale sm:gap-x-7 lg:absolute lg:bottom-8 lg:left-8 lg:mt-12"
        >
          {trustItems.map(({ label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 text-[12px] font-semibold text-white/80">
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
