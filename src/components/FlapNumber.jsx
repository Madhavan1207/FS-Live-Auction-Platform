import { useEffect, useRef, useState } from "react";

/**
 * A single mechanical "split-flap" digit, like an old departure board.
 * It ticks up through 0-9 in a stepped motion before landing on `target`.
 */
function FlapDigit({ target, delay = 0 }) {
  const [pos, setPos] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPos(Number(target)), delay);
    return () => clearTimeout(t);
  }, [target, delay]);

  return (
    <span className="flap-window w-[0.62em] inline-block bg-parchment text-ink rounded-[2px] mx-[1px] shadow-inner">
      <span
        className="flap-track flex flex-col"
        style={{ transform: `translateY(-${pos * 10}%)` }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="h-[1em] flex items-center justify-center">
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Renders a number as a row of flap digits, e.g. value={247} -> [2][4][7]
 * Digits stagger in with a slight delay left-to-right for a mechanical feel.
 */
export default function FlapNumber({ value, prefix = "" }) {
  const digits = String(value).split("");

  return (
    <span className="inline-flex items-baseline font-mono text-3xl sm:text-4xl font-bold">
      {prefix && <span className="mr-1 text-brass">{prefix}</span>}
      {digits.map((d, i) => (
        <FlapDigit key={i} target={d} delay={i * 90} />
      ))}
    </span>
  );
}
