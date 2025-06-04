import { process } from "./process.js";
import { Mutex } from "./mutex.js";

const controller = new AbortController();

onmessage = async function (event) {
  if (event.data === "abort") {
    return controller.abort();
  }
  const {
    items,
    sharedMemoryBlockForItemIdx,
    sharedMutex,
    concurrencyLimitPerThread,
  } = event.data;
  const mutex = Mutex.connect(sharedMutex);
  const sharedNextItemIdx = new Int32Array(sharedMemoryBlockForItemIdx);
  const concurrentTasks = Array.from(
    { length: concurrencyLimitPerThread },
    async () => {
      while (
        (mutex.lock(),
        /*critical section start*/
        sharedNextItemIdx[0] < items.length)
      ) {
        const idx = sharedNextItemIdx[0]++;
        /*critical section end*/
        mutex.unlock();
        postMessage({ idx, state: "running" });
        try {
          await process(items[idx], controller.signal);
          postMessage({ idx, state: "success" });
        } catch (error) {
          if (error.name === "AbortError") return;
          postMessage({ idx, state: "error" });
        }
      }
      mutex.unlock();
    },
  );
  await Promise.all(concurrentTasks);
  postMessage("done");
};
