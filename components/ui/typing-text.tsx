"use client";

import { useState, useEffect } from "react";

interface TypingTextProps {
  text: string;
  speed?: number;
  className?: string;
  loop?: boolean;
}

export function TypingText({ text, speed = 50, className = "", loop = true }: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (loop) {
      // Reset and loop after a pause
      const timeout = setTimeout(() => {
        setDisplayedText("");
        setCurrentIndex(0);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed, loop]);

  return (
    <span className={className}>
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  );
}
