/*  index.js – batch‑enabled exporter  */

import {
  setDebugText,
  commaSeparate,
  range,
  range2
} from "./utility.js";
import {
  divideIntoRectangles,
  reassembleImage
} from "./rect.js";
import { generateFrame, generateHeader, footer } from "./export.js";

/* ----  DOM hooks  ---- */
const fileInput = document.querySelector("#filePicker");
const threshold = document.querySelector("#threshold");
const enableTransparency = document.querySelector("#transparency");
const extreme = document.querySelector("#extreme");
const exportBtn = document.querySelector("#export");
const errorBox = document.querySelector("#error");

/* A place to stash every image’s exported fragment. */
let exportChunks = [];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function loadImage(file) {
  return IJS.Image.load(URL.createObjectURL(file));
}

function analyse(image) {
  /* Harvest the rectangle map. */
  const pixels2D = [];
  for (const x of range(image.width)) {
    const col = [];
    for (const y of range(image.height)) {
      col.push(image.getPixelXY(x, y));
    }
    pixels2D.push(col);
  }
  return divideIntoRectangles(pixels2D, Number(threshold.value));
}

/* Build one complete “SurfaceGui” fragment for the specified file. */
async function processFile(file) {
  const img = await loadImage(file);
  const rects = analyse(img);

  /* Progress ‑‑ dev only. Remove if not needed. */
  console.info(`→ ${file.name}: ${rects.length} blocks`);

  let chunk = generateHeader(file.name.replace(/\.[^.]+$/, "")); // strip extension

  for (const block of rects) {
    const { x, y, width, height } = block.rect;
    const [r, g, b, a] = block.color;
    chunk += generateFrame(
      x,
      y,
      width,
      height,
      img.width,
      img.height,
      0.05,
      r,
      g,
      b,
      enableTransparency.checked ? a ?? 255 : 255
    );
  }
  chunk += footer;
  return chunk;
}

/* ------------------------------------------------------------------ */
/*  UI wiring                                                         */
/* ------------------------------------------------------------------ */
fileInput.addEventListener("change", async (e) => {
  exportChunks = [];                                    // reset
  errorBox.textContent = "";

  const files = [...e.target.files].filter((f) =>
    /^image\//.test(f.type)
  );

  /* The extreme checkbox still only widens the range of the slider,
     but is now applied to *all* images. */
  threshold.max = extreme.checked ? 100000 : 1000;

  try {
    for (const f of files) {
      /* eslint‑disable-next-line no-await-in-loop */
      exportChunks.push(await processFile(f));
    }
    setDebugText("blocks", commaSeparate(exportChunks.length));
  } catch (err) {
    console.error(err);
    errorBox.textContent = `Failed: ${err.message}`;
  }
});

exportBtn.addEventListener("click", () => {
  if (!exportChunks.length) {
    alert("Select a folder of images first!");
    return;
  }
  const blob = new Blob([exportChunks.join("\n")], {
    type: "text/plain"
  });
  const a = document.createElement("a");
  a.download = "batch_export.rbxmx";
  a.href = URL.createObjectURL(blob);
  a.click();
  a.remove();
});

/* Defaults */
window.onload = () => {
  threshold.value = 100;
  extreme.checked = false;
  enableTransparency.checked = false;
  setDebugText("threshold", threshold.value);
};
