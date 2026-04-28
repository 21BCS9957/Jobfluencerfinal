"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const workflowCards = [
  {
    step: "01",
    logoSrc: "https://cdn.simpleicons.org/meta/0668E1",
    logoAlt: "Meta logo",
    title: (
      <>
        Post or Browse
        <br />
        Campaign
      </>
    ),
    desc: "Brands post campaigns with goals and budget. Creators browse and find perfect brand fits.",
  },
  {
    step: "02",
    logoSrc: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/linkedin.svg",
    logoAlt: "LinkedIn logo",
    title: (
      <>
        Apply or
        <br />
        Invite
      </>
    ),
    desc: "Creators apply to campaigns they love. Brands can also directly invite their ideal influencer.",
  },
  {
    step: "03",
    logoSrc: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/slack.svg",
    logoAlt: "Slack logo",
    title: (
      <>
        Chat &
        <br />
        Collaborate
      </>
    ),
    desc: "Discuss deliverables, timelines, and creative direction directly through our built-in messaging system.",
  },
  {
    step: "04",
    logoSrc: "https://cdn.simpleicons.org/stripe/635BFF",
    logoAlt: "Stripe logo",
    title: (
      <>
        Hire & Secure
        <br />
        Payment
      </>
    ),
    desc: "Confirm the deal and pay securely via escrow. Funds release only after you approve the final content.",
  },
];

export default function HowJobfluencerWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".hiw-pin-container",
          start: "top top",
          end: "+=220%",
          pin: true,
          scrub: 1.8,
          anticipatePin: 1,
          pinSpacing: true,
        },
      });

      masterTl.fromTo(
        ".hiw-marquee-track",
        { x: "100vw", scale: 0.92 },
        { x: "-15%", scale: 1.16, ease: "none", duration: 0.34 },
        0,
      );

      masterTl.to(
        ".hiw-marquee-track",
        { x: "-15%", scale: 1.28, ease: "sine.inOut", duration: 0.18 },
        0.34,
      );

      masterTl.to(
        ".hiw-yellow-bg",
        { opacity: 1, ease: "power1.inOut", duration: 0.22 },
        0.54,
      );

      masterTl.to(
        ".hiw-bg-image",
        { opacity: 0, ease: "power1.inOut", duration: 0.22 },
        0.54,
      );

      masterTl.to(
        ".hiw-marquee-track",
        { x: "-50%", scale: 2.15, ease: "power1.inOut", duration: 0.22 },
        0.54,
      );

      masterTl.to(
        ".hiw-marquee-layer",
        { opacity: 0, ease: "power1.inOut", duration: 0.14 },
        0.64,
      );

      masterTl.to(
        ".hiw-final-content",
        { opacity: 1, pointerEvents: "all", ease: "none", duration: 0.06 },
        0.68,
      );

      masterTl.to(
        ".hiw-heading",
        { y: 0, ease: "power2.out", duration: 0.1 },
        0.7,
      );

      masterTl.to(
        ".hiw-card",
        {
          y: 0,
          opacity: 1,
          stagger: 0.01,
          ease: "power3.out",
          duration: 0.1,
        },
        0.7,
      );

      masterTl.from(
        ".hiw-nav-arrows",
        { opacity: 0, y: 20, duration: 0.08 },
        0.88,
      );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef}>
      <div className="hiw-pin-container">
        <div className="hiw-bg-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/how-jobfluencer-works-bg.png"
            alt="Influencer creator"
          />
          <div className="hiw-bg-overlay" />
        </div>

        <div className="hiw-yellow-bg" />

        <div className="hiw-marquee-layer">
          <div className="hiw-marquee-track">
            <span className="hiw-marquee-text">HOW JOBFLUENCER WORKS</span>
          </div>
        </div>

        <div className="hiw-final-content">
          <div className="hiw-grid-bg" />

          <h2 className="hiw-heading">
            How Jobfluencer
            <br />
            Works
          </h2>

          <div className="hiw-cards-grid">
            {workflowCards.map(({ step, logoSrc, logoAlt, title, desc }) => (
              <div key={step} className="hiw-card" data-step={step}>
                <div className="hiw-card-icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoSrc} alt={logoAlt} loading="lazy" />
                </div>
                <h3 className="hiw-card-title">{title}</h3>
                <p className="hiw-card-desc">{desc}</p>
                <a className="hiw-card-link" href="#resources">
                  Learn More <span>→</span>
                </a>
              </div>
            ))}
          </div>

          <div className="hiw-nav-arrows">
            <button
              className="hiw-arrow hiw-arrow-prev"
              type="button"
              aria-label="Previous"
            >
              ←
            </button>
            <button
              className="hiw-arrow hiw-arrow-next"
              type="button"
              aria-label="Next"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
