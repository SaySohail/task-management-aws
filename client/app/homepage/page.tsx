"use client";

import React, { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { motion, useReducedMotion } from "motion/react";
import Hero from "@/components/Hero";
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

// Lazy load heavy components
const CardsCarouselDemo = lazy(() =>
  import("@/components/CardsCarousel").then((module) => ({
    default: module.CardsCarouselDemo,
  })),
);
const StickyScrollReveal = lazy(() =>
  import("@/components/Scroll").then((module) => ({
    default: module.StickyScrollReveal,
  })),
);
const CtaBandFooter = lazy(() => import("@/components/CTA"));

// Loading skeletons (slimmer)
const CarouselSkeleton = () => (
  <div className="w-full h-56 md:h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
);
const ScrollSkeleton = () => (
  <div className="w-full h-80 md:h-96 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
);
const CTASkeleton = () => (
  <div className="w-full h-28 md:h-32 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
);

/* ---------- Fixed Gradient Background (no vertical clipping) ---------- */
const GradientBackground = React.memo(function GradientBackground({
  children,
  className = "",
  enableAnimation = true,
}: {
  children: React.ReactNode;
  className?: string;
  enableAnimation?: boolean;
}) {
  return (
    <div
      className={`
        relative
        min-h-screen
        supports-[height:100dvh]:min-h-[100dvh]
        min-h-[100svh]
        overflow-x-clip
        ${className}
      `}
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-x-clip">
        <div
          className={`absolute inset-0 bg-gradient-to-br from-blue-500/15 via-indigo-500/15 to-violet-500/15 ${
            enableAnimation ? "md:animate-pulse" : ""
          }`}
        />
        <div
          className={`absolute left-[10%] top-0 h-48 w-48 md:h-72 md:w-72 rounded-full bg-blue-500/25 blur-2xl ${
            enableAnimation ? "md:animate-pulse" : ""
          }`}
        />
        <div
          className={`absolute right-[10%] top-1/2 h-40 w-40 md:h-56 md:w-56 rounded-full bg-indigo-500/25 blur-2xl ${
            enableAnimation ? "md:animate-pulse md:delay-1000" : ""
          }`}
        />
        <div
          className={`absolute left-1/2 bottom-1/4 h-36 w-36 md:h-52 md:w-52 -translate-x-1/2 rounded-full bg-violet-500/25 blur-2xl ${
            enableAnimation ? "md:animate-pulse md:delay-2000" : ""
          }`}
        />
      </div>

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
});

/* ---------- Theme toggle ---------- */
const ThemeToggle = React.memo(function ThemeToggle({
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

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = useMemo(() => {
    return () => {
      const current = theme === "system" ? resolvedTheme : theme;
      const isDark = current === "dark";
      setTheme(isDark ? "light" : "dark");
      onAfterToggle?.();
    };
  }, [theme, resolvedTheme, setTheme, onAfterToggle]);

  if (!mounted) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md ${
          withLabel ? "py-2.5 gap-2.5" : "h-9 w-9"
        } ${className}`}
      >
        <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
        {withLabel && (
          <div className="w-16 h-3.5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
        )}
      </div>
    );
  }

  const current = theme === "system" ? resolvedTheme : theme;
  const isDark = current === "dark";

  const base =
    "inline-flex items-center justify-center rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md transition-colors hover:bg-white/20 dark:hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`${base} ${withLabel ? "py-2.5 gap-2.5" : "h-9 w-9"} ${className}`}
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
});

export default function GradientBackgroundDemo() {
  const shouldReduceMotion = useReducedMotion();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLowPerformanceDevice, setIsLowPerformanceDevice] = useState(false);

  useEffect(() => {
    const checkPerformance = () => {
      const cores = navigator.hardwareConcurrency || 1;
      const memory = (navigator as any).deviceMemory || 4;
      const connection = (navigator as any).connection;
      const isSlowConnection =
        connection &&
        (connection.effectiveType === "slow-2g" ||
          connection.effectiveType === "2g" ||
          connection.saveData);
      const isLowPerf = cores <= 2 || memory <= 2 || isSlowConnection;
      setIsLowPerformanceDevice(isLowPerf);
      sessionStorage.setItem("isLowPerformanceDevice", String(isLowPerf));
    };
    const cached = sessionStorage.getItem("isLowPerformanceDevice");
    if (cached !== null) setIsLowPerformanceDevice(cached === "true");
    else checkPerformance();
  }, []);

  const navItems = useMemo(
    () => [
      { name: "What We Do", link: "#what-we-do" },
      { name: "How We Work", link: "#how-we-work" },
      { name: "Contact", link: "#contact" },
    ],
    [],
  );

  const closeMobileMenu = useMemo(() => () => setIsMobileMenuOpen(false), []);

  const getMotionProps = (defaultProps: any) => {
    if (shouldReduceMotion || isLowPerformanceDevice) {
      return {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true, amount: 0.1 },
        transition: { duration: 0.3 },
      };
    }
    return {
      ...defaultProps,
      style: { ...(defaultProps?.style || {}), overflowX: "clip" },
    };
  };

  const enableAnimations = !shouldReduceMotion && !isLowPerformanceDevice;

  return (
    <GradientBackground
      className="text-gray-900 dark:text-white"
      enableAnimation={enableAnimations}
    >
      <div id="top" />

      <motion.div
        {...getMotionProps({
          initial: { opacity: 0, y: 30 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: { delay: 0.15, duration: 0.6, ease: "easeInOut" },
        })}
        className="relative z-10 flex w-full flex-col max-w-full overflow-visible"
      >
        {/* Navbar (compact) */}
        <div className="w-full sticky top-0 z-50 bg-transparent">
          <div className="mx-auto w-full max-w-7xl relative z-10 px-4 sm:px-6 lg:px-8 py-2">
            <ResizableNavbar>
              <NavBody>
                <NavbarLogo />
                <NavItems items={navItems} />
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <NavbarButton as={Link} href="/login" variant="secondary" className="h-9 px-3">
                    Sign In
                  </NavbarButton>
                </div>
              </NavBody>

              {/* Mobile */}
              <MobileNav>
                <MobileNavHeader>
                  <div onClick={closeMobileMenu}>
                    <NavbarLogo />
                  </div>
                  <MobileNavToggle
                    isOpen={isMobileMenuOpen}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  />
                </MobileNavHeader>

                <MobileNavMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu}>
                  <div className="flex flex-col space-y-4 p-4">
                    {navItems.map((item, idx) => (
                      <a
                        key={`mobile-link-${idx}`}
                        href={item.link}
                        onClick={closeMobileMenu}
                        className="block text-base font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                      >
                        {item.name}
                      </a>
                    ))}

                    <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
                      <ThemeToggle
                        withLabel
                        onAfterToggle={closeMobileMenu}
                        className="justify-start"
                      />
                    </div>

                    <NavbarButton
                      onClick={closeMobileMenu}
                      variant="secondary"
                      className="w-full h-10"
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

        {/* Hero (clamped spacing) */}
        <section className="relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="py-[clamp(2.25rem,7vw,4.5rem)]">
              <Hero />
            </div>
          </div>
        </section>

        {/* Main */}
        <main className="relative overflow-visible">
          {/* What We Do */}
          <section
            id="what-we-do"
            className="scroll-mt-20 md:scroll-mt-28 relative"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="py-[clamp(1.75rem,6vw,3.75rem)]">
                <motion.div
                  {...getMotionProps({
                    initial: { opacity: 0, y: 20 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, amount: 0.2 },
                    transition: { duration: 0.6, ease: "easeOut" },
                  })}
                  className="relative w-full max-w-full"
                >
                  <Suspense fallback={<CarouselSkeleton />}>
                    <CardsCarouselDemo />
                  </Suspense>
                </motion.div>
              </div>
            </div>
          </section>

          {/* How We Work */}
          <section
            id="how-we-work"
            className="scroll-mt-20 md:scroll-mt-28 relative"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="py-[clamp(1.75rem,6vw,3.75rem)]">
                <motion.div
                  {...getMotionProps({
                    initial: { opacity: 0, y: 20 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, amount: 0.2 },
                    transition: { duration: 0.6, ease: "easeOut" },
                  })}
                  className="relative w-full max-w-full"
                >
                  <Suspense fallback={<ScrollSkeleton />}>
                    <StickyScrollReveal />
                  </Suspense>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Contact / CTA */}
          <section id="contact" className="scroll-mt-20 md:scroll-mt-28 relative">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="pt-[clamp(1.5rem,5vw,3rem)] pb-[clamp(1.25rem,4.5vw,2.5rem)]">
                <Suspense fallback={<CTASkeleton />}>
                  <CtaBandFooter />
                </Suspense>
              </div>
            </div>
          </section>
        </main>
      </motion.div>

      {/* Safe-bottom bumper */}
      <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
    </GradientBackground>
  );
}
