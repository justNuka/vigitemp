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
      <TabsList className="grid h-8 w-auto grid-cols-2 gap-0.5 rounded-md border border-[#26A5DA]/35 bg-[#26A5DA]/8 p-0.5 text-[#0B5F86] dark:border-[#26A5DA]/45 dark:bg-[#26A5DA]/12 dark:text-sky-100">
        <TabsTrigger
          value="graphs"
          className="h-7 rounded-[5px] px-2.5 text-[13px] font-medium transition-[background-color,color,box-shadow] duration-200 ease-out hover:bg-[#26A5DA]/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#26A5DA]/50 data-[state=active]:bg-[#26A5DA] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-[#26A5DA]/60"
        >
          {graphsLabel}
        </TabsTrigger>
        <TabsTrigger
          value="tree"
          className="h-7 rounded-[5px] px-2.5 text-[13px] font-medium transition-[background-color,color,box-shadow] duration-200 ease-out hover:bg-[#26A5DA]/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#26A5DA]/50 data-[state=active]:bg-[#26A5DA] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-[#26A5DA]/60"
        >
          {treeLabel}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
