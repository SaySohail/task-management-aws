"use client";
import React from "react";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";


const content = [
  {
    title: "Assess",
    description:
    "We align goals, risks, and constraints through stakeholder sessions and a rapid current-state review of infrastructure, apps, data, identity, and costs. We baseline availability, recovery, performance, and spend. You get a prioritised 90-day plan and 12-month roadmap with a clear business case.",
    imageSrc: "/images/assessment.jpg"
  },
  {
    title: "Architect",
    description:
    "We design a security-first target state—zero-trust identity, encryption, cloud landing zones (AWS/Azure/GCP), HA/DR, CI/CD, observability, and ITSM. You receive reference diagrams, a controls map, an implementation plan, and a groomed backlog.",
    imageSrc: "/images/architect.jpg"
  },
  {
    title: "Implement",
    description:
      "We deliver in short iterations using Infrastructure as Code, with automated tests, security checks, and policy gates. Migrations are rehearsed with rollback paths. You get production-ready releases, runbooks, training, and a signed-off go-live.",
    imageSrc: "/images/implement.jpg",
  },
  {
    title: "Operate & Optimise",
    description:
      "We run your stack 24/7 with SLA-backed support, patching, vulnerability management, backup verification, and DR exercises. FinOps and performance tuning keep costs and reliability in check, with regular reviews and an evolving roadmap",
    imageSrc: "/images/optimise.jpg",
  },
];
export function StickyScrollReveal() {
  return (
    <div className="w-full py-4">
      <StickyScroll content={content} />
    </div>
  );
}
