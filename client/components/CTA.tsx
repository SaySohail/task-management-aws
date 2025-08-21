// components/cta/CtaBandFooter.tsx
"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  primaryHref?: string;
  secondaryHref?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
};

export default function CtaBandFooter({
  className,
  primaryHref = "#consultation",
  secondaryHref = "#contact",
  onPrimaryClick,
  onSecondaryClick,
}: Props) {
  return (
    <section className={cn("w-full text-slate-900 dark:text-white", className)}>
      {/* CTA Band */}
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn()
          // glassy, aurora-friendly container
          }
        >
          <div className="relative z-10 px-6 py-10 md:px-10 md:py-14 text-center">
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-200">
                Ready to align technology with your strategy?
              </span>
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              Let’s discuss your priorities and map a clear, low-risk plan to
              results.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {/* Primary CTA */}
              <a
                href={primaryHref}
                onClick={onPrimaryClick}
                className={cn(
                  "group relative inline-flex items-center justify-center rounded-lg px-6 py-3",
                  "text-base md:text-lg font-semibold text-white",
                  "bg-gradient-to-br from-blue-600 to-indigo-700",
                  "ring-1 ring-inset ring-white/10",
                  "overflow-hidden", // ⬅️ clip children
                  "transition-transform duration-200 hover:-translate-y-0.5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                )}
              >
                <span className="pointer-events-none absolute inset-0 rounded-lg before:absolute before:inset-0 before:rounded-lg before:bg-white/0 before:transition before:duration-300 group-hover:before:bg-white/10" />
                <span className="relative z-10">Book a Consultation</span>
                <span
                  className="
      pointer-events-none absolute inset-0 rounded-lg
      bg-gradient-to-r from-transparent via-white/30 to-transparent
      will-change-transform
      -translate-x-[120%] group-hover:translate-x-[120%]
      transition-transform duration-500
    "
                />
              </a>

              {/* Secondary CTA */}
              <a
                href={secondaryHref}
                onClick={onSecondaryClick}
                className={cn(
                  "relative inline-flex items-center justify-center rounded-lg px-6 py-3",
                  "text-base md:text-lg font-semibold",
                  "border-2 border-slate-300 bg-white/80 text-slate-900 hover:bg-white",
                  "supports-[backdrop-filter]:backdrop-blur-md",
                  "dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:ring-1 dark:ring-inset dark:ring-white/10",
                  "overflow-hidden", // ⬅️ clip children
                  "transition-all duration-200 hover:-translate-y-0.5"
                )}
              >
                Send Us a Message
              </a>
            </div>
          </div>

          {/* subtle corner glow accents (optional) */}
          <div className="pointer-events-none absolute -top-8 -left-8 h-28 w-28 rounded-full bg-blue-400/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-pink-400/20 blur-2xl" />
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="mx-auto mt-16 w-full max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-6 border-t border-black/10 py-8 text-center dark:border-white/10 md:flex-row md:text-left">
          {/* Links */}
          <nav className="order-2 md:order-1">
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-700 dark:text-slate-300">
              {[
                "Services",
                "Industries",
                "Insights",
                "About",
                "Careers",
                "Contact",
              ].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="hover:underline underline-offset-4 decoration-slate-400/40 dark:decoration-white/40"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Copy */}
          <div className="order-1 md:order-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © TrustByte. All rights reserved.
            </p>
          </div>
        </div>

        <p className="pb-10 text-center text-sm leading-relaxed text-slate-600 dark:text-slate-400 md:text-left">
          UK-based information technology services provider delivering
          innovative, secure, and scalable digital solutions.
        </p>
      </footer>
    </section>
  );
}
