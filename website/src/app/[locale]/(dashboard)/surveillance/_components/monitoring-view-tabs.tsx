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
      <TabsList className="grid grid-cols-2 w-full sm:w-auto bg-[#26A5DA]/10 text-[#26A5DA] border border-[#26A5DA]/30">
        <TabsTrigger
          value="graphs"
          className="data-[state=active]:bg-[#26A5DA] data-[state=active]:text-sidebar-foreground hover:bg-[#26A5DA]/15"
        >
          {graphsLabel}
        </TabsTrigger>
        <TabsTrigger
          value="tree"
          className="data-[state=active]:bg-[#26A5DA] data-[state=active]:text-sidebar-foreground hover:bg-[#26A5DA]/15"
        >
          {treeLabel}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
