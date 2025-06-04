import {
  uiCallback,
  attachOptionEventHandler,
  createTableCells,
} from "./ui.js";
import * as singleThread from "./singleThreaded.js";
import * as multiThread from "./multiThreaded.js";

function createApp() {
  createTableCells(500);
  attachOptionEventHandler({
    async singleThreaded({ concurrencyLimit, items, signal }) {
      await singleThread.processItems({
        items,
        concurrencyLimit,
        uiCallback,
        signal,
      });
    },
    async multiThreaded({ concurrencyLimit, items, signal, threadCount }) {
      await multiThread.processItems({
        items,
        concurrencyLimit,
        uiCallback,
        signal,
        threadCount,
      });
    },
  });
}

createApp();
