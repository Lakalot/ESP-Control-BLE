import { useEffect, useMemo, useState } from 'react';

function formatAge(updatedAt: number, now: number): string {
  const diffSeconds = Math.max(0, Math.floor((now - updatedAt) / 1000));

  if (diffSeconds <= 1) return 'Maj a l instant';
  if (diffSeconds < 60) return `Maj il y a ${diffSeconds} s`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `Maj il y a ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  return `Maj il y a ${diffHours} h`;
}

export function useCommandFreshness(lastUpdatedAt: number | undefined, isPending: boolean): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!lastUpdatedAt) return;

    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [lastUpdatedAt]);

  return useMemo(() => {
    if (isPending && !lastUpdatedAt) return 'Lecture en attente';
    if (!lastUpdatedAt) return 'Aucune lecture';
    if (isPending) return `Lecture en attente / ${formatAge(lastUpdatedAt, now)}`;
    return formatAge(lastUpdatedAt, now);
  }, [isPending, lastUpdatedAt, now]);
}
