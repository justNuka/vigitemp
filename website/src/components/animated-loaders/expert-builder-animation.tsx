"use client";

import React from "react"

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  Users,
  FileText,
  HardDrive,
  Plus,
  Trash2,
  Move,
  Maximize2,
  GripVertical,
} from "lucide-react";

interface ExpertBuilderAnimationProps {
  textToDisplay?: string;
  description?: string;
  speed?: number;
  showBrand?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Block definitions                                                 */
/* ------------------------------------------------------------------ */

interface DashBlock {
  id: string;
  label: string;
  icon: React.ReactNode;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
  color: string;
}

const BLOCK_TEMPLATES: Omit<DashBlock, "col" | "row" | "colSpan" | "rowSpan">[] = [
  {
    id: "alarms",
    label: "Alarmes en cours",
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "border-red-500/40 bg-red-500/5",
  },
  {
    id: "users",
    label: "Utilisateurs connectes",
    icon: <Users className="h-4 w-4" />,
    color: "border-primary/40 bg-primary/5",
  },
  {
    id: "audit",
    label: "Audit Trail",
    icon: <FileText className="h-4 w-4" />,
    color: "border-amber-500/40 bg-amber-500/5",
  },
  {
    id: "backups",
    label: "Sauvegardes systeme",
    icon: <HardDrive className="h-4 w-4" />,
    color: "border-emerald-500/40 bg-emerald-500/5",
  },
];

/* ------------------------------------------------------------------ */
/*  Action definitions (the choreography)                             */
/* ------------------------------------------------------------------ */

type ActionType = "add" | "move" | "resize" | "remove";

interface ActionStep {
  type: ActionType;
  blockId: string;
  label: string;
  col?: number;
  row?: number;
  colSpan?: number;
  rowSpan?: number;
}

const CHOREOGRAPHY: ActionStep[] = [
  // Phase 1: Add blocks one by one
  { type: "add", blockId: "alarms", label: "Ajout du bloc Alarmes", col: 0, row: 0, colSpan: 2, rowSpan: 1 },
  { type: "add", blockId: "users", label: "Ajout du bloc Utilisateurs", col: 2, row: 0, colSpan: 1, rowSpan: 1 },
  { type: "add", blockId: "audit", label: "Ajout du bloc Audit Trail", col: 0, row: 1, colSpan: 1, rowSpan: 1 },
  { type: "add", blockId: "backups", label: "Ajout du bloc Sauvegardes", col: 1, row: 1, colSpan: 2, rowSpan: 1 },
  // Phase 2: Move + resize
  { type: "resize", blockId: "alarms", label: "Redimensionnement Alarmes", colSpan: 3, rowSpan: 1 },
  { type: "move", blockId: "users", label: "Deplacement Utilisateurs", col: 0, row: 1 },
  { type: "move", blockId: "audit", label: "Deplacement Audit Trail", col: 1, row: 1 },
  { type: "resize", blockId: "backups", label: "Redimensionnement Sauvegardes", col: 2, row: 1, colSpan: 1, rowSpan: 1 },
  // Phase 3: Remove and re-add
  { type: "remove", blockId: "audit", label: "Suppression Audit Trail" },
  { type: "resize", blockId: "users", label: "Agrandissement Utilisateurs", colSpan: 2, rowSpan: 1 },
  { type: "remove", blockId: "backups", label: "Suppression Sauvegardes" },
  { type: "add", blockId: "backups", label: "Re-ajout Sauvegardes", col: 2, row: 1, colSpan: 1, rowSpan: 1 },
  { type: "add", blockId: "audit", label: "Re-ajout Audit Trail", col: 0, row: 2, colSpan: 3, rowSpan: 1 },
];

/* ------------------------------------------------------------------ */
/*  Cursor component                                                  */
/* ------------------------------------------------------------------ */

function AnimatedCursor({
  targetX,
  targetY,
  action,
}: {
  targetX: number;
  targetY: number;
  action: ActionType;
}) {
  const cursorColor = {
    add: "text-emerald-500",
    move: "text-primary",
    resize: "text-amber-500",
    remove: "text-red-500",
  }[action];

  return (
    <motion.div
      className="absolute z-30 pointer-events-none"
      animate={{ left: targetX, top: targetY }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Cursor SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${cursorColor} drop-shadow-md`}
      >
        <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L5.85 2.36a.5.5 0 0 0-.35.85z" />
      </svg>
      {/* Action badge */}
      <motion.div
        className={`absolute top-4 left-5 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider whitespace-nowrap ${
          action === "add"
            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            : action === "move"
              ? "bg-primary/20 text-primary"
              : action === "resize"
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                : "bg-red-500/20 text-red-600 dark:text-red-400"
        }`}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {action === "add"
          ? "+ add"
          : action === "move"
            ? "move"
            : action === "resize"
              ? "resize"
              : "delete"}
      </motion.div>
      {/* Click ripple */}
      <motion.div
        className="absolute -top-2 -left-2 h-6 w-6 rounded-full border border-current opacity-0"
        style={{ borderColor: "currentColor" }}
        animate={{ scale: [0.5, 1.5], opacity: [0.5, 0] }}
        transition={{ duration: 0.6, delay: 0.4 }}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Block component                                                   */
/* ------------------------------------------------------------------ */

function DashBlockCard({
  block,
  isActive,
  actionType,
}: {
  block: DashBlock;
  isActive: boolean;
  actionType?: ActionType;
}) {
  const template = BLOCK_TEMPLATES.find((t) => t.id === block.id);
  if (!template) return null;

  const highlightBorder =
    isActive && actionType === "move"
      ? "ring-2 ring-primary/50"
      : isActive && actionType === "resize"
        ? "ring-2 ring-amber-500/50"
        : isActive && actionType === "remove"
          ? "ring-2 ring-red-500/50"
          : "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6, filter: "blur(8px)" }}
      transition={{
        layout: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
      }}
      className={`relative rounded-lg border-2 ${template.color} ${highlightBorder} p-3 flex flex-col transition-shadow`}
      style={{
        gridColumn: `${block.col + 1} / span ${block.colSpan}`,
        gridRow: `${block.row + 1} / span ${block.rowSpan}`,
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="h-3 w-3 text-muted-foreground/40" />
          <span className="text-foreground/70">{template.icon}</span>
          <span className="text-[10px] font-semibold text-foreground">
            {template.label}
          </span>
        </div>
        {isActive && actionType === "resize" && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            <Maximize2 className="h-3 w-3 text-amber-500" />
          </motion.div>
        )}
        {isActive && actionType === "move" && (
          <motion.div
            animate={{ x: [0, 3, -3, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <Move className="h-3 w-3 text-primary" />
          </motion.div>
        )}
      </div>
      {/* Fake content lines */}
      <div className="flex-1 space-y-1.5">
        {Array.from({ length: block.rowSpan > 1 ? 4 : 2 }, (_, i) => (
          <motion.div
            key={i}
            className="h-1.5 rounded bg-muted"
            style={{ width: `${50 + Math.random() * 40}%` }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Activity log                                                      */
/* ------------------------------------------------------------------ */

function ActivityLog({
  actions,
  currentIndex,
}: {
  actions: ActionStep[];
  currentIndex: number;
}) {
  const visible = actions.slice(0, currentIndex + 1).slice(-4);

  return (
    <div className="space-y-1">
      <AnimatePresence mode="popLayout">
        {visible.map((action, i) => {
          const isCurrent = actions.indexOf(action) === currentIndex;
          const icon =
            action.type === "add" ? (
              <Plus className="h-3 w-3 text-emerald-500" />
            ) : action.type === "move" ? (
              <Move className="h-3 w-3 text-primary" />
            ) : action.type === "resize" ? (
              <Maximize2 className="h-3 w-3 text-amber-500" />
            ) : (
              <Trash2 className="h-3 w-3 text-red-500" />
            );

          return (
            <motion.div
              key={`${action.type}-${action.blockId}-${actions.indexOf(action)}`}
              initial={{ opacity: 0, x: -8, height: 0 }}
              animate={{
                opacity: isCurrent ? 1 : 0.4,
                x: 0,
                height: "auto",
              }}
              exit={{ opacity: 0, x: 8, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 py-0.5"
            >
              {icon}
              <span
                className={`text-[10px] font-mono ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}
              >
                {action.label}
              </span>
              {isCurrent && (
                <motion.div
                  className="h-1 w-1 rounded-full bg-primary ml-1"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function ExpertBuilderAnimation({
  textToDisplay = "Dashboard Admin - Mode Expert",
  description = "Personnalisez votre tableau de bord",
  speed = 1,
  showBrand = true,
  className = "",
}: ExpertBuilderAnimationProps) {
  const [blocks, setBlocks] = useState<DashBlock[]>([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<ActionType | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 150, y: 100 });

  // Grid cell size for cursor positioning
  const cellW = 140;
  const cellH = 90;
  const offsetX = 16;
  const offsetY = 16;

  const getBlockPos = useCallback(
    (col: number, row: number) => ({
      x: offsetX + col * cellW + cellW / 2,
      y: offsetY + row * cellH + cellH / 2,
    }),
    [],
  );

  const executeStep = useCallback(
    (step: ActionStep) => {
      setActiveBlockId(step.blockId);
      setCurrentAction(step.type);

      const template = BLOCK_TEMPLATES.find((t) => t.id === step.blockId);
      if (!template) return;

      // Move cursor to target position
      const targetPos = getBlockPos(
        step.col ?? 0,
        step.row ?? 0,
      );
      setCursorPos(targetPos);

      // Execute after cursor arrives
      const timer = setTimeout(() => {
        switch (step.type) {
          case "add":
            setBlocks((prev) => {
              if (prev.find((b) => b.id === step.blockId)) return prev;
              return [
                ...prev,
                {
                  ...template,
                  col: step.col ?? 0,
                  row: step.row ?? 0,
                  colSpan: step.colSpan ?? 1,
                  rowSpan: step.rowSpan ?? 1,
                },
              ];
            });
            break;
          case "move":
            setBlocks((prev) =>
              prev.map((b) =>
                b.id === step.blockId
                  ? { ...b, col: step.col ?? b.col, row: step.row ?? b.row }
                  : b,
              ),
            );
            break;
          case "resize":
            setBlocks((prev) =>
              prev.map((b) =>
                b.id === step.blockId
                  ? {
                      ...b,
                      col: step.col ?? b.col,
                      row: step.row ?? b.row,
                      colSpan: step.colSpan ?? b.colSpan,
                      rowSpan: step.rowSpan ?? b.rowSpan,
                    }
                  : b,
              ),
            );
            break;
          case "remove":
            setBlocks((prev) => prev.filter((b) => b.id !== step.blockId));
            break;
        }
      }, 500);

      return () => clearTimeout(timer);
    },
    [getBlockPos],
  );

  useEffect(() => {
    if (stepIndex < 0) {
      const startTimer = setTimeout(() => setStepIndex(0), 800);
      return () => clearTimeout(startTimer);
    }

    if (stepIndex >= CHOREOGRAPHY.length) {
      // Reset after full cycle
      const resetTimer = setTimeout(
        () => {
          setBlocks([]);
          setStepIndex(-1);
          setActiveBlockId(null);
          setCurrentAction(null);
          setCursorPos({ x: 150, y: 100 });
        },
        2500 * speed,
      );
      return () => clearTimeout(resetTimer);
    }

    const cleanup = executeStep(CHOREOGRAPHY[stepIndex]);
    const nextTimer = setTimeout(
      () => {
        setStepIndex((s) => s + 1);
      },
      1400 * speed,
    );

    return () => {
      nextTimer && clearTimeout(nextTimer);
      cleanup?.();
    };
  }, [stepIndex, speed, executeStep]);

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border bg-card shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          {showBrand && (
            <span className="text-xs font-mono text-muted-foreground tracking-wider">
              Vigi<span className="font-bold text-foreground">Sensys</span>
            </span>
          )}
          <div className="h-3 w-px bg-border" />
          <motion.span
            className="text-sm font-semibold text-foreground"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {textToDisplay}
          </motion.span>
        </div>
        <motion.span
          className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Licence Expert
        </motion.span>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="grid grid-cols-[1fr_180px] gap-4">
          {/* Grid canvas */}
          <div className="relative">
            {/* Grid background */}
            <div
              className="grid gap-2 min-h-70"
              style={{
                gridTemplateColumns: "repeat(3, 1fr)",
                gridTemplateRows: "repeat(3, 80px)",
              }}
            >
              {/* Ghost grid cells */}
              {Array.from({ length: 9 }, (_, i) => (
                <motion.div
                  key={`ghost-${i}`}
                  className="rounded-md border border-dashed border-border/40 bg-muted/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.03 }}
                  style={{
                    gridColumn: `${(i % 3) + 1}`,
                    gridRow: `${Math.floor(i / 3) + 1}`,
                  }}
                />
              ))}

              {/* Active blocks */}
              <AnimatePresence>
                {blocks.map((block) => (
                  <DashBlockCard
                    key={block.id}
                    block={block}
                    isActive={block.id === activeBlockId}
                    actionType={
                      block.id === activeBlockId
                        ? (currentAction ?? undefined)
                        : undefined
                    }
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Animated cursor */}
            {stepIndex >= 0 && stepIndex < CHOREOGRAPHY.length && currentAction && (
              <AnimatedCursor
                targetX={cursorPos.x}
                targetY={cursorPos.y}
                action={currentAction}
              />
            )}
          </div>

          {/* Side panel - activity log */}
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">
                Activite
              </span>
            </div>
            <ActivityLog
              actions={CHOREOGRAPHY}
              currentIndex={stepIndex}
            />

            <div className="mt-4 pt-3 border-t border-border/50">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500/60" />
                  <span className="text-[9px] text-muted-foreground">Ajouter</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary/60" />
                  <span className="text-[9px] text-muted-foreground">Deplacer</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500/60" />
                  <span className="text-[9px] text-muted-foreground">
                    Redimensionner
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500/60" />
                  <span className="text-[9px] text-muted-foreground">Supprimer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-2.5 flex items-center justify-between">
        <span className="text-[10px] font-mono text-muted-foreground">{description}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
            {stepIndex >= 0 ? Math.min(stepIndex + 1, CHOREOGRAPHY.length) : 0}/{CHOREOGRAPHY.length}
          </span>
          <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: "hsl(var(--primary) / 0.5)" }}
              animate={{
                width: `${stepIndex >= 0 ? ((Math.min(stepIndex + 1, CHOREOGRAPHY.length) / CHOREOGRAPHY.length) * 100) : 0}%`,
              }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* Global shimmer */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.015) 50%, transparent 100%)",
        }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{
          duration: 3.5 * speed,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 1,
        }}
      />
    </div>
  );
}
