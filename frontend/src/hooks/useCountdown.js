import { useEffect, useState } from "react";

// Custom hook: given a `closingAt` timestamp (ms since epoch), returns a
// live, human-readable countdown that updates once per second, plus a
// boolean flag once the auction has closed. Used by ItemDetail (main
// countdown) and Browse (compact "time left" badge on each card) so the
// ticking logic lives in exactly one place.
export default function useCountdown(closingAt) {
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, closingAt - Date.now())
  );

  useEffect(() => {
    // Already closed when mounted — nothing to tick.
    if (closingAt - Date.now() <= 0) {
      setRemainingMs(0);
      return;
    }

    const intervalId = setInterval(() => {
      const next = closingAt - Date.now();
      setRemainingMs(next > 0 ? next : 0);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [closingAt]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const isClosed = remainingMs <= 0;

  let label;
  if (isClosed) {
    label = "Auction closed";
  } else if (days > 0) {
    label = `${days}d ${hours}h left`;
  } else if (hours > 0) {
    label = `${hours}h ${minutes}m left`;
  } else if (minutes > 0) {
    label = `${minutes}m ${seconds}s left`;
  } else {
    label = `${seconds}s left`;
  }

  return { days, hours, minutes, seconds, isClosed, label };
}
