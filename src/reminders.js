
import {
  computeOutageIntervals,
  getKyivNow,
  buildDateIndex,
} from "./renderer.js";

export function getUpcomingReminders(scheduleData) {
  const now = getKyivNow();
  const fact = scheduleData?.fact;
  const groups = scheduleData?.groups || [];

  if (!fact || groups.length !== 1) return [];

  const dateIndex = buildDateIndex(fact);
  const todayKey = dateIndex.get(now.date);
  const hours = fact.data?.[todayKey]?.[groups[0]];

  if (!hours) return [];

  const intervals = computeOutageIntervals(hours).off;
  const currentMinutes = now.hour * 60 + now.minute;

  return intervals
    .filter(({ from }) => {
      const minutesLeft = from - currentMinutes;
      return minutesLeft <= 30 && minutesLeft > 20;
    })
    .map(({ from, to }) => ({
      date: now.date,
      start: from,
      end: to,
      id: `${now.date}-${groups[0]}-${from}`,
    }));
}
