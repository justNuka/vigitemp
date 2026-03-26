"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type TocItem = {
  id: string
  label: ReactNode
  children?: TocItem[]
}

function scrollToSection(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
  event.preventDefault()
  const target = document.getElementById(id)
  if (!target) return

  target.scrollIntoView({ behavior: "smooth", block: "start" })
  window.history.replaceState(null, "", `#${id}`)
}

export function HardwareCatalogToc({ items, title }: { items: TocItem[]; title: string }) {
  const [activeId, setActiveId] = useState("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    )

    for (const item of items) {
      const element = document.getElementById(item.id)
      if (element) observer.observe(element)
    }

    return () => observer.disconnect()
  }, [items])

  return (
    <nav className="hidden xl:flex fixed left-6 top-1/2 z-50 -translate-y-1/2 flex-col gap-1">
      <div className="rounded-xl border border-border/70 bg-white/85 p-4 shadow-lg backdrop-blur dark:border-border dark:bg-popover/95 dark:shadow-[0_18px_60px_-35px_rgba(0,0,0,0.72)]">
        <p className="mb-3 px-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        {items.map((item) => (
          <div key={item.id} className="space-y-0.5">
            <a
              href={`#${item.id}`}
              onClick={(event) => scrollToSection(event, item.id)}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                activeId === item.id
                  ? "bg-primary/10 text-primary dark:bg-cyan-500/15 dark:text-cyan-300"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground dark:hover:bg-slate-800/70 dark:hover:text-white",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all duration-200",
                  activeId === item.id ? "scale-125 bg-primary" : "bg-muted-foreground/30",
                )}
              />
              {item.label}
            </a>

            {item.children?.length ? (
              <div className="ml-4 border-l border-border/60 pl-2">
                {item.children.map((child) => (
                  <div key={child.id} className="space-y-0.5">
                    <a
                      href={`#${child.id}`}
                      onClick={(event) => scrollToSection(event, child.id)}
                      className={cn(
                "group flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-all duration-200",
                activeId === child.id
                  ? "bg-primary/10 text-primary dark:bg-cyan-500/15 dark:text-cyan-300"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground dark:hover:bg-slate-800/70 dark:hover:text-white",
              )}
            >
                      <span
                        className={cn(
                          "h-1 w-1 rounded-full transition-all duration-200",
                          activeId === child.id ? "scale-125 bg-primary" : "bg-muted-foreground/30",
                        )}
                      />
                      {child.label}
                    </a>

                    {child.children?.length ? (
                      <div className="ml-3 border-l border-border/50 pl-2">
                        {child.children.map((grandChild) => (
                          <a
                            key={grandChild.id}
                            href={`#${grandChild.id}`}
                            onClick={(event) => scrollToSection(event, grandChild.id)}
                            className={cn(
                              "group flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-all duration-200",
                              activeId === grandChild.id
                                ? "bg-primary/10 text-primary dark:bg-cyan-500/15 dark:text-cyan-300"
                                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground dark:hover:bg-slate-800/70 dark:hover:text-white",
                            )}
                          >
                            <span
                              className={cn(
                                "h-1 w-1 rounded-full transition-all duration-200",
                                activeId === grandChild.id
                                  ? "scale-125 bg-primary"
                                  : "bg-muted-foreground/30",
                              )}
                            />
                            {grandChild.label}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </nav>
  )
}
