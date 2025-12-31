"use client"

import { Button } from "@/components/ui/button"

type Props = {
  sentinelRef: React.RefObject<HTMLDivElement | null>
  hasNextPage: boolean
  isFetching: boolean
  onLoadMore: () => void
  label: string
}

export function SurveillanceLoadMore({ sentinelRef, hasNextPage, isFetching, onLoadMore, label }: Props) {
  return (
    <>
      <div ref={sentinelRef} />
      {hasNextPage ? (
        <div className="flex justify-center py-4">
          <Button variant="outline" onClick={onLoadMore} disabled={isFetching}>
            {label}
          </Button>
        </div>
      ) : null}
    </>
  )
}

