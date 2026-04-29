"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Search, X } from "lucide-react";

type City = {
  id: number;
  name: string;
  state: string;
  x: number;
  y: number;
  campaigns: number;
  creators: number;
  categories: string[];
  tier: 1 | 2 | 3;
};

const CITIES: City[] = [
  { id:1,  name:"Mumbai",       state:"Maharashtra",   x:0.22, y:0.62, campaigns:1284, creators:8420, categories:["Fashion","Food","Lifestyle"], tier:1 },
  { id:2,  name:"Delhi",        state:"Delhi",         x:0.38, y:0.28, campaigns:1102, creators:7340, categories:["Tech","Finance","Food"],      tier:1 },
  { id:3,  name:"Bangalore",    state:"Karnataka",     x:0.34, y:0.74, campaigns:986,  creators:6280, categories:["Tech","Gaming","Startup"],    tier:1 },
  { id:4,  name:"Hyderabad",    state:"Telangana",     x:0.38, y:0.65, campaigns:743,  creators:4920, categories:["Tech","Food","Fashion"],      tier:1 },
  { id:5,  name:"Chennai",      state:"Tamil Nadu",    x:0.40, y:0.78, campaigns:621,  creators:4100, categories:["Fashion","Film","Food"],      tier:1 },
  { id:6,  name:"Kolkata",      state:"West Bengal",   x:0.62, y:0.48, campaigns:534,  creators:3600, categories:["Culture","Food","Fashion"],   tier:1 },
  { id:7,  name:"Pune",         state:"Maharashtra",   x:0.25, y:0.63, campaigns:489,  creators:3200, categories:["Tech","Lifestyle","Gaming"],  tier:2 },
  { id:8,  name:"Ahmedabad",    state:"Gujarat",       x:0.20, y:0.48, campaigns:412,  creators:2800, categories:["Business","Fashion","Food"],  tier:2 },
  { id:9,  name:"Jaipur",       state:"Rajasthan",     x:0.30, y:0.35, campaigns:367,  creators:2400, categories:["Travel","Fashion","Culture"], tier:2 },
  { id:10, name:"Lucknow",      state:"Uttar Pradesh", x:0.46, y:0.32, campaigns:298,  creators:2000, categories:["Food","Culture","Lifestyle"], tier:2 },
  { id:11, name:"Chandigarh",   state:"Punjab",        x:0.34, y:0.18, campaigns:234,  creators:1600, categories:["Lifestyle","Fashion","Food"], tier:2 },
  { id:12, name:"Kochi",        state:"Kerala",        x:0.30, y:0.84, campaigns:198,  creators:1400, categories:["Travel","Food","Culture"],    tier:2 },
  { id:13, name:"Goa",          state:"Goa",           x:0.22, y:0.72, campaigns:187,  creators:1200, categories:["Travel","Lifestyle","Food"],  tier:3 },
  { id:14, name:"Indore",       state:"Madhya Pradesh",x:0.30, y:0.50, campaigns:156,  creators:1050, categories:["Food","Fashion","Business"],  tier:3 },
  { id:15, name:"Surat",        state:"Gujarat",       x:0.21, y:0.55, campaigns:276,  creators:1800, categories:["Fashion","Business","Food"],  tier:2 },
  { id:16, name:"Nagpur",       state:"Maharashtra",   x:0.36, y:0.56, campaigns:98,   creators:680,  categories:["Business","Food","Lifestyle"],tier:3 },
  { id:17, name:"Patna",        state:"Bihar",         x:0.52, y:0.38, campaigns:112,  creators:760,  categories:["Culture","Food","Education"], tier:3 },
  { id:18, name:"Bhopal",       state:"Madhya Pradesh",x:0.34, y:0.48, campaigns:134,  creators:900,  categories:["Culture","Food","Lifestyle"], tier:3 },
  { id:19, name:"Coimbatore",   state:"Tamil Nadu",    x:0.34, y:0.80, campaigns:76,   creators:520,  categories:["Fashion","Tech","Food"],      tier:3 },
  { id:20, name:"Visakhapatnam",state:"Andhra Pradesh",x:0.48, y:0.66, campaigns:87,   creators:590,  categories:["Tech","Food","Travel"],       tier:3 },
];

