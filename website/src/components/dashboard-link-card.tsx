import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

export type DashboardLinkCardProps = {
  title: string;
  description: string;
  href: string;
  icon?: ReactNode;
  badge?: string;
};

export function DashboardLinkCard({
  title,
  description,
  href,
  icon,
  badge,
}: DashboardLinkCardProps) {
  return (
    <div className="group rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {icon ? (
            <div className="mt-0.5 text-slate-500 dark:text-slate-300">{icon}</div>
          ) : null}
          <div className="space-y-1">
            <Link
              href={href}
              className="inline-flex items-center gap-2 text-base font-semibold text-slate-900 transition-colors group-hover:text-sky-600 dark:text-slate-100"
            >
              {title}
              <ArrowRight className="h-4 w-4 translate-x-[-2px] opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
          </div>
        </div>
        {badge ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {badge}
          </span>
        ) : null}
      </div>
    </div>
  );
}
