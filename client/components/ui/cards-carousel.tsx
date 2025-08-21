"use client";

import React, { useEffect, useRef, useState } from "react";
import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

/* ---------- Types ---------- */

export type CardData = {
  src: string;
  title: string;
  category: string;
  content?: React.ReactNode;
};

interface CarouselProps {
  items: JSX.Element[];
  initialScroll?: number;
}

/* ---------- Carousel (drag-to-scroll) ---------- */

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // drag bookkeeping
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollLeft = initialScroll;
    checkScrollability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialScroll]);

  const checkScrollability = () => {
    const el = viewportRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  const scrollLeft = () => {
    const el = viewportRef.current;
    if (el) el.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    const el = viewportRef.current;
    if (el) el.scrollBy({ left: 300, behavior: "smooth" });
  };

  // --- Drag handlers ---
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = viewportRef.current;
    if (!el) return;

    setIsDragging(true);
    startXRef.current = e.clientX;
    startScrollLeftRef.current = el.scrollLeft;

    // disable smooth while dragging for immediate response
    el.style.scrollBehavior = "auto";

    // ensure we keep receiving move/up even if pointer leaves
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const el = viewportRef.current;
    if (!el) return;

    e.preventDefault(); // prevent text/image selection
    const dx = e.clientX - startXRef.current;
    el.scrollLeft = startScrollLeftRef.current - dx;
    checkScrollability();
  };

  const endDrag = (e?: React.PointerEvent<HTMLDivElement>) => {
    const el = viewportRef.current;
    if (el) el.style.scrollBehavior = "smooth";
    setIsDragging(false);
    if (e) e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div className="relative w-full">
      <div
        ref={viewportRef}
        onScroll={checkScrollability}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        className={cn(
          // viewport
          "flex w-full select-none", // avoid selecting text while dragging
          "overflow-x-scroll overflow-y-hidden overscroll-x-contain",
          "py-10 md:py-20 [scrollbar-width:none]",
          // cursors for feedback
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{ touchAction: "pan-x" }} // keeps horizontal panning smooth on touch
      >
        <div className="absolute right-0 z-[1000] h-auto w-[5%] overflow-hidden bg-gradient-to-l" />

        <div className="mx-auto max-w-7xl flex flex-row justify-start gap-4 pl-4">
          {items.map((item, index) => (
            <motion.div
              key={"card" + index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 * index, ease: "easeOut" }}
              className="rounded-3xl last:pr-[5%] md:last:pr-[33%]"
            >
              {item}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mr-10 flex justify-end gap-2">
        <button
          className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
        >
          <IconArrowNarrowLeft className="h-6 w-6 text-gray-500" />
        </button>
        <button
          className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
          onClick={scrollRight}
          disabled={!canScrollRight}
          aria-label="Scroll right"
        >
          <IconArrowNarrowRight className="h-6 w-6 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

/* ---------- Card (no click, no modal) ---------- */

export const Card = ({
  card,
}: {
  card: CardData;
  index?: number;
  layout?: boolean; // ignored
}) => {
  return (
    <div className="relative z-10 flex h-80 w-56 flex-col items-start justify-start overflow-hidden rounded-3xl bg-gray-100 md:h-[40rem] md:w-96 dark:bg-neutral-900">
      {/* Readability overlays */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-transparent" />
        <div className="absolute inset-0 bg-black/30 [mask-image:radial-gradient(120%_100% at 20%_15%, black_45%, transparent_60%)]" />
      </div>

      <div className="relative z-30 p-8">
        <p className="text-left font-sans text-xl font-semibold text-white/95 md:text-3xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          {card.category}
        </p>
        <p className="mt-2 max-w-xs text-left font-sans text-sm font-medium [text-wrap:balance] text-white md:text-base drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]">
          {card.title}
        </p>
      </div>

      <CardImage
        src={card.src}
        alt={card.title}
        className="absolute inset-0 z-10 object-cover"
        draggable={false}
      />
    </div>
  );
};

/* ---------- Image (no blur) ---------- */

type CardImageProps = React.ImgHTMLAttributes<HTMLImageElement> & { src: string };

export const CardImage = ({ src, className, alt, ...rest }: CardImageProps) => {
  return (
    <img
      className={cn("h-full w-full object-cover", className)}
      src={src}
      alt={alt ?? "Card image"}
      loading="lazy"
      decoding="async"
      {...rest}
    />
  );
};
