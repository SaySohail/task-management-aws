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
const CardsCarouselDemo = lazy(() => import("@/components/CardsCarousel").then(module => ({
  default: module.CardsCarouselDemo
})));
const StickyScrollReveal = lazy(() => import("@/components/Scroll").then(module => ({
  default: module.StickyScrollReveal
})));
const CtaBandFooter = lazy(() => import("@/components/CTA"));

// Loading skeleton components
const CarouselSkeleton = () => (
  <div className="w-full h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
);

const ScrollSkeleton = () => (
  <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
);

const CTASkeleton = () => (
  <div className="w-full h-32 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
);

/* ---------- Kanban-Style Gradient Background Component ---------- */
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
    <div className={`relative min-h-screen ${className}`}>
      {/* Aurora Background - similar to Kanban */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-violet-500/20 ${
            enableAnimation ? "md:animate-pulse" : ""
          }`} 
        />
        <div 
          className={`absolute left-1/4 top-0 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl md:h-96 md:w-96 ${
            enableAnimation ? "md:animate-pulse" : ""
          }`} 
        />
        <div 
          className={`absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl md:h-80 md:w-80 ${
            enableAnimation ? "md:animate-pulse md:delay-1000" : ""
          }`} 
        />
        <div 
          className={`absolute left-1/2 bottom-1/4 h-60 w-60 rounded-full bg-violet-500/30 blur-3xl md:h-72 md:w-72 ${
            enableAnimation ? "md:animate-pulse md:delay-2000" : ""
          }`} 
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});

/* ---------- Optimized theme toggle with reduced renders ---------- */
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
    // Use setTimeout to avoid hydration issues
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
    // Return a placeholder during hydration
    return (
      <div className={`inline-flex items-center justify-center rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md ${withLabel ? "py-3 gap-3" : "h-10 w-10"} ${className}`}>
        <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
        {withLabel && <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />}
      </div>
    );
  }

  const current = theme === "system" ? resolvedTheme : theme;
  const isDark = current === "dark";

  const baseClasses = "inline-flex items-center justify-center rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md transition-colors hover:bg-white/20 dark:hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`${baseClasses} ${withLabel ? "py-3 gap-3" : "h-10 w-10"} ${className}`}
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

  // Detect low-performance devices
  useEffect(() => {
    const checkPerformance = () => {
      // Check hardware concurrency (CPU cores)
      const cores = navigator.hardwareConcurrency || 1;
      
      // Check memory (if available)
      const memory = (navigator as any).deviceMemory || 4;
      
      // Check connection type
      const connection = (navigator as any).connection;
      const isSlowConnection = connection && (
        connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g' ||
        connection.saveData
      );

      // Consider device low-performance if:
      // - Has 2 or fewer CPU cores
      // - Has 2GB or less RAM
      // - Has slow connection
      const isLowPerf = cores <= 2 || memory <= 2 || isSlowConnection;
      
      setIsLowPerformanceDevice(isLowPerf);
      
      // Store in sessionStorage to persist across navigation
      sessionStorage.setItem('isLowPerformanceDevice', String(isLowPerf));
    };

    // Check if we already determined this
    const cached = sessionStorage.getItem('isLowPerformanceDevice');
    if (cached !== null) {
      setIsLowPerformanceDevice(cached === 'true');
    } else {
      checkPerformance();
    }
  }, []);

  // Memoize navigation items to prevent recreating on every render
  const navItems = useMemo(() => [
    { name: "What We Do", link: "#what-we-do" },
    { name: "How We Work", link: "#how-we-work" },
    { name: "Contact", link: "#contact" },
  ], []);

  // Memoize close menu handler
  const closeMobileMenu = useMemo(() => 
    () => setIsMobileMenuOpen(false), 
    []
  );

  // Simplified motion props for low-performance devices
  const getMotionProps = (defaultProps: any) => {
    if (shouldReduceMotion || isLowPerformanceDevice) {
      return {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true, amount: 0.1 },
        transition: { duration: 0.3 }
      };
    }
    return defaultProps;
  };

  // Determine if animations should be enabled
  const enableAnimations = !shouldReduceMotion && !isLowPerformanceDevice;

  return (
    <GradientBackground 
      className="text-gray-900 dark:text-white" 
      enableAnimation={enableAnimations}
    >
      {/* Anchor for scrolling to top */}
      <div id="top" />

      <motion.div
        {...getMotionProps({
          initial: { opacity: 0, y: 40 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: { delay: 0.3, duration: 0.8, ease: "easeInOut" }
        })}
        className="relative z-10 flex w-full flex-col"
      >
        {/* Navbar - Optimized with proper containment */}
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
                  <div onClick={closeMobileMenu}>
                    <NavbarLogo />
                  </div>
                  <MobileNavToggle
                    isOpen={isMobileMenuOpen}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  />
                </MobileNavHeader>

                <MobileNavMenu
                  isOpen={isMobileMenuOpen}
                  onClose={closeMobileMenu}
                >
                  <div className="flex flex-col space-y-6 p-6">
                    {/* Navigation Links */}
                    {navItems.map((item, idx) => (
                      <a
                        key={`mobile-link-${idx}`}
                        href={item.link}
                        onClick={closeMobileMenu}
                        className="block text-lg font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                      >
                        {item.name}
                      </a>
                    ))}

                    {/* Theme Toggle */}
                    <div className="pt-4 border-neutral-200 dark:border-neutral-700">
                      <ThemeToggle
                        withLabel
                        onAfterToggle={closeMobileMenu}
                        className="justify-start"
                      />
                    </div>

                    {/* Sign In Button */}
                    <NavbarButton
                      onClick={closeMobileMenu}
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

        {/* Hero Section - Reduced padding on mobile */}
        <section className="relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="py-12 sm:py-20 lg:py-32">
              <Hero />
            </div>
          </div>
        </section>

        {/* Main Content Sections with lazy loading */}
        <main className="relative">
          {/* What We Do Section */}
          <section
            id="what-we-do"
            className="scroll-mt-24 relative"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="py-12 sm:py-16 lg:py-24">
                <motion.div
                  {...getMotionProps({
                    initial: { opacity: 0, y: 30 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, amount: 0.2 },
                    transition: { duration: 0.8, ease: "easeOut" }
                  })}
                  className="relative w-full"
                >
                  <Suspense fallback={<CarouselSkeleton />}>
                    <CardsCarouselDemo />
                  </Suspense>
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
              <div className="py-12 sm:py-16 lg:py-24">
                <motion.div
                  {...getMotionProps({
                    initial: { opacity: 0, y: 30 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, amount: 0.2 },
                    transition: { duration: 0.8, ease: "easeOut" }
                  })}
                  className="relative w-full"
                >
                  <Suspense fallback={<ScrollSkeleton />}>
                    <StickyScrollReveal />
                  </Suspense>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section
            id="contact"
            className="scroll-mt-24 relative"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="pt-12 sm:pt-16 lg:pt-24">
                <Suspense fallback={<CTASkeleton />}>
                  <CtaBandFooter />
                </Suspense>
              </div>
            </div>
          </section>
        </main>
      </motion.div>
    </GradientBackground>
  );
}