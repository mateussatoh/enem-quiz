type Level = "info" | "warn" | "error";

/** Structured JSON log line, one event name per call site. */
export function logEvent(level: Level, event: string, data: Record<string, unknown> = {}) {
  const line = JSON.stringify({ level, event, time: new Date().toISOString(), ...data });
  if (level === "info") {
    if (process.env.NODE_ENV !== "test") process.stdout.write(`${line}\n`);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.error(line);
  }
}
