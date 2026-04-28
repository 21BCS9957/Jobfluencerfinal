"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const footerColumns = [
  {
    title: "Platform",
    links: [
      "Browse Campaigns",
      "Post a Campaign",
      "Find Influencers",
      "AI Matching",
      "Secure Payments",
    ],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Blog", "Press Kit", "Contact"],
  },
  {
    title: "Legal",
    links: [
      "Privacy Policy",
      "Terms of Service",
      "Cookie Policy",
      "Creator Agreement",
      "Brand Agreement",
    ],
  },
];

const wordmark = "JOBFLUENCER".split("");

export default function BigTypographyFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    const wordmarkEl = wordmarkRef.current;
    const cursor = cursorRef.current;
    if (!footer || !wordmarkEl || !cursor) return;

    const ctx = gsap.context(() => {
      const footerTl = gsap.timeline({
        scrollTrigger: {
          trigger: footer,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      footerTl
        .to(
          ".footer-top",
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
          0,
        )
        .to(
          ".footer-divider-line",
          { scaleX: 1, duration: 0.9, ease: "power3.inOut" },
          0.3,
        )
        .to(
          ".footer-wordmark-wrap",
          { opacity: 1, y: 0, duration: 1, ease: "power4.out" },
          0.4,
        )
        .to(
          ".footer-bottom-bar",
          { opacity: 1, duration: 0.6, ease: "power2.out" },
          0.9,
        );

      gsap.from(".footer-links li", {
        scrollTrigger: {
          trigger: ".footer-top",
          start: "top 80%",
          toggleActions: "play none none none",
        },
        y: 16,
        opacity: 0,
        stagger: { amount: 0.5, from: "start" },
        duration: 0.5,
        ease: "power2.out",
        delay: 0.2,
      });

    }, footer);

    const onMove = (event: MouseEvent) => {
      gsap.to(cursor, {
        x: event.clientX,
        y: event.clientY,
        duration: 0.4,
        ease: "power2.out",
      });
    };
    const onEnter = () => {
      gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.3 });
    };
    const onLeave = () => {
      gsap.to(cursor, { scale: 0, opacity: 0, duration: 0.3 });
    };

    wordmarkEl.addEventListener("mousemove", onMove);
    wordmarkEl.addEventListener("mouseenter", onEnter);
    wordmarkEl.addEventListener("mouseleave", onLeave);

    const letters = Array.from(
      wordmarkEl.querySelectorAll<HTMLElement>(".wordmark-letter"),
    );
    const cleanupLetters = letters.map((letter) => {
      const enter = () => {
        gsap.to(letter, { y: -8, duration: 0.2, ease: "power2.out" });
      };
      const leave = () => {
        gsap.to(letter, { y: 0, duration: 0.4, ease: "elastic.out(1,0.5)" });
      };
      letter.addEventListener("mouseenter", enter);
      letter.addEventListener("mouseleave", leave);

      return () => {
        letter.removeEventListener("mouseenter", enter);
        letter.removeEventListener("mouseleave", leave);
      };
    });

    return () => {
      cleanupLetters.forEach((cleanup) => cleanup());
      wordmarkEl.removeEventListener("mousemove", onMove);
      wordmarkEl.removeEventListener("mouseenter", onEnter);
      wordmarkEl.removeEventListener("mouseleave", onLeave);
      ctx.revert();
    };
  }, []);

  return (
    <footer id="main-footer" ref={footerRef}>
      <div className="footer-top">
        <div className="footer-col footer-col--brand">
          <div className="footer-logo">
            <span className="footer-logo-dot">●</span>
            Jobfluencer
          </div>
          <p className="footer-tagline">
            India&apos;s most powerful
            <br />
            influencer marketing platform.
          </p>
          <div className="footer-badge">
            <span className="badge-dot" />
            <span>48,000+ Active Creators</span>
          </div>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title} className="footer-col">
            <h4 className="footer-col-title">{column.title}</h4>
            <ul className="footer-links">
              {column.links.map((link) => (
                <li key={link}>
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-divider-line" />

      <div className="footer-wordmark-wrap">
        <div className="footer-wordmark" id="footerWordmark" ref={wordmarkRef}>
          <span className="wordmark-default" aria-hidden>
            {wordmark.map((letter, index) => (
              <span key={`${letter}-${index}`} className="wordmark-letter">
                {letter}
              </span>
            ))}
          </span>
          <span className="wordmark-filled" aria-label="Jobfluencer">
            {wordmark.map((letter, index) => (
              <span key={`${letter}-fill-${index}`} className="wordmark-letter">
                {letter}
              </span>
            ))}
          </span>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="footer-copyright">
          <span>© 2025 Jobfluencer Pvt. Ltd.</span>
          <span className="footer-bottom-sep">·</span>
          <span>
            Made with <span aria-hidden>♥</span> in India
          </span>
        </div>

        <div className="footer-socials">
          <a href="#" className="social-btn" aria-label="Instagram">
            <Instagram aria-hidden />
          </a>
          <a href="#" className="social-btn" aria-label="Twitter/X">
            <Twitter aria-hidden />
          </a>
          <a href="#" className="social-btn" aria-label="LinkedIn">
            <Linkedin aria-hidden />
          </a>
          <a href="#" className="social-btn" aria-label="YouTube">
            <Youtube aria-hidden />
          </a>
        </div>
      </div>

      <div className="wordmark-cursor" ref={cursorRef}>
        <span>Explore</span>
      </div>
    </footer>
  );
}
