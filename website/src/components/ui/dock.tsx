'use client';

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence
} from 'motion/react';
import React, { Children, cloneElement, useEffect, useMemo, useRef, useState } from 'react';

export type DockItemData = {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: () => void;
  className?: string;
  isActive?: boolean;
  ariaLabel?: string;
};

export type DockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  baseItemSize: number;
  magnification: number;
  isActive?: boolean;
  forceMagnify?: boolean;
  ariaLabel?: string;
};

function DockItem({
  children,
  className = '',
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  isActive = false,
  forceMagnify = false,
  ariaLabel,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, val => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize
    };
    return val - rect.x - baseItemSize / 2;
  });

  // Si l'élément est actif, rester à magnification. Sinon comportement normal hover
  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const finalSize = useTransform(() => (isActive ? magnification : targetSize.get()));
  const size = useSpring(finalSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative inline-flex items-center justify-center rounded-full transition-colors ${
        isActive 
          ? 'bg-black text-white border-white shadow-lg shadow-black/20 dark:bg-white dark:text-black dark:border-black dark:shadow-white/20'
          : 'bg-white dark:bg-[#060010] border-neutral-300 dark:border-neutral-700 text-black dark:text-white'
      } border-2 shadow-md ${className}`}
      tabIndex={0}
      role="button"
      aria-label={ariaLabel}
      aria-current={isActive ? 'page' : undefined}
    >
      {Children.toArray(children).map((child) =>
        React.isValidElement(child)
          ? cloneElement(
              child as React.ReactElement<{
                isHovered?: MotionValue<number>;
                isActive?: boolean;
                forceMagnify?: boolean;
              }>,
              { isHovered, isActive, forceMagnify }
            )
          : child
      )}
    </motion.div>
  );
}

type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
};

function DockLabel({ children, className = '', isHovered }: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on('change', latest => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`${className} absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md border border-neutral-300 dark:border-neutral-700 bg-zinc-100 dark:bg-[#060010] px-2 py-0.5 text-xs text-black dark:text-white`}
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type DockIconProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
  isActive?: boolean;
  forceMagnify?: boolean;
};

function DockIcon({ children, className = '', isHovered, isActive = false, forceMagnify = false }: DockIconProps) {
  const fallbackHovered = useMotionValue(0);
  const hovered = isHovered ?? fallbackHovered;
  const scale = useTransform(hovered, [0, 1], [1, 1.15]);
  const boostedScale = useTransform(() => (isActive || forceMagnify ? 1.15 : scale.get()));
  const animatedScale = useSpring(boostedScale, { mass: 0.2, stiffness: 250, damping: 18 });

  return (
    <motion.div style={{ scale: animatedScale }} className={`flex items-center justify-center ${className}`}>
      {children}
    </motion.div>
  );
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 64,
  dockHeight = 256,
  baseItemSize = 50,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const hasActive = useMemo(() => items.some((item) => item.isActive), [items]);
  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [dockHeight, magnification]
  );
  const heightRow = useTransform(isHovered, (v) =>
    hasActive ? maxHeight : v ? maxHeight : panelHeight
  );
  const height = useSpring(heightRow, spring);

  return (
    <motion.div style={{ height, scrollbarWidth: 'none' }} className="mx-2 flex max-w-full items-center">
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={`${className} fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50 flex items-end w-fit gap-4 rounded-2xl border-neutral-300 dark:border-neutral-700 border-2 pb-2 px-4 bg-white/60 dark:bg-black/60 backdrop-blur-2xl`}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            isActive={item.isActive}
            forceMagnify={false}
            ariaLabel={item.ariaLabel ?? (typeof item.label === 'string' ? item.label : undefined)}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}
