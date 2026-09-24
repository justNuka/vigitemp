"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ViewMode = "tree" | "graphs"

type Props = {
  value: ViewMode
  onChange: (value: ViewMode) => void
  graphsLabel: string
  treeLabel: string
}

export function SurveillanceViewTabs({ value, onChange, graphsLabel, treeLabel }: Props) {
  return (
    <Tabs value={value} onValueChange={(v: string) => onChange(v as ViewMode)} className="w-auto shrink-0">
      <TabsList className="grid h-8 w-auto grid-cols-2 gap-0.5 rounded-md border border-border bg-muted/70 p-0.5 text-muted-foreground">
        <TabsTrigger
          value="graphs"
          className="h-7 rounded-[5px] px-2.5 text-[13px] font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border"
        >
          {graphsLabel}
        </TabsTrigger>
        <TabsTrigger
          value="tree"
          className="h-7 rounded-[5px] px-2.5 text-[13px] font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border"
        >
          {treeLabel}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
