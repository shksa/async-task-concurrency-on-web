export async function process(item, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
    }
    const timeout = setTimeout(
      () => {
        if (Math.random() > 0.1) {
          resolve(`successfully processed ${item.id}`);
        } else {
          reject(new Error(`error in processing ${item.id}`));
        }
      },
      Math.random() > 0.5 ? 3000 * Math.random() : 1000 * Math.random(),
    );

    const cancelProcess = () => {
      clearTimeout(timeout);
      reject(signal.reason);
      signal.removeEventListener("abort", cancelProcess);
    };

    signal.addEventListener("abort", cancelProcess);
  });
}
