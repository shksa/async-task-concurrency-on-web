export function createTableCells(itemCount) {
  const tableEl = document.getElementsByClassName("table")[0];
  const currentCellCount = tableEl.children.length;
  let cells;
  if (currentCellCount < itemCount) {
    cells = Array.from({ length: itemCount - currentCellCount }, (_, idx_) => {
      const idx = idx_ + currentCellCount;
      return `<div class="cell" id=${idx}><div>${idx}</div></div>`;
    });
    tableEl.insertAdjacentHTML("beforeend", cells.join(""));
  } else if (currentCellCount > itemCount) {
    cells = Array.from({ length: itemCount }, (_, idx) => {
      return `<div class="cell" id=${idx}><div>${idx}</div></div>`;
    });
    tableEl.innerHTML = cells.join("");
  }
}

export function resetTable() {
  for (const cell of document.getElementsByClassName("table")[0].children) {
    cell.innerHTML = `<div>${cell.getAttribute("id")}</div>`;
    cell.classList.remove("running");
    cell.classList.remove("success");
    cell.classList.remove("error");
  }
}

export function uiCallback(arg) {
  const cell = document.getElementsByClassName("table")[0].children[arg.idx];
  if (arg.state === "running") {
    cell.classList.add("running");
    if (arg.threadIdx !== undefined) {
      cell.insertAdjacentHTML(
        "afterbegin",
        `<div>Thread ${arg.threadIdx}</div>`,
      );
    }
  } else if (arg.state === "success") {
    cell.classList.remove("running");
    cell.classList.add("success");
  } else {
    cell.classList.remove("running");
    cell.classList.add("error");
  }
}

function createItems(itemCount) {
  return Array.from({ length: itemCount }, (_, id) => ({
    id,
  }));
}

export function attachOptionEventHandler(optionCallbacks) {
  const performanceResult = document.querySelector("p > code");
  let controller;
  async function onSubmit(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const threadType = formData.get("threadType");
    const threadCount = Number(formData.get("threadCount"));
    const concurrencyLimit = Number(formData.get("concurrencyLimit"));
    const itemCount = Number(formData.get("itemCount"));
    createTableCells(itemCount);
    resetTable();
    if (controller) {
      controller.abort();
    }
    controller = new AbortController();
    performanceResult.innerHTML = "";
    const startTime = performance.now();
    await optionCallbacks[threadType]({
      threadCount,
      concurrencyLimit,
      items: createItems(itemCount),
      signal: controller.signal,
    });
    performanceResult.innerHTML = performance.now() - startTime;
  }
  document.getElementsByTagName("form")[0].addEventListener("submit", onSubmit);
}
