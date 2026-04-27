'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Briefcase,
  Check,
  Eye,
  Instagram,
  MapPin,
  MessageCircle,
  Search,
  Shield,
  Sparkles,
  Users,
  Youtube,
  Zap,
} from "lucide-react";

const categories = [
  {
    id: "Photographer",
    label: "Photographer",
    desc: "Products, branding, events",
    img: "https://images.pexels.com/photos/35888640/pexels-photo-35888640.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    id: "Videographer",
    label: "Videographer",
    desc: "Reels, films, campaigns",
    img: "https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    id: "Social Media Manager",
    label: "SMM",
    desc: "Planning, posting, growth",
    img: "https://images.pexels.com/photos/577210/pexels-photo-577210.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    id: "UGC Creator",
    label: "UGC Creator",
    desc: "Ad-ready native content",
    img: "https://images.pexels.com/photos/4620868/pexels-photo-4620868.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    id: "Editor",
    label: "Editor",
    desc: "Post-production, retouching",
    img: "https://images.pexels.com/photos/695730/pexels-photo-695730.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    id: "Influencer",
    label: "Influencer",
    desc: "Campaigns and reach",
    img: "https://images.pexels.com/photos/6964858/pexels-photo-6964858.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
];

const featuredJobs = [
  {
    title: "Fashion Reel Campaign",
    brand: "Urban Label",
    category: "Influencer",
    description: "Create short-form launch content for a new streetwear drop in your city.",
    budget: "Rs.15,000 - Rs.45,000",
    deadline: "7 days left",
    href: "/jobs",
  },
  {
    title: "Cafe Content Shoot",
    brand: "Brew House",
    category: "Photographer",
    description: "Shoot menu, ambience, and creator-led social assets for a local cafe.",
    budget: "Rs.8,000 - Rs.25,000",
    deadline: "12 days left",
    href: "/jobs",
  },
  {
    title: "UGC Product Reviews",
    brand: "Glow Co.",
    category: "UGC Creator",
    description: "Produce native product demos and testimonial clips for paid ads.",
    budget: "Rs.10,000 - Rs.30,000",
    deadline: "15 days left",
    href: "/jobs",
  },
];

const featuredInfluencers = [
  { name: "Aarav Mehta", city: "Mumbai", category: "Fashion Creator", initial: "A" },
  { name: "Nisha Rao", city: "Bangalore", category: "UGC Creator", initial: "N" },
  { name: "Kabir Khan", city: "Delhi", category: "Food Influencer", initial: "K" },
  { name: "Meera Iyer", city: "Chennai", category: "Lifestyle Creator", initial: "M" },
];

const stats = [
  { value: "5K+", label: "Influencers" },
  { value: "500+", label: "Brands Hiring" },
  { value: "15+", label: "Cities" },
  { value: "200+", label: "Open Jobs" },
];

const whyCards = [
  { icon: MapPin, title: "Hire In Your City" },
  { icon: Zap, title: "Quick & Fast" },
  { icon: Shield, title: "Secure Payments" },
  { icon: Sparkles, title: "AI Powered Matching" },
];

const steps = [
  {
    icon: Briefcase,
    title: "Post Or Browse Campaigns",
    desc: "Brands post campaigns in their city. Creators browse local paid opportunities.",
  },
  {
    icon: Users,
    title: "Apply Or Invite",
    desc: "Creators apply with proposals, and brands invite the best-fit profiles.",
  },
  {
    icon: MessageCircle,
    title: "Chat & Collaborate",
    desc: "Discuss deliverables, timelines, and expectations before work starts.",
  },
  {
    icon: Shield,
    title: "Hire & Secure Payment",
    desc: "Hire creators with protected payments and clear approval workflows.",
  },
];

const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Kolkata",
  "Pune",
  "Jaipur",
  "Ahmedabad",
  "Lucknow",
  "Chandigarh",
  "Goa",
  "Kochi",
  "Indore",
  "Surat",
  "Nagpur",
  "Bhopal",
  "Patna",
  "Coimbatore",
  "Visakhapatnam",
  "Guwahati",
  "Bhubaneswar",
  "Dehradun",
  "Amritsar",
  "Varanasi",
  "Udaipur",
];

