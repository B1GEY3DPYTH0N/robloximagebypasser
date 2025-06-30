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
//const fileUpload       = document.querySelector("#fileUpload");
//const exportBtnon     = document.querySelector("#export");
let   pendingChunks    = [];   // holds header+frames+footer for each image
let   lastObjectURL    = null; // for memory hygiene

fileInput.addEventListener("change", async (ev) => {
    pendingChunks.length = 0;                  // reset
    const files = [...ev.target.files]
                 .filter(f => /^image\//.test(f.type));
    if (!files.length) {
        alert("No images found in that folder!"); return;
    }

    // sequential processing keeps RAM stable for huge batches
    for (const f of files) {
        if (lastObjectURL) URL.revokeObjectURL(lastObjectURL);
        lastObjectURL = URL.createObjectURL(f);
        window.image  = await IJS.Image.load(lastObjectURL);  // async
        await init();                         // <‑‑ existing function
        const rects   = run();                // <‑‑ existing function

        // reuse *all* original maths and helpers
        let out = makeHeader(f.name.replace(/\.[^.]+$/, "")); // new name
        for (const blk of rects) {
            out += generateFrame(
                blk.rect.x, blk.rect.y,
                blk.rect.width, blk.rect.height,
                image.width,  image.height,
                0.05,                             // same offset as UI
                blk.color[0], blk.color[1], blk.color[2],
                enabletransparency.checked ? blk.color[3] ?? 255 : 255
            );
        }
        out += footer;                          // close the SurfaceGui
        pendingChunks.push(out);                // stash for later
    }

    setDebugText("blocks", commaSeparate(pendingChunks.length));
});

exportBtn.addEventListener("click", () => {
    if (!pendingChunks.length) {
        alert("Pick a folder first!"); return;
    }
    /* DO ***NOT*** INSERT NEWLINES — join with a single space so the
       token stream remains contiguous. */
    const blob = new Blob([pendingChunks.join(" ")], {type: "text/plain"});
    const a    = document.createElement("a");
    a.download = "batch_export.rbxmx";
    a.href     = URL.createObjectURL(blob);
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
