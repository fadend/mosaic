// Limit the number of cells per row/column.
// (100 * 20)**2 = 4 * 10**6, already pretty hefty.
const MAX_CELLS_PER_SIDE = 100;

const FACE = [
  "00000000000000",
  "00001111111100",
  "00010000000010",
  "00100000000010",
  "01000000000010",
  "01000000000001",
  "01001110111101",
  "01000000100001",
  "01000100101001",
  "01000000100001",
  "01000000100001",
  "01000000100001",
  "01000000100001",
  "01000000100001",
  "01000011100001",
  "01000000000010",
  "01000000000010",
  "01000111110010",
  "00100000000010",
  "00100000000100",
  "00010000000100",
  "00001000001000",
  "00000100010000",
  "00000011100000",
  "00000000000000",
];

let state = null;

// Pixels size (width/height) for the individual GIFs.
const IMAGE_PIXEL_SIZE = 20;

function updateState(event) {
  event.stopPropagation();
  const checkbox = event.target;
  const rowIndex = checkbox.dataset.rowIndex;
  const colIndex = checkbox.dataset.colIndex;
  if (typeof rowIndex === "undefined" || typeof colIndex === "undefined") {
    console.log("Unexpected target", target);
  }
  const cells = state[rowIndex].split("");
  cells[colIndex] = checkbox.checked ? "1" : "0";
  state[rowIndex] = cells.join("");
}

function drawMosaic(parentElem, rows, editParams = null) {
  parentElem.innerHTML = "";
  const table = document.createElement("table");
  table.classList.add("mosaic-table");
  let width = rows[0].length;
  let height = rows.length;
  if (editParams) {
    table.classList.add("mosaic-table-editing");
    ({ width, height } = editParams);
  }
  table.style.width = rows[0].length * IMAGE_PIXEL_SIZE;
  table.style.height = rows.length * IMAGE_PIXEL_SIZE;

  for (let i = 0; i < height; i++) {
    const row = rows[i];
    const tr = document.createElement("tr");
    for (let j = 0; j < width; j++) {
      const c = row[j];
      const td = document.createElement("td");
      const on = c === "1";
      if (editParams) {
        const label = document.createElement("label");
        label.classList.add("mosaic-edit-label");
        const checkbox = document.createElement("input");
        checkbox.classList.add("mosaic-checkbox");
        checkbox.addEventListener("change", updateState);
        checkbox.dataset.rowIndex = i;
        checkbox.dataset.colIndex = j;
        checkbox.type = "checkbox";
        checkbox.checked = on;
        label.appendChild(checkbox);
        td.appendChild(label);
      } else {
        const src = on ? "images/black.gif" : "images/white.gif";
        const img = document.createElement("img");
        img.width = IMAGE_PIXEL_SIZE;
        img.height = IMAGE_PIXEL_SIZE;
        img.src = src;
        img.alt = c;
        td.appendChild(img);
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  parentElem.appendChild(table);
}

function parseMosaicRows(mosaicParam) {
  if (!mosaicParam) {
    return null;
  }
  const parsed = /(\d+)x(\d+),([a-fA-F0-9]+)/.exec(mosaicParam);
  if (!parsed) {
    console.log("Problem parsing m param: " + mosaicParam);
    return null;
  }
  const width = parseInt(parsed[1], 10);
  const height = parseInt(parsed[2], 10);
  if (width > MAX_CELLS_PER_SIDE || height > MAX_CELLS_PER_SIDE) {
    console.log(`width or height too big: ${width} x ${height}`);
    return null;
  }
  let bits = BigInt("0x" + parsed[3]);
  const rows = [];
  for (let i = 0; i < height; i++) {
    const row = [];
    for (let j = 0; j < width; j++) {
      row.push(bits & 1n ? "1" : "0");
      bits = bits >> 1n;
    }
    rows.push(row.join(""));
  }
  return rows;
}

const mosaicElem = document.getElementById("mosaic");
const soundCheckbox = document.getElementById("sound-checkbox");
const soundPlayer = document.getElementById("sound-player");
const editButton = document.getElementById("edit-button");
const editControl = document.getElementById("edit-controls");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const clearButton = document.getElementById("clear-button");
const doneButton = document.getElementById("done-button");

state = parseMosaicRows(new URLSearchParams(location.search).get("m")) || [
  ...FACE,
];

soundCheckbox.addEventListener("change", async function () {
  if (soundCheckbox.checked) {
    try {
      await soundPlayer.play();
    } catch (err) {
      console.log(err);
      soundCheckbox.checked = false;
    }
  } else {
    soundPlayer.pause();
  }
});

editButton.addEventListener("click", function () {
  editControl.style.display = "";
  widthInput.value = state[0].length;
  heightInput.value = state.length;
  drawMosaic(mosaicElem, state, {
    width: widthInput.value,
    height: heightInput.value,
  });
});

function handleDimensionChange() {
  const width = parseInt(widthInput.value);
  const height = parseInt(heightInput.value);
  while (state.length < height) {
    state.push("0".repeat(width));
  }
  for (let i = 0; i < state.length; i++) {
    let widthDiff = width - state[i].length;
    if (widthDiff > 0) {
      state[i] = state[i] + "0".repeat(widthDiff);
    }
  }
  drawMosaic(mosaicElem, state, { width, height });
}

widthInput.addEventListener("change", handleDimensionChange);
heightInput.addEventListener("change", handleDimensionChange);

clearButton.addEventListener("click", function () {
  for (let i = 0; i < state.length; i++) {
    state[i] = "0".repeat(state[i].length);
  }
  drawMosaic(mosaicElem, state, {
    width: widthInput.value,
    height: heightInput.value,
  });
});

doneButton.addEventListener("click", function () {
  const width = parseInt(widthInput.value);
  const height = parseInt(heightInput.value);
  if (state.length > height) {
    state = state.slice(0, height);
  }
  for (let i = 0; i < state.length; i++) {
    const row = state[i];
    if (row.length > width) {
      state[i] = row.substring(0, width);
    }
  }
  const serialized = BigInt(
    "0b" +
      state
        .map((row) => row.split("").toReversed().join(""))
        .toReversed()
        .join(""),
  );
  const mosaicParam = `${width}x${height},${serialized.toString(16)}`;
  const baseUrl = location.href.replace(/#.*/, "").replace(/\?.*/, "");
  location.href = `${baseUrl}?m=${mosaicParam}`;
});

drawMosaic(mosaicElem, state);