const mapCities = [
  { name: "Delhi", x: 42, y: 28, size: "lg" },
  { name: "Jaipur", x: 34, y: 33, size: "md" },
  { name: "Lucknow", x: 50, y: 31, size: "md" },
  { name: "Kolkata", x: 64, y: 40, size: "lg" },
  { name: "Ahmedabad", x: 27, y: 37, size: "md" },
  { name: "Mumbai", x: 26, y: 48, size: "lg" },
  { name: "Pune", x: 30, y: 52, size: "md" },
  { name: "Hyderabad", x: 40, y: 54, size: "lg" },
  { name: "Bangalore", x: 36, y: 65, size: "lg" },
  { name: "Chennai", x: 46, y: 64, size: "lg" },
  { name: "Kochi", x: 33, y: 75, size: "md" },
  { name: "Goa", x: 27, y: 57, size: "sm" },
  { name: "Bhopal", x: 40, y: 40, size: "sm" },
  { name: "Patna", x: 60, y: 32, size: "sm" },
  { name: "Guwahati", x: 74, y: 28, size: "sm" },
];

const gradientClasses = [
  "from-gray-900 to-gray-600",
  "from-fuchsia-700 to-purple-500",
  "from-zinc-900 to-stone-600",
  "from-slate-900 to-indigo-500",
];

