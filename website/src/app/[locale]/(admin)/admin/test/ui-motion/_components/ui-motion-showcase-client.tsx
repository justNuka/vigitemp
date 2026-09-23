"use client";

import {
  Gauge,
  Layers3,
  Play,
  RefreshCcw,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { MotionConfig } from "motion/react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useErrorConcepts } from "./error-concepts";
import { useLoaderConcepts } from "./loading-concepts";

const SPEEDS = [
  { value: 0.72, key: "fast" },
  { value: 1, key: "normal" },
  { value: 1.35, key: "slow" },
] as const;

export function UiMotionShowcaseClient() {
  const t = useTranslations("testPages.uiMotion");
  const [speed, setSpeed] = useState(1);
  const [revision, setRevision] = useState(0);
  const loaders = useLoaderConcepts(speed);
  const errorConcepts = useErrorConcepts();

  const activeSpeedKey = useMemo(
    () => SPEEDS.find((option) => option.value === speed)?.key ?? "normal",
    [speed],
  );

  return (
    <MotionConfig reducedMotion="never">
      <div data-ui-motion-showcase className="space-y-6">
        <Card className="overflow-hidden border-primary/15 bg-linear-to-br from-card via-card to-primary/5">
          <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  {t("hero.badge")}
                </Badge>
                <Badge variant="outline">Motion</Badge>
                <Badge variant="outline">SVG</Badge>
                <Badge variant="outline">{t("hero.motion_forced")}</Badge>
              </div>
              <CardTitle className="text-2xl">{t("hero.title")}</CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-6">
                {t("hero.description")}
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-lg border border-border bg-background p-1">
                <span className="px-2 text-xs text-muted-foreground">
                  {t("controls.speed")}
                </span>
                {SPEEDS.map((option) => (
                  <Button
                    key={option.key}
                    type="button"
                    size="sm"
                    variant={speed === option.value ? "secondary" : "ghost"}
                    className="h-7 px-2 text-xs"
                    onClick={() => setSpeed(option.value)}
                    aria-pressed={speed === option.value}
                  >
                    {t(`controls.speed_values.${option.key}`)}
                  </Button>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRevision((value) => value + 1)}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                {t("controls.replay")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 text-xs text-muted-foreground md:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-background/70 p-3">
                <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
                  <Layers3 className="h-4 w-4 text-primary" />
                  {t("principles.isolated_title")}
                </div>
                {t("principles.isolated_description")}
              </div>
              <div className="rounded-xl border border-border/70 bg-background/70 p-3">
                <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
                  <Gauge className="h-4 w-4 text-primary" />
                  {t("principles.performance_title")}
                </div>
                {t("principles.performance_description")}
              </div>
              <div className="rounded-xl border border-border/70 bg-background/70 p-3">
                <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
                  <TriangleAlert className="h-4 w-4 text-primary" />
                  {t("principles.production_title")}
                </div>
                {t("principles.production_description")}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="loaders" className="space-y-5">
          <TabsList>
            <TabsTrigger value="loaders" className="gap-2">
              <Play className="h-4 w-4" />
              {t("tabs.loaders")}
            </TabsTrigger>
            <TabsTrigger value="errors" className="gap-2">
              <TriangleAlert className="h-4 w-4" />
              {t("tabs.errors")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="loaders" className="space-y-6">
            <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <p className="text-sm font-medium">{t("loaders.intro_title")}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {t("loaders.intro_description", {
                  speed: t(`controls.speed_values.${activeSpeedKey}`),
                })}
              </p>
            </div>

            <div key={`loader-gallery-${revision}`} className="space-y-6">
              {loaders.map((concept, index) => (
                <Card key={concept.id} className="overflow-hidden">
                  <CardHeader className="gap-3 border-b border-border/60 bg-muted/10 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                        <CardTitle className="text-lg">{concept.title}</CardTitle>
                      </div>
                      <CardDescription className="max-w-3xl leading-6">
                        {concept.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {concept.usage}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 md:p-5">
                    {concept.preview}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <p className="text-sm font-medium">{t("errors.intro_title")}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {t("errors.intro_description")}
              </p>
            </div>

            <div key={`error-gallery-${revision}`} className="space-y-6">
              {errorConcepts.map((concept, index) => (
                <Card key={concept.id} className="overflow-hidden">
                  <CardHeader className="gap-3 border-b border-border/60 bg-muted/10 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold",
                            concept.id === "500" || concept.id === "network"
                              ? "bg-red-500/10 text-red-500"
                              : concept.id === "maintenance"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-primary/10 text-primary",
                          )}
                        >
                          {index + 1}
                        </span>
                        <CardTitle className="text-lg">{concept.title}</CardTitle>
                      </div>
                      <CardDescription className="max-w-3xl leading-6">
                        {concept.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {concept.usage}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 md:p-5">
                    {concept.preview}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MotionConfig>
  );
}
