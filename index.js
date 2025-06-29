/* global IJS, divideIntoRectangles */

// ─────────────────────────────────────────────────────────────────────────────
// Handy DOM references
// ─────────────────────────────────────────────────────────────────────────────
const fileupload          = document.getElementById("image");
const thresholdSlider     = document.getElementById("threshold");
const thresholdValueSpan  = document.getElementById("threshold-value");
const thresholdInfoSpan   = document.getElementById("threshold-info");
const enableTransparency  = document.getElementById("enabletransparency");
const exportBtn           = document.getElementById("export");

// info panel spans
const sizeSpan        = document.getElementById("size");
const pixelsSpan      = document.getElementById("pixels");
const blocksSpan      = document.getElementById("blocks");
const improvementSpan = document.getElementById("improvement");
const timeSpan        = document.getElementById("time");
const errorBox        = document.getElementById("error");

// canvases (single-image preview only)
const canvasOriginal = document.getElementById("original");
const canvasBlocks   = document.getElementById("blocks");
const canvasFinal    = document.getElementById("final");
const ctxBlocks      = canvasBlocks.getContext("2d");
const ctxFinal       = canvasFinal.getContext("2d");

let lastURL = null;          // for revoking object-URLs
let singleImage = null;      // IJS.Image in single-preview mode
let multiMode = false;       // true when >1 file selected

// ─────────────────────────────────────────────────────────────────────────────
// Helpers to update “information:” panel
// ─────────────────────────────────────────────────────────────────────────────
function setInfo(field, value) {
  const map = {
    size: sizeSpan,
    pixels: pixelsSpan,
    blocks: blocksSpan,
    improvement: improvementSpan,
    time: timeSpan
  };
  if (map[field]) map[field].textContent = value;
}

// ─────────────────────────────────────────────────────────────────────────────
// File input change → decide between single-image preview or batch mode
// ─────────────────────────────────────────────────────────────────────────────
fileupload.addEventListener("change", async evt => {
  const files = evt.target.files;
  if (!files.length) return;

  errorBox.textContent = "";
  thresholdSlider.disabled = false;

  if (files.length === 1) {
    // ── Single-image preview mode ──
    multiMode = false;
    const file = files[0];

    // revoke previous object URL
    if (lastURL) URL.revokeObjectURL(lastURL);
    lastURL = URL.createObjectURL(file);

    try {
      singleImage = await IJS.Image.load(lastURL);
    } catch (e) {
      errorBox.textContent = `Error loading image: ${e}`;
      return;
    }

    // draw original to canvas (hidden but sized)
    canvasOriginal.width  = singleImage.width;
    canvasOriginal.height = singleImage.height;
    canvasBlocks.width    = singleImage.width;
    canvasBlocks.height   = singleImage.height;
    canvasFinal.width     = singleImage.width;
    canvasFinal.height    = singleImage.height;
    canvasOriginal.getContext("2d").putImageData(
      new ImageData(singleImage.data, singleImage.width),
      0, 0
    );

    await processAndPreviewSingle();

  } else {
    // ── Batch mode (no preview) ──
    multiMode = true;
    singleImage = null;

    // Clear preview canvases & info
    ctxBlocks.clearRect(0, 0, canvasBlocks.width, canvasBlocks.height);
    ctxFinal.clearRect(0, 0, canvasFinal.width, canvasFinal.height);
    ["size","pixels","blocks","improvement","time"].forEach(f => setInfo(f,"–"));

    errorBox.textContent =
      `Selected ${files.length} images. Choose threshold, then click “Export”.`;
  }
});

// when slider moves, update text + (if single-preview) re-render
thresholdSlider.addEventListener("input", () => {
  thresholdValueSpan.textContent  = thresholdSlider.value;
  thresholdInfoSpan.textContent   = thresholdSlider.value;
  if (!multiMode && singleImage) processAndPreviewSingle();
});