const CONNECTIONS = [
  [1,7],[1,8],[1,13],[1,15],
  [2,9],[2,10],[2,11],[2,6],
  [3,4],[3,5],[3,12],[3,19],
  [4,5],[4,16],[4,20],
  [6,17],[6,10],
  [8,15],[8,14],[8,9],
  [14,16],[14,18],
  [2,3],[1,4],[3,20],[5,12],
];

const formatNumber = (value: number) => value.toLocaleString("en-IN");
const INDIA_MAP_ASPECT = 666.66669 / 777.33331;

const getMapLayout = (width: number, height: number) => {
  const mapHeight = height * 0.92;
  const mapWidth = Math.min(width * 0.68, mapHeight * INDIA_MAP_ASPECT);

  return {
    left: width / 2 - mapWidth / 2,
    top: height * 0.04,
    width: mapWidth,
    height: mapHeight,
  };
};

const getBaseRadius = (city: City) => {
  if (city.tier === 1) return 5;
  if (city.tier === 2) return 3.5;
  return 2.5;
};

export default function CreatorConstellation() {
  const sectionRef = useRef<HTMLElement>(null);
  const starfieldRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hoveredCityRef = useRef<City | null>(null);
  const selectedCityRef = useRef<City | null>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const connectionProgressRef = useRef(1);
  const starProgressRef = useRef(1);
  const [card, setCard] = useState<{ city: City; left: number; top: number } | null>(null);
  const [query, setQuery] = useState("");

  const searchMatches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return CITIES.filter(
      (city) =>
        city.name.toLowerCase().includes(normalized) ||
        city.state.toLowerCase().includes(normalized),
    ).slice(0, 5);
  }, [query]);

  useEffect(() => {
    const section = sectionRef.current;
    const starfieldCanvas = starfieldRef.current;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!section || !starfieldCanvas || !canvas || !wrap) return;

    gsap.registerPlugin(ScrollTrigger);

    const sfCtx = starfieldCanvas.getContext("2d");
    const ctx = canvas.getContext("2d");
    if (!sfCtx || !ctx) return;

    const resizeCanvas = (target: HTMLCanvasElement) => {
      const ratio = window.devicePixelRatio || 1;
      const width = target.offsetWidth;
      const height = target.offsetHeight;
      target.width = width * ratio;
      target.height = height * ratio;
      const context = target.getContext("2d");
      context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const resizeAll = () => {
      resizeCanvas(starfieldCanvas);
      resizeCanvas(canvas);
    };

    resizeAll();
    window.addEventListener("resize", resizeAll);

    const cityToCanvas = (city: City) => {
      const map = getMapLayout(canvas.offsetWidth, canvas.offsetHeight);

      return {
        x: map.left + city.x * map.width,
        y: map.top + city.y * map.height,
      };
    };

    const bgStars = Array.from({ length: 200 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2,
      opacity: Math.random() * 0.5 + 0.1,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    let starfieldFrame = 0;
    let constellationFrame = 0;
    let sfTime = 0;

    const drawStarfield = () => {
      sfCtx.clearRect(0, 0, starfieldCanvas.offsetWidth, starfieldCanvas.offsetHeight);
      sfTime += 0.01;

      bgStars.forEach((star) => {
        const twinkle = Math.sin(sfTime * star.twinkleSpeed * 100 + star.twinkleOffset) * 0.3 + 0.7;
        sfCtx.beginPath();
        sfCtx.arc(
          star.x * starfieldCanvas.offsetWidth,
          star.y * starfieldCanvas.offsetHeight,
          star.r,
          0,
          Math.PI * 2,
        );
        sfCtx.fillStyle = `rgba(190,140,0,${star.opacity * twinkle * 0.55})`;
        sfCtx.fill();
      });

      starfieldFrame = requestAnimationFrame(drawStarfield);
    };

    const drawLines = () => {
      CONNECTIONS.forEach((connection, index) => {
        const progress = Math.max(0, Math.min(1, connectionProgressRef.current * CONNECTIONS.length - index));
        if (progress <= 0) return;

        const cityA = CITIES.find((city) => city.id === connection[0]);
        const cityB = CITIES.find((city) => city.id === connection[1]);
        if (!cityA || !cityB) return;

        const a = cityToCanvas(cityA);
        const b = cityToCanvas(cityB);
        const endX = a.x + (b.x - a.x) * progress;
        const endY = a.y + (b.y - a.y) * progress;
        const hoveredCity = hoveredCityRef.current;
        const isActive = Boolean(
          hoveredCity && (connection[0] === hoveredCity.id || connection[1] === hoveredCity.id),
        );

        const gradient = ctx.createLinearGradient(a.x, a.y, endX, endY);
        if (isActive) {
          gradient.addColorStop(0, "rgba(245,197,24,0.6)");
          gradient.addColorStop(0.5, "rgba(245,197,24,0.3)");
          gradient.addColorStop(1, "rgba(245,197,24,0.6)");
        } else {
          gradient.addColorStop(0, "rgba(17,24,39,0.06)");
          gradient.addColorStop(0.5, "rgba(17,24,39,0.14)");
          gradient.addColorStop(1, "rgba(17,24,39,0.06)");
        }

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = isActive ? 1.5 : 0.6;
        ctx.stroke();

        if (isActive && progress >= 1) {
          const t = (Date.now() % 2000) / 2000;
          const px = a.x + (b.x - a.x) * t;
          const py = a.y + (b.y - a.y) * t;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(245,197,24,0.9)";
          ctx.fill();
        }
      });
    };

    const drawStars = () => {
      CITIES.forEach((city, index) => {
        const progress = Math.max(0, Math.min(1, (starProgressRef.current * CITIES.length - index) * 2));
        if (progress <= 0) return;

        const { x, y } = cityToCanvas(city);
        const hoveredCity = hoveredCityRef.current;
        const selectedCity = selectedCityRef.current;
        const isHovered = hoveredCity?.id === city.id;
        const isSelected = selectedCity?.id === city.id;
        const baseR = getBaseRadius(city);
        const dist = Math.hypot(mouseRef.current.x - x, mouseRef.current.y - y);
        const proximityGlow = Math.max(0, 1 - dist / 80);
        const radius = isHovered || isSelected ? baseR * 2 : baseR + proximityGlow * 4;
        const glowR = radius * 3.5;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR);

        glow.addColorStop(0, `rgba(245,197,24,${isHovered ? 0.36 : 0.12 + proximityGlow * 0.18})`);
        glow.addColorStop(1, "rgba(245,197,24,0)");
        ctx.beginPath();
        ctx.arc(x, y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        const pulseT = (Date.now() % 3000) / 3000;
        const pulseR = baseR + pulseT * 14;
        const pulseOpacity = (1 - pulseT) * 0.3;
        ctx.beginPath();
        ctx.arc(x, y, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245,197,24,${Math.max(0.08, pulseOpacity)})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        const dotGrad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
        dotGrad.addColorStop(0, "#FFFFFF");
        dotGrad.addColorStop(0.4, "#F5C518");
        dotGrad.addColorStop(1, "#C89F00");
        ctx.beginPath();
        ctx.arc(x, y, radius * progress, 0, Math.PI * 2);
        ctx.fillStyle = dotGrad;
        ctx.fill();
      });
    };

    const drawLabels = () => {
      CITIES.forEach((city) => {
        const { x, y } = cityToCanvas(city);
        const hoveredCity = hoveredCityRef.current;
        const selectedCity = selectedCityRef.current;
        const isHovered = hoveredCity?.id === city.id;
        const isSelected = selectedCity?.id === city.id;
        if (city.tier !== 1 && !isHovered && !isSelected) return;

        const labelY = y + getBaseRadius(city) + 14;
        ctx.font = `${isHovered ? "600" : "500"} ${isHovered ? "11px" : "9px"} "Space Grotesk", sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = isHovered ? "rgba(190,140,0,0.95)" : "rgba(17,24,39,0.58)";
        ctx.fillText(city.name, x, labelY);

        if (isHovered || isSelected) {
          ctx.font = '500 8px "Inter", sans-serif';
          ctx.fillStyle = "rgba(17,24,39,0.38)";
          ctx.fillText(`${formatNumber(city.campaigns)} campaigns`, x, labelY + 13);
        }
      });
    };

    const drawConstellation = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      drawLines();
      drawStars();
      drawLabels();
      constellationFrame = requestAnimationFrame(drawConstellation);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      const found = CITIES.find((city) => {
        const { x, y } = cityToCanvas(city);
        return Math.hypot(mouseRef.current.x - x, mouseRef.current.y - y) < getBaseRadius(city) + 12;
      }) ?? null;

      hoveredCityRef.current = found;
      canvas.style.cursor = found ? "pointer" : "crosshair";
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -999, y: -999 };
      hoveredCityRef.current = null;
      canvas.style.cursor = "crosshair";
    };

    const handleClick = (event: MouseEvent) => {
      const city = hoveredCityRef.current;
      if (!city) {
        selectedCityRef.current = null;
        setCard(null);
        return;
      }

      selectedCityRef.current = city;
      const wrapRect = wrap.getBoundingClientRect();
      let left = event.clientX - wrapRect.left + 16;
      let top = event.clientY - wrapRect.top - 60;

      if (left + 240 > wrapRect.width - 16) left = event.clientX - wrapRect.left - 256;
      if (top + 300 > wrapRect.height - 16) top = event.clientY - wrapRect.top - 300;
      if (top < 0) top = 16;

      setCard({ city, left, top });
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("click", handleClick);

    const ctxAnimation = gsap.context(() => {
      const entranceTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          toggleActions: "play none none none",
        },
      });

      entranceTl
        .from(".constellation-header", { opacity: 0, y: 40, duration: 0.8, ease: "power3.out" }, 0)
        .from(".constellation-stats", { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" }, 0.3)
        .from(".constellation-canvas-wrap", { opacity: 0, duration: 0.6, ease: "power2.out" }, 0.5);

      gsap.fromTo({ value: 0 }, {
        value: 0,
      }, {
        value: 1,
        duration: 2.5,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: section,
          start: "top 60%",
          toggleActions: "play none none none",
        },
        onUpdate() {
          connectionProgressRef.current = this.targets()[0].value;
        },
      });

      gsap.fromTo({ value: 0 }, {
        value: 0,
      }, {
        value: 1,
        duration: 2,
        ease: "power2.out",
        delay: 0.3,
        scrollTrigger: {
          trigger: section,
          start: "top 60%",
          toggleActions: "play none none none",
        },
        onUpdate() {
          starProgressRef.current = this.targets()[0].value;
        },
      });

      gsap.utils.toArray<HTMLElement>(".c-stat-num").forEach((element) => {
        const target = Number(element.dataset.target ?? 0);
        gsap.to({ value: 0 }, {
          value: target,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none",
          },
          onUpdate() {
            element.textContent = Math.floor(this.targets()[0].value).toLocaleString("en-IN");
          },
        });
      });
    }, section);

    drawStarfield();
    drawConstellation();

    return () => {
      window.removeEventListener("resize", resizeAll);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("click", handleClick);
      cancelAnimationFrame(starfieldFrame);
      cancelAnimationFrame(constellationFrame);
      ctxAnimation.revert();
    };
  }, []);

  useEffect(() => {
    if (!card) return;
    const element = document.getElementById("cCityCard");
    if (!element) return;
    gsap.fromTo(
      element,
      { scale: 0.8, opacity: 0, y: 10 },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.8)" },
    );
  }, [card]);

  const closeCard = () => {
    const element = document.getElementById("cCityCard");
    selectedCityRef.current = null;
    if (!element) {
      setCard(null);
      return;
    }

    gsap.to(element, {
      scale: 0.85,
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => setCard(null),
    });
  };

  const selectCityFromSearch = (city: City) => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    selectedCityRef.current = city;
    setQuery(city.name);

    const rect = canvas.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const map = getMapLayout(rect.width, rect.height);
    const cityClientX = map.left + city.x * map.width + rect.left;
    const cityClientY = map.top + city.y * map.height + rect.top;
    let left = cityClientX - wrapRect.left + 16;
    let top = cityClientY - wrapRect.top - 60;

    if (left + 240 > wrapRect.width - 16) left = cityClientX - wrapRect.left - 256;
    if (top + 300 > wrapRect.height - 16) top = cityClientY - wrapRect.top - 300;
    if (top < 0) top = 16;

    setCard({ city, left, top });
  };

  return (
    <section id="constellation-section" ref={sectionRef}>
      <div className="constellation-bg" />
      <canvas id="starfieldCanvas" ref={starfieldRef} />

      <div className="constellation-header">
        <span className="constellation-eyebrow">
          <span className="eyebrow-dot" />
          LIVE ACROSS INDIA
        </span>
        <h2 className="constellation-title">
          The Creator
          <br />
          <em>Constellation</em>
        </h2>
        <p className="constellation-subtitle">
          Every star is a city. Every line is a connection.
          <br />
          Hover to explore campaigns near you.
        </p>
      </div>

      <div className="constellation-stats">
        <div className="c-stat">
          <span className="c-stat-num" data-target="9253">0</span>
          <span className="c-stat-lbl">Active Campaigns</span>
        </div>
        <div className="c-stat-div" />
        <div className="c-stat">
          <span className="c-stat-num" data-target="48000">0</span>
          <span className="c-stat-lbl">Creators Ready</span>
        </div>
        <div className="c-stat-div" />
        <div className="c-stat">
          <span className="c-stat-num" data-target="20">0</span>
          <span className="c-stat-lbl">Cities Live</span>
        </div>
      </div>

      <div className="constellation-canvas-wrap" ref={wrapRef}>
        <div className="constellation-map-layer" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/india-outline.svg" alt="" className="constellation-map-img" />
        </div>
        <canvas id="constellationCanvas" ref={canvasRef} />

        {card && (
          <div className="c-city-card" id="cCityCard" style={{ left: card.left, top: card.top }}>
            <div className="c-card-glow" />
            <button className="c-card-close" type="button" aria-label="Close city card" onClick={closeCard}>
              <X aria-hidden />
            </button>
            <div className="c-card-header">
              <div className="c-card-star" aria-hidden>★</div>
              <div>
                <h3>{card.city.name}</h3>
                <span>{card.city.state}</span>
              </div>
            </div>
            <div className="c-card-metrics">
              <div className="c-metric">
                <span className="c-metric-val">{formatNumber(card.city.campaigns)}</span>
                <span className="c-metric-lbl">Campaigns</span>
              </div>
              <div className="c-metric-div" />
              <div className="c-metric">
                <span className="c-metric-val">{formatNumber(card.city.creators)}</span>
                <span className="c-metric-lbl">Creators</span>
              </div>
            </div>
            <div className="c-card-cats">
              {card.city.categories.map((category) => (
                <span className="c-cat-pill" key={category}>{category}</span>
              ))}
            </div>
            <Link className="c-card-cta" href={`/campaigns?city=${encodeURIComponent(card.city.name)}`}>
              Explore Campaigns
              <ArrowRight aria-hidden />
            </Link>
          </div>
        )}

        <div className="c-search-wrap">
          <Search className="c-search-icon" aria-hidden />
          <input
            type="text"
            id="cSearchInput"
            placeholder="Search a city..."
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {searchMatches.length > 0 && (
            <div className="c-search-results" id="cSearchResults">
              {searchMatches.map((city) => (
                <button className="c-search-item" type="button" key={city.id} onClick={() => selectCityFromSearch(city)}>
                  <span>
                    <span className="c-search-item-name">{city.name}</span>
                    <span className="c-search-item-state">{city.state}</span>
                  </span>
                  <span className="c-search-item-count">{formatNumber(city.campaigns)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
