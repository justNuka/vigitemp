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
      <TabsList className="grid grid-cols-2 w-full sm:w-auto">
        <TabsTrigger value="graphs">{graphsLabel}</TabsTrigger>
        <TabsTrigger value="tree">{treeLabel}</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