// ─────────────────────────────────────────────────────────────────────────────
// Preview routine (single image only)
// ─────────────────────────────────────────────────────────────────────────────
async function processAndPreviewSingle() {
  const t0 = performance.now();

  const pixels = [];
  for (let x = 0; x < singleImage.width; x++) {
    const col = [];
    for (let y = 0; y < singleImage.height; y++) {
      col.push(singleImage.getPixelXY(x, y));
    }
    pixels.push(col);
  }

  const rects = divideIntoRectangles(pixels, +thresholdSlider.value);

  // draw “blocky” preview
  ctxBlocks.clearRect(0,0,canvasBlocks.width,canvasBlocks.height);
  for (const {rect, color} of rects) {
    const [r,g,b,a] = color;
    ctxBlocks.fillStyle = `rgba(${r},${g},${b},${a/255})`;
    ctxBlocks.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  // draw final reassembled preview
  ctxFinal.putImageData(
    new ImageData(singleImage.data, singleImage.width),
    0,0
  );

  // Update info panel
  const pixelsCount = singleImage.width * singleImage.height;
  setInfo("size", `${singleImage.width}×${singleImage.height}`);
  setInfo("pixels", pixelsCount.toLocaleString());
  setInfo("blocks", rects.length.toLocaleString());
  setInfo("improvement",
    ((1 - rects.length / pixelsCount) * 100).toFixed(0) + "%");
  setInfo("time", (performance.now() - t0).toFixed(0) + " ms");
}

// ─────────────────────────────────────────────────────────────────────────────
// FRAME → RBXMX snippet
// ─────────────────────────────────────────────────────────────────────────────
function frameXML(px, py, w, h, imgW, imgH, scale, r,g,b,a) {
  // position & size as UDim2 (scale, offset)
  const posX = (px / imgW).toFixed(6);
  const posY = (py / imgH).toFixed(6);
  const sizeX= (w  / imgW).toFixed(6);
  const sizeY= (h  / imgH).toFixed(6);

  return `
                <Item class="Frame">
                    <Properties>
                        <bool name="Active">true</bool>
                        <UDim2 name="Position">
                            <XS>${posX}</XS><XO>0</XO>
                            <YS>${posY}</YS><YO>0</YO>
                        </UDim2>
                        <UDim2 name="Size">
                            <XS>${sizeX}</XS><XO>0</XO>
                            <YS>${sizeY}</YS><YO>0</YO>
                        </UDim2>
                        <float name="BackgroundTransparency">${(255-a)/255}</float>
                        <Color3 name="BackgroundColor3">
                            <R>${(r/255).toFixed(4)}</R>
                            <G>${(g/255).toFixed(4)}</G>
                            <B>${(b/255).toFixed(4)}</B>
                        </Color3>
                    </Properties>
                </Item>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT → single RBXMX (model with multiple SurfaceGuis)
// ─────────────────────────────────────────────────────────────────────────────
exportBtn.addEventListener("click", async () => {
  const files = fileupload.files;
  if (!files.length) { errorBox.textContent = "No images selected."; return; }

  const threshold = +thresholdSlider.value;
  const keepAlpha = enableTransparency.checked;

  const header =
`<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
    <Meta name="ExplicitAutoJoints">true</Meta>
    <External>null</External>
    <External>nil</External>
    <Item class="Model">
        <Properties>
            <string name="Name">BypassedImages</string>
            <BinaryString name="AttributesSerialize"></BinaryString>
            <BinaryString name="Tags"></BinaryString>
        </Properties>`;

  let xml = header;
  let processed = 0, failed = 0;

  for (const [i, file] of Array.from(files).entries()) {
    let img;
    try {
      const url = URL.createObjectURL(file);
      img = await IJS.Image.load(url);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to load:", file.name);
      failed++; continue;
    }

    const pix = [];
    for (let x=0;x<img.width;x++){
      const col=[];
      for (let y=0;y<img.height;y++){
        col.push(img.getPixelXY(x,y));
      }
      pix.push(col);
    }

    const rects = divideIntoRectangles(pix, threshold);

    // part + surfacegui wrapper
    xml += `
        <Item class="Part">
            <Properties>
                <string name="Name">BypassedImage${i+1}</string>
                <bool   name="Anchored">true</bool>
                <Vector3 name="size"><X>16</X><Y>16</Y><Z>1</Z></Vector3>
                <BinaryString name="AttributesSerialize"></BinaryString>
                <BinaryString name="Tags"></BinaryString>
            </Properties>
            <Item class="SurfaceGui">
                <Properties>
                    <string name="Name">${i+1}</string>
                    <bool   name="Active">true</bool>
                    <Ref    name="Adornee">null</Ref>
                    <Vector2 name="CanvasSize"><X>${img.width}</X><Y>${img.height}</Y></Vector2>
                </Properties>`;

    for (const {rect, color} of rects) {
      const [r,g,b,a] = color;
      const alpha = keepAlpha ? a : 255;
      xml += frameXML(rect.x, rect.y, rect.width, rect.height,
                      img.width, img.height, 0.05, r,g,b, alpha);
    }

    xml += `
            </Item> <!-- SurfaceGui -->
        </Item> <!-- Part -->`;

    processed++;
  }

  xml += `
    </Item> <!-- Model -->
</roblox>`;

  const blob = new Blob([xml], {type:"text/xml"});
  const a    = document.createElement("a");
  a.href     = URL.createObjectURL(blob);

  // filename: folder name if available, else “BatchImages”
  if (files.length === 1) {
    a.download = files[0].name + ".rbxmx";
  } else {
    const path = files[0].webkitRelativePath;
    const top  = path ? path.split("/")[0] : "BatchImages";
    a.download = top + ".rbxmx";
  }
  a.click(); a.remove();

  errorBox.textContent =
    `Done. Exported ${processed} image(s)` +
    (failed ? `; ${failed} failed.` : ".");
});
