"use client";

import { useEffect, useState } from "react";

interface AnimatedStreamingProps {
  text: string;
}

export function AnimatedStreaming({ text }: AnimatedStreamingProps) {
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {text.split('\n').map((paragraph, idx) => (
        <p key={idx}>
          {paragraph}
          {idx === text.split('\n').length - 1 && (
            <span
              className="inline-block h-4 w-0.5 bg-foreground ml-0.5"
              style={{ opacity: showCursor ? 1 : 0 }}
            />
          )}
        </p>
      ))}
    </div>
  );
}