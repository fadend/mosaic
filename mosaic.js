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

const IMAGE_WIDTH = 20;

function createMosaic(parentElem, rows) {
  const table = document.createElement("table");
  table.classList.add("mosaic-table");
  table.style.width = rows[0].length * IMAGE_WIDTH;
  table.style.height = rows.length * IMAGE_WIDTH;

  for (const row of rows) {
    const tr = document.createElement("tr");
    for (const c of row) {
      const src = c === "0" ? "images/white.gif" : "images/black.gif";
      const td = document.createElement("td");
      const img = document.createElement("img");
      img.width = IMAGE_WIDTH;
      img.height = IMAGE_WIDTH;
      img.src = src;
      img.alt = c;
      td.appendChild(img);
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  parentElem.appendChild(table);
}

const soundCheckbox = document.getElementById("sound-checkbox");
const soundPlayer = document.getElementById("sound-player");

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

function parseMosaicRows(mosaicParam) {
  if (!mosaicParam) {
    return null;
  }
  const parsed = /(\d+)x(\d+),([a-fA-F0-9]+)/.exec(mosaicParam);
  if (!parsed) {
    console.log("Problem param img: " + mosaicParam);
    return null;
  }
  const width = parseInt(parsed[1], 10);
  const height = parseInt(parsed[2], 10);
  if (width > 1000 || height > 1000) {
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

createMosaic(
  document.getElementById("mosaic"),
  parseMosaicRows(new URLSearchParams(location.search).get("m")) || FACE,
);
