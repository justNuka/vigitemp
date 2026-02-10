"use client";

import { cn } from "@/lib/utils";
import { motion, stagger, useAnimate, useInView } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
  onComplete,
  hideCursorOnComplete = true,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
  onComplete?: () => void;
  hideCursorOnComplete?: boolean;
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });

  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);
  const [cursorHidden, setCursorHidden] = useState(false);
  const startedRef = useRef(false);
  const totalChars = useMemo(
    () => wordsArray.reduce((sum, word) => sum + word.text.length, 0),
    [wordsArray],
  );
  useEffect(() => {
    if (isInView && !startedRef.current) {
      startedRef.current = true;
      animate(
        "span",
        {
          display: "inline-block",
          opacity: 1,
          width: "fit-content",
        },
        {
          duration: 0.3,
          delay: stagger(0.1),
          ease: "easeInOut",
        }
      );
      const totalMs = totalChars * 100 + 300;
      const timeout = window.setTimeout(() => {
        if (hideCursorOnComplete) {
          setCursorHidden(true);
        }
        onComplete?.();
      }, totalMs);
      return () => window.clearTimeout(timeout);
    }
  }, [isInView, animate, totalChars, hideCursorOnComplete, onComplete]);

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="inline whitespace-pre">
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <motion.span
                  initial={{}}
                  key={`char-${index}`}
                  className={cn("opacity-0 hidden", word.className)}
                >
                  {char}
                </motion.span>
              ))}
              &nbsp;
            </div>
          );
        })}
      </motion.div>
    );
  };
  return (
    <div
      className={cn(
        "text-base sm:text-lg md:text-xl font-semibold text-center",
        className
      )}
    >
      {renderWords()}
      {!cursorHidden && (
        <motion.span
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className={cn(
            "inline-block rounded-sm w-0.75 h-3 md:h-4 bg-current",
            cursorClassName
          )}
        ></motion.span>
      )}
    </div>
  );
};

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });
  const renderWords = () => {
    return (
      <div>
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <span key={`char-${index}`} className={cn(word.className)}>
                  {char}
                </span>
              ))}
              &nbsp;
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn("flex space-x-1 my-6", className)}>
      <motion.div
        className="overflow-hidden pb-2"
        initial={{
          width: "0%",
        }}
        whileInView={{
          width: "fit-content",
        }}
        transition={{
          duration: 2,
          ease: "linear",
          delay: 1,
        }}
      >
        <div
          className="text-base sm:text-lg md:text-xl font-semibold"
          style={{
            whiteSpace: "nowrap",
          }}
        >
          {renderWords()}{" "}
        </div>{" "}
      </motion.div>
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,

          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "block rounded-sm w-0.75 h-3 sm:h-4 bg-current",
          cursorClassName
        )}
      ></motion.span>
    </div>
  );
};
