"use client"

import { useEffect } from "react"

type Params = {
  target: React.RefObject<Element | null>
  enabled: boolean
  onLoadMore: () => void
}

export function useInfiniteScroll({ target, enabled, onLoadMore }: Params) {
  useEffect(() => {
    const element = target.current
    if (!element) return
    if (!enabled) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onLoadMore()
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [enabled, onLoadMore, target])
}

