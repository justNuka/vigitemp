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
    <Tabs value={value} onValueChange={(v: string) => onChange(v as ViewMode)} className="w-full sm:w-auto">
      <TabsList className="grid grid-cols-2 w-full sm:w-auto bg-primary/10 text-primary">
        <TabsTrigger
          value="graphs"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          {graphsLabel}
        </TabsTrigger>
        <TabsTrigger
          value="tree"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          {treeLabel}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
