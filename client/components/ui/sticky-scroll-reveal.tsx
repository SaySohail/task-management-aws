"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "@/lib/utils";

type StickyItem = {
  title: string;
  description: string;
  imageSrc?: string; // e.g. "/images/cloud.jpg" from /public
  imageAlt?: string;
  content?: React.ReactNode; // fallback if no image
};

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: StickyItem[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const { scrollYProgress } = useScroll({
    container: scrollerRef,
    offset: ["start start", "end end"],
  });

  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const progress = latest * cardLength;
    let newActiveCard;

    if (latest >= 0.85) {
      newActiveCard = cardLength - 1;
    } else {
      newActiveCard = Math.floor(progress + 0.3);
      newActiveCard = Math.max(0, Math.min(newActiveCard, cardLength - 1));
    }

    if (newActiveCard !== activeCard) setActiveCard(newActiveCard);
  });

  const scrollToIndex = (i: number) => {
    itemRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className={cn(
        // 1 col on mobile, 2 cols (50/50) on lg+
        "relative flex flex-col lg:flex-row items-stretch justify-center gap-6 md:gap-10",
        // natural height on mobile; fixed band on lg+
        "h-auto lg:h-[40rem]",
        "rounded-2xl p-6 md:p-10 bg-transparent"
      )}
    >
      {/* Left: text column — full width on mobile, 50% on lg+ */}
      <div
        ref={scrollerRef}
        className={cn(
          "relative min-w-0 w-full lg:flex-1",
          // Let the page scroll naturally on mobile; internal scroll only on lg+
          "overflow-visible lg:overflow-y-auto",
          // Scroll snap only on lg+
          "lg:snap-y lg:snap-mandatory lg:scroll-smooth",
          // hide scrollbar only when it exists (lg+)
          "lg:[&::-webkit-scrollbar]:hidden lg:[scrollbar-width:none] lg:[-ms-overflow-style:none]"
        )}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="mx-auto max-w-2xl">
          {content.map((item, index) => {
            const isActive = activeCard === index;
            return (
              <div
                key={item.title + index}
                ref={(el) => { itemRefs.current[index] = el; }}
                className="lg:snap-start py-10 md:py-16"
              >
                <motion.h2
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: isActive ? 1 : 0.7, y: isActive ? 0 : 6, scale: isActive ? 1 : 0.98 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100"
                >
                  {item.title}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: isActive ? 1 : 0.75, y: isActive ? 0 : 4 }}
                  transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
                  className="mt-6 max-w-prose text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300"
                >
                  {item.description}
                </motion.p>
              </div>
            );
          })}
          {/* extra bottom space so the last item can fully activate on lg+ */}
          <div className="hidden lg:block h-[50vh]" />
        </div>
      </div>

      {/* Right: sticky preview — HIDDEN on small screens, 50% width on lg+ */}
      <div
        className={cn(
          "relative hidden lg:block lg:flex-1 min-w-0",
          "sticky top-0 h-full",
          "rounded-xl overflow-hidden ring-1 ring-black/10 dark:ring-white/10 shadow-lg/10",
          contentClassName
        )}
      >
        <div className="relative h-full w-full">
          <AnimatePresence mode="popLayout" initial={false}>
            {content[activeCard]?.imageSrc ? (
              <motion.img
                key={`${content[activeCard].imageSrc}-${activeCard}`}
                src={content[activeCard].imageSrc as string}
                alt={content[activeCard].imageAlt ?? content[activeCard].title}
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.985 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <motion.div
                key={`content-${activeCard}`}
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.985 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                {content[activeCard]?.content ?? (
                  <div className="flex h-full w-full items-center justify-center">
                    <p className="text-slate-500 dark:text-slate-400">No content available</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};