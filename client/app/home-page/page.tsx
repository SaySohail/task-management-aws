"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { WorldMap } from "@/components/ui/world-map";
import { AuroraBackground } from "@/components/ui/aurora-background";


// ⬇️ import the resizable navbar primitives
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

export default function HeroSectionOne() {
  const navItems = [
    { name: "Templates", link: "#templates" },
    { name: "Docs", link: "#docs" },
    { name: "Pricing", link: "#pricing" },
  ];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-start bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30">
      {/* Navbar container */}
      <div className="w-full sticky top-0 z-50 bg-white/60 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto w-full max-w-7xl">
          <ResizableNavbar>
            {/* Desktop */}
            <NavBody>
              <NavbarLogo />
              <NavItems items={navItems} />
              <div className="flex items-center gap-4">
                <NavbarButton variant="secondary">Sign In</NavbarButton>
                <NavbarButton variant="primary">Start Free</NavbarButton>
              </div>
            </NavBody>

            {/* Mobile */}
            <MobileNav>
              <MobileNavHeader>
                <NavbarLogo />
                <MobileNavToggle
                  isOpen={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />
              </MobileNavHeader>

              <MobileNavMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
              >
                {navItems.map((item, idx) => (
                  <a
                    key={`mobile-link-${idx}`}
                    href={item.link}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="relative text-neutral-600 dark:text-neutral-300"
                  >
                    <span className="block">{item.name}</span>
                  </a>
                ))}
                <div className="flex w-full flex-col gap-4">
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="secondary"
                    className="w-full"
                  >
                    Sign In
                  </NavbarButton>
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="w-full"
                  >
                    Start Free
                  </NavbarButton>
                </div>
              </MobileNavMenu>
            </MobileNav>
          </ResizableNavbar>
        </div>
      </div>

      {/* Hero */}
      <div className="flex w-full max-w-7xl flex-col items-center px-4 py-16 md:py-24">
        {/* Main Headline */}
        <div className="mb-8 text-center">
          <motion.h1 
            className="mx-auto max-w-4xl text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {"Launch your website in hours, not days"
              .split(" ")
              .map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.08,
                    ease: "easeOut",
                  }}
                  className="mr-2 inline-block"
                >
                  {word}
                </motion.span>
              ))}
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mb-12 max-w-2xl text-center text-lg text-gray-600 leading-relaxed"
        >
          With AI, you can launch your website in hours, not days. Try our best
          in class, state of the art, cutting edge AI tools to get your website
          up and running.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16 flex flex-col gap-4 sm:flex-row sm:gap-6"
        >
          <button className="group relative overflow-hidden rounded-lg bg-black px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-gray-800 hover:scale-105 hover:shadow-lg">
            <span className="relative z-10">Start Free →</span>
          </button>
          <button className="rounded-lg border-2 border-gray-200 bg-white px-8 py-4 font-semibold text-gray-700 transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 hover:scale-105">
            View Templates
          </button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mb-20 grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <FeatureCard
            title="API Integration"
            description="Seamless integration with your existing workflow"
            icon="🔌"
          />
          <FeatureCard
            title="Template Library"
            description="Pre-built templates ready for customization"
            icon="📝"
          />
          <FeatureCard
            title="Team Collaboration"
            description="Work together with your team efficiently"
            icon="👥"
          />
        </motion.div>

        {/* Hero Image/Demo */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="relative w-full max-w-5xl"
        >
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-2 shadow-2xl">
            <div className="overflow-hidden rounded-xl bg-white">
              <img
                src="https://assets.aceternity.com/pro/aceternity-landing.webp"
                alt="Platform preview"
                className="h-auto w-full object-cover"
                style={{ aspectRatio: "16/10" }}
              />
            </div>
          </div>
          <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-20 blur-xl"></div>
          <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-20 blur-xl"></div>
        </motion.div>

        {/* World Map section */}
        <div className="py-40 dark:bg-black bg-white w-full" id="features">
          <div className="max-w-7xl mx-auto text-center">
            <p className="font-bold text-xl md:text-4xl dark:text-white text-black">
              Remote{" "}
              <span className="dark:bg-black bg-white w-full">
                {"Connectivity".split("").map((word, idx) => (
                  <motion.span
                    key={idx}
                    className="inline-block"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: idx * 0.04 }}
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            </p>
            <p className="text-sm md:text-lg text-neutral-500 max-w-2xl mx-auto py-4">
              Break free from traditional boundaries. Work from anywhere, at the
              comfort of your own studio apartment. Perfect for Nomads and
              Travellers.
            </p>
          </div>
          <WorldMap
            dots={[
              { start: { lat: 64.2008, lng: -149.4937 }, end: { lat: 34.0522, lng: -118.2437 } },
              { start: { lat: 64.2008, lng: -149.4937 }, end: { lat: -15.7975, lng: -47.8919 } },
              { start: { lat: -15.7975, lng: -47.8919 }, end: { lat: 38.7223, lng: -9.1393 } },
              { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 28.6139, lng: 77.209 } },
              { start: { lat: 28.6139, lng: 77.209 }, end: { lat: 43.1332, lng: 131.9113 } },
              { start: { lat: 28.6139, lng: 77.209 }, end: { lat: -1.2921, lng: 36.8219 } },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({ title, description, icon }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-200"
    >
      <div className="mb-4 text-3xl">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

