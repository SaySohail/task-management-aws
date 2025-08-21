"use client";

import React from "react";
import { Carousel, Card } from "@/components/ui/cards-carousel";

export function CardsCarouselDemo() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <div className="w-full h-full py-20">
      <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
       One Partner for Every IT Need
      </h2>
      <Carousel items={cards} />
    </div>
  );
}

const data = [
  {
    category: "Managed IT Services",
    title: "Proactive monitoring, administration, and user support to keep your operations running smoothly.",
    src: "/images/it-services.jpg",

  },
  {
    category: "Cloud Solutions",
    title: "Right-sized cloud architecture, migration, and ongoing management across public, private, and hybrid environments.",
    src: "/images/cloud.jpg",

  },
  {
    category: "Cybersecurity & Risk Management",
    title: "Defence-in-depth security, threat detection, and compliance-driven frameworks to reduce risk and improve resilience.",
    src: "/images/cybersecurity.jpg",

  },

  {
    category: "Custom Software Development",
    title: "Bespoke web, platform, and mobile applications aligned to your business processes and customer experience",
    src: "/images/software.jpg",

  },
  {
    category: "Technology Consulting",
    title: "Independent advisory on digital transformation, integration, and IT strategy — from roadmap to execution.",
    src: "/images/consulting.jpg",

  },
  {
    category: "24/7 Support & Maintenance",
    title: "Always-on technical support, incident response, and continuous optimisation for peak performance.",
    src: "/images/support.jpg",

  },
];
