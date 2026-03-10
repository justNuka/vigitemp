"use client"

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";
import { LazyMotion, domAnimation, m } from "motion/react";
import { fadeInUp } from "@/lib/motion-variants";
import { cn } from "@/lib/utils";

export type DashboardLinkCardProps = {
  title: string;
  description: string;
  href: string;
  icon?: ReactNode;
  badge?: string;
  className?: string;
};

export function DashboardLinkCard({
  title,
  description,
  href,
  icon,
  badge,
  className,
}: DashboardLinkCardProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className={cn(
          "group rounded-xl border border-border bg-card p-4 shadow-sm",
          "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          "hover:bg-linear-to-br hover:from-card hover:to-primary/5",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {icon ? (
              <div className="mt-0.5 shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">
                {icon}
              </div>
            ) : null}
            <div className="space-y-1">
              <Link
                href={href}
                className="inline-flex items-center gap-2 text-base font-semibold text-foreground transition-colors group-hover:text-primary"
              >
                {title}
                <ArrowRight className="h-4 w-4 -translate-x-0.5 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
              </Link>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          {badge ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {badge}
            </span>
          ) : null}
        </div>
      </m.div>
    </LazyMotion>
  );
}
