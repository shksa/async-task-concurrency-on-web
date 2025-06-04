import { Mutex } from "./mutex.js";

export async function processItems({
  items,
  concurrencyLimit,
  uiCallback,
  threadCount,
  signal,
}) {
  const sharedMemoryNeededInBytes = Int32Array.BYTES_PER_ELEMENT * 1; // One 32-bit integer is needed as a shared variable
  const sharedMemoryBlockForItemIdx = new SharedArrayBuffer(
    sharedMemoryNeededInBytes,
  );
  const sharedMutex = new Mutex();
  const concurrencyLimitPerThread = Math.ceil(concurrencyLimit / threadCount);
  const concurrentWorkers = Array.from(
    { length: threadCount },
    (_, threadIdx) => {
      const worker = new Worker("./workerThread.js", {
        type: "module",
      });
      return new Promise((resolve) => {
        worker.postMessage({
          items,
          sharedMemoryBlockForItemIdx,
          sharedMutex,
          concurrencyLimitPerThread,
        });
        worker.onmessage = (event) => {
          if (event.data === "done") {
            console.log(`Thread ${threadIdx} done`);
            worker.terminate();
            return resolve();
          }
          const { idx, state } = event.data;
          uiCallback({ idx, state, threadIdx });
        };
        const cancelWorker = () => {
          worker.postMessage("abort");
          signal.removeEventListener("abort", cancelWorker);
        };
        signal.addEventListener("abort", cancelWorker);
      });
    },
  );

  await Promise.all(concurrentWorkers);
}
