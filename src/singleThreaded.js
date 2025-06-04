import { process } from "./process.js";

export async function processItems({
  items,
  concurrencyLimit,
  uiCallback,
  signal,
}) {
  let nextItemIdx = 0;
  const concurrentTasks = Array.from({ length: concurrencyLimit }, async () => {
    while (nextItemIdx < items.length) {
      const idx = nextItemIdx++;
      uiCallback({ idx, state: "running" });
      try {
        await process(items[idx], signal);
        uiCallback({ idx, state: "success" });
      } catch (error) {
        if (error.name === "AbortError") return;
        uiCallback({ idx, state: "error" });
      }
    }
  });
  await Promise.all(concurrentTasks);
}