function SectionHeading({
  eyebrow,
  title,
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  dark?: boolean;
}) {
  return (
    <div className="mb-10 text-center">
      {eyebrow ? (
        <p className={`mb-2 text-xs font-bold uppercase tracking-[0.24em] ${dark ? "text-white/45" : "text-gray-400"}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`text-3xl font-black uppercase tracking-[-0.04em] sm:text-4xl ${dark ? "text-white" : "text-black"}`}>
        {title}
      </h2>
    </div>
  );
}

export default function LandingSections() {
  const [citySearch, setCitySearch] = useState("");

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return [];
    return cities.filter((city) => city.toLowerCase().includes(citySearch.toLowerCase())).slice(0, 6);
  }, [citySearch]);

  return (
    <div className="bg-white text-black">
      <section id="product" className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title="Categories" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/influencers?category=${encodeURIComponent(cat.id)}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-3xl bg-gray-100"
              >
                <Image
                  src={cat.img}
                  alt={cat.label}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h3 className="text-xl font-black tracking-[-0.03em]">{cat.label}</h3>
                  <p className="mt-1 text-sm text-white/70">{cat.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold">
                    Explore <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className="bg-black px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Latest Opportunities" title="Featured Jobs" dark />
          <div className="grid gap-4 md:grid-cols-3">
            {featuredJobs.map((job) => (
              <Link key={job.title} href={job.href} className="group rounded-3xl bg-white p-6 text-black transition hover:-translate-y-1">
                <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                  {job.category}
                </span>
                <p className="mt-6 text-sm font-semibold text-gray-400">{job.brand}</p>
                <h3 className="mt-2 text-2xl font-black tracking-[-0.05em] group-hover:underline">{job.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-500">{job.description}</p>
                <div className="mt-6 space-y-2 text-sm font-semibold text-gray-600">
                  <p>{job.budget}</p>
                  <p>{job.deadline}</p>
                </div>
                <span className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-bold text-white">
                  View Details
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="agencies" className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Top Talent" title="Featured Influencers" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredInfluencers.map((creator, index) => (
              <Link key={creator.name} href="/influencers" className="group overflow-hidden rounded-3xl bg-white shadow-xl shadow-black/5 ring-1 ring-black/5">
                <div className={`flex aspect-square items-center justify-center bg-gradient-to-br ${gradientClasses[index]}`}>
                  <span className="text-6xl font-black text-white/40">{creator.initial}</span>
                </div>
                <div className="p-5">
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                    <Check className="h-5 w-5 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-black tracking-[-0.04em]">{creator.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{creator.category}</p>
                  <p className="mt-1 text-sm text-gray-400">{creator.city}</p>
                  <span className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-black px-4 py-2.5 text-sm font-bold transition group-hover:bg-black group-hover:text-white">
                    <Eye className="h-4 w-4" /> View
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-5 py-12 sm:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">{item.value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-white/45">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading title="Why Choose Jobfluencer" />
          <div className="grid grid-cols-2 gap-4">
            {whyCards.map(({ icon: Icon, title }) => (
              <div key={title} className="rounded-3xl bg-gray-50 p-7 text-center sm:p-12">
                <Icon className="mx-auto h-10 w-10 stroke-[1.5]" />
                <h3 className="mt-6 text-sm font-black uppercase tracking-[0.18em]">{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <SectionHeading title="How Jobfluencer Works?" dark />
          <p className="mx-auto -mt-6 mb-10 max-w-2xl text-sm leading-6 text-white/50">
            Jobfluencer is a local-first influencer marketplace, trusted by brands to find exceptional creative talent faster and more reliably.
          </p>
          <div className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, desc }, index) => (
              <div key={title} className="w-[280px] flex-shrink-0 snap-start rounded-3xl bg-white p-6 text-left sm:w-auto">
                <div className="mb-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black">
                    <Icon className="h-5 w-5 text-white" />
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-black text-gray-500">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.12em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="resources" className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title="Hire & Get Hired In Your City" />
          <div className="relative mx-auto mb-12 max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={citySearch}
              onChange={(event) => setCitySearch(event.target.value)}
              placeholder="Search city..."
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-black outline-none transition focus:border-gray-400"
            />
            {filteredCities.length > 0 ? (
              <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                {filteredCities.map((city) => (
                  <Link
                    key={city}
                    href={`/influencers?city=${encodeURIComponent(city)}`}
                    className="flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-600 transition hover:bg-gray-50 hover:text-black"
                    onClick={() => setCitySearch("")}
                  >
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {city}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative mx-auto aspect-square max-w-2xl rounded-[2rem] bg-gray-50">
            <div className="absolute inset-[12%] rounded-full border border-black/5" />
            <div className="absolute inset-[22%] rounded-full border border-black/5" />
            {mapCities.map((city, index) => {
              const dotSize = city.size === "lg" ? "h-3 w-3" : city.size === "md" ? "h-2.5 w-2.5" : "h-2 w-2";
              const pulseSize = city.size === "lg" ? "h-6 w-6" : city.size === "md" ? "h-5 w-5" : "h-4 w-4";

              return (
                <Link
                  key={city.name}
                  href={`/influencers?city=${encodeURIComponent(city.name)}`}
                  className="group absolute"
                  style={{ left: `${city.x}%`, top: `${city.y}%`, transform: "translate(-50%, -50%)" }}
                >
                  <span
                    className={`absolute ${pulseSize} animate-ping rounded-full bg-black/10`}
                    style={{
                      animationDuration: `${2 + (index % 3) * 0.45}s`,
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                  <span className={`relative block ${dotSize} rounded-full bg-black transition group-hover:scale-150`} />
                  <span className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-gray-500 transition group-hover:text-black">
                    {city.name}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {cities.slice(0, 10).map((city) => (
              <Link
                key={city}
                href={`/influencers?city=${encodeURIComponent(city)}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-bold text-black transition hover:bg-black hover:text-white"
              >
                <MapPin className="h-3 w-3" />
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-5 py-14 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-10 md:grid-cols-4">
            <div>
              <h3 className="text-lg font-black tracking-[-0.04em]">Jobfluencer</h3>
              <p className="mt-4 text-sm leading-6 text-white/45">Jobs for influencers. Find paid collaborations with brands in your city.</p>
            </div>
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/45">For Brands</p>
              <ul className="space-y-3 text-sm">
                <li><Link href="/post-job" className="text-white/50 hover:text-white">Post a Job</Link></li>
                <li><Link href="/influencers" className="text-white/50 hover:text-white">Find Influencers</Link></li>
                <li><Link href="/pricing" className="text-white/50 hover:text-white">Pricing</Link></li>
                <li><Link href="/register?role=brand" className="text-white/50 hover:text-white">Sign Up or Sign In</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/45">For Influencers</p>
              <ul className="space-y-3 text-sm">
                <li><Link href="/jobs" className="text-white/50 hover:text-white">Browse Jobs</Link></li>
                <li><Link href="/pricing" className="text-white/50 hover:text-white">Pricing</Link></li>
                <li><Link href="/register?role=creator" className="text-white/50 hover:text-white">Join as Influencer</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/45">Top Cities</p>
              <ul className="space-y-3 text-sm">
                {cities.slice(0, 4).map((city) => (
                  <li key={city}><Link href={`/jobs?city=${encodeURIComponent(city)}`} className="text-white/50 hover:text-white">{city}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
            <p className="text-sm text-white/35">&copy; 2026 Jobfluencer. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <Link href="#" className="text-white/50 hover:text-white"><Instagram className="h-5 w-5" /></Link>
              <Link href="#" className="text-white/50 hover:text-white"><Youtube className="h-5 w-5" /></Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
