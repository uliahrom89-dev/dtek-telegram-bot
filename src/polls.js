
import {
  computeOutageIntervals,
  getKyivNow,
  buildDateIndex,
} from "./renderer.js";

export function getUpcomingPolls(scheduleData) {
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
  const polls = [];

  for (const { from, to } of intervals) {
    const events = [
      { type: "off", time: from },
      { type: "on", time: to },
    ];

    for (const event of events) {
      const minutesAfter = currentMinutes - event.time;

      if (minutesAfter >= 5 && minutesAfter < 15) {
        polls.push({
          id: `${now.date}-${groups[0]}-${event.type}-${event.time}`,
          type: event.type,
          time: event.time,
        });
      }
    }
  }

  return polls;
}
