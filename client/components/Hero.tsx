// components/hero/Hero.tsx
"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";

type Cta = { label: string; href: string };

interface HeroProps {
  title?: string;
  subtitle?: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  reassurance?: string[];
  className?: string;
  showGridOverlay?: boolean;
  useScrim?: boolean; // adds a subtle dark overlay in light mode to boost contrast
}

export default function Hero({
  title = "The IT partner you don’t have to chase",
  subtitle = "We keep your systems up, your data safe, and your plans on track — with managed IT, cloud, cyber, and custom software under one roof.",
  primaryCta = { label: "Book a Consultation", href: "#consultation" },
  secondaryCta = { label: "Explore Services", href: "#services" },
  reassurance = [
    "UK-based",
    "Security-first",
    "Business-aligned",
    "24/7 support",
  ],
  className,
  showGridOverlay = true,
  useScrim = true,
}: HeroProps) {
  function splitOnce(haystack: string, needle: string) {
    const i = haystack.toLowerCase().indexOf(needle.toLowerCase());
    if (i === -1) return [haystack, "", ""];
    return [
      haystack.slice(0, i),
      haystack.slice(i, i + needle.length),
      haystack.slice(i + needle.length),
    ];
  }
  
  const highlightText = "IT, cloud, cyber, and custom software"; //
  const [pre, hit, post] = splitOnce(subtitle, highlightText);
  
  return (
    <section className={cn("", className)}>
      {/* Optional contrast scrim (light mode only) */}
      {useScrim && (
        <div className="absolute inset-0 pointer-events-none bg-black/[0.02] dark:hidden" />
      )}

      {/* Grid overlay: subtle lines */}
      {showGridOverlay && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.08] dark:hidden"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden opacity-[0.05] dark:block"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-20 md:py-28 lg:py-32 text-center">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-8 max-w-5xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-3xl font-bold leading-[1.1] text-transparent sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl dark:from-white dark:via-slate-100 dark:to-white"
        >
          {title}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mx-auto mb-12 max-w-3xl text-lg leading-relaxed text-slate-600 sm:text-xl md:text-xl lg:text-2xl dark:text-slate-300"
        >
          {pre}
          {hit ? (
            <Highlight className="text-slate-900 dark:text-white font-semibold">
              {hit}
            </Highlight>
          ) : null}
          {post}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-16 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none"
        >
          <a
            href={primaryCta.href}
            className="group relative w-full sm:w-auto overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-lg font-semibold text-white shadow-[0_8px_30px_rgba(59,130,246,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(59,130,246,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
          >
            <span className="relative z-10">{primaryCta.label}</span>
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </a>

          {/* Secondary CTA with better contrast */}
          <a
            href={secondaryCta.href}
            className="w-full sm:w-auto rounded-xl border-2 border-slate-300 bg-white px-8 py-4 text-lg font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-1 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:ring-offset-slate-900"
          >
            {secondaryCta.label}
          </a>
        </motion.div>

        {/* Reassurance line with better spacing and styling */}
        {reassurance.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-base text-slate-500 dark:text-slate-400"
          >
            {reassurance.map((label, index) => (
              <li key={label} className="flex items-center gap-3">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-xs font-bold leading-none text-white shadow-sm">
                  ✓
                </span>
                <span className="font-medium">{label}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </div>
    </section>
  );
}