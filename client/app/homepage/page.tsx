"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import Hero from "@/components/Hero";
import { CardsCarouselDemo } from "@/components/CardsCarousel";
import CtaBandFooter from "@/components/CTA";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

import {
  Navbar as ResizableNavbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { StickyScrollReveal } from "@/components/Scroll";

/* ---------- Small, SSR-safe theme toggle ---------- */
function ThemeToggle({
  withLabel = false,
  onAfterToggle,
  className = "",
}: {
  withLabel?: boolean;
  onAfterToggle?: () => void;
  className?: string;
}) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // avoid hydration mismatch

  const current = theme === "system" ? resolvedTheme : theme;
  const isDark = current === "dark";

  const handleClick = () => {
    setTheme(isDark ? "light" : "dark");
    onAfterToggle?.();
  };

  // shared icon button styles (glassy chip)
  const base =
    "inline-flex items-center justify-center rounded-full  " +
    "bg-white/10 dark:bg-black/10 backdrop-blur-md transition-colors " +
    "hover:bg-white/20 dark:hover:bg-white/20 focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-blue-500/60";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Toggle theme"
      className={`${base} ${withLabel ? " py-3 gap-3" : "h-10 w-10"} ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-neutral-800 dark:text-neutral-100" />
      ) : (
        <Moon className="h-4 w-4 text-neutral-800 dark:text-neutral-100" />
      )}
      {withLabel && (
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}

export default function AuroraBackgroundDemo() {
  const navItems = [
    { name: "What We Do", link: "#what-we-do" },
    { name: "How We Work", link: "#how-we-work" },
    { name: "Contact", link: "#contact" },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AuroraBackground className="text-gray-900 dark:text-white">
      {/* Anchor for scrolling to top */}
      <div id="top" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
        className="relative z-10 flex w-full flex-col"
      >
        {/* Navbar - Consistent top spacing */}
        <div className="w-full sticky top-0 z-50 bg-transparent">
          <div className="mx-auto w-full max-w-7xl relative z-10 px-4 sm:px-6 lg:px-8">
            <ResizableNavbar>
              {/* Desktop */}
              <NavBody>
                <NavbarLogo />
                <NavItems items={navItems} />
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <NavbarButton as={Link} href="/login" variant="secondary">
                    Sign In
                  </NavbarButton>
                </div>
              </NavBody>

              {/* Mobile */}
              <MobileNav>
                <MobileNavHeader>
                  <div onClick={() => setIsMobileMenuOpen(false)}>
                    <NavbarLogo />
                  </div>
                  <MobileNavToggle
                    isOpen={isMobileMenuOpen}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  />
                </MobileNavHeader>

                <MobileNavMenu
                  isOpen={isMobileMenuOpen}
                  onClose={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex flex-col space-y-6 p-6">
                    {/* Navigation Links */}
                    {navItems.map((item, idx) => (
                      <a
                        key={`mobile-link-${idx}`}
                        href={item.link}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-lg font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                      >
                        {item.name}
                      </a>
                    ))}

                    {/* Theme Toggle */}
                    <div className="pt-4 border-neutral-200 dark:border-neutral-700">
                      <ThemeToggle
                        withLabel
                        onAfterToggle={() => setIsMobileMenuOpen(false)}
                        className="justify-start"
                      />
                    </div>

                    {/* Sign In Button */}
                    <NavbarButton
                      onClick={() => setIsMobileMenuOpen(false)}
                      variant="secondary"
                      className="w-full"
                      as={Link}
                      href="/login"
                    >
                      Sign In
                    </NavbarButton>
                  </div>
                </MobileNavMenu>
              </MobileNav>
            </ResizableNavbar>
          </div>
        </div>

        {/* Hero Section - Optimal spacing for impact */}
        <section className="relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="py-20 sm:py-24 lg:py-32">
              <Hero />
            </div>
          </div>
        </section>

        {/* Main Content Sections - Consistent vertical rhythm */}
        <main className="relative">
          {/* What We Do Section */}
          <section
            id="what-we-do"
            className="scroll-mt-24 relative"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="py-16 sm:py-20 lg:py-24">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative w-full"
                >
                  <CardsCarouselDemo />
                </motion.div>
              </div>
            </div>
          </section>

          {/* How We Work Section */}
          <section
            id="how-we-work"
            className="scroll-mt-24 relative"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="py-16 sm:py-20 lg:py-24">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative w-full"
                >
                  <StickyScrollReveal />
                </motion.div>
              </div>
            </div>
          </section>

          {/* Contact Section - No bottom padding as footer handles it */}
          <section
            id="contact"
            className="scroll-mt-24 relative"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="pt-16 sm:pt-20 lg:pt-24">
                <CtaBandFooter />
              </div>
            </div>
          </section>
        </main>
      </motion.div>
    </AuroraBackground>
  );
}