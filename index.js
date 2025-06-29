/* index.js  – BATCH-UPLOAD EDITION */

import { setDebugText, commaSeparate }            from "./utility.js";
import { divideIntoRectangles, reassembleImage }  from "./rect.js";
import { buildCombinedRbxm }                      from "./export.js";

/* ---- canvas & control handles (unchanged) ---- */
const original_canvas = document.querySelector("#original");
const original_ctx    = original_canvas.getContext("2d");
const blocks_canvas   = document.querySelector("#blocks");
const blocks_ctx      = blocks_canvas.getContext("2d");
const final_canvas    = document.querySelector("#final");
const final_ctx       = final_canvas.getContext("2d");

const threshold          = document.querySelector("#threshold");
const fileInput          = document.querySelector('input[type="file"]');
const extreme            = document.querySelector("#extreme");
const enableTransparency = document.querySelector("#transparency");
const error              = document.querySelector("#error");
const exportBtn          = document.querySelector("#export");

/* allow selecting MANY files at once */
fileInput.setAttribute("multiple", "multiple");

/* ---------- helper to process ONE image ---------- */
async function analyseImage(file) {
	const url  = URL.createObjectURL(file);
	const img  = await IJS.Image.load(url);

	// copy of original init() – but scoped
	original_canvas.width  = img.width;
	original_canvas.height = img.height;
	blocks_canvas.width    = img.width;
	blocks_canvas.height   = img.height;
	final_canvas.width     = img.width;
	final_canvas.height    = img.height;

	setDebugText("size",   `${img.width}×${img.height}`);
	setDebugText("pixels", commaSeparate(img.width * img.height));

	for (let x = 0; x < img.width; ++x) {
		for (let y = 0; y < img.height; ++y) {
			const p = img.getPixelXY(x, y);
			original_ctx.fillStyle = `rgba(${p[0]},${p[1]},${p[2]},${p[3] ?? 255})`;
			original_ctx.fillRect(x, y, 1, 1);
		}
	}

	/* rectangle pack */
	const pixels      = img.getPixelsArray ? img.getPixelsArray() : img; // compat
	const rectangles  = divideIntoRectangles(pixels, threshold.value);

	// minimal preview — just the first image so we don’t repaint a thousand times
	if (file === fileInput.files[0]) {
		for (const blk of rectangles) {
			const c = blk.color;
			blocks_ctx.fillStyle = `hsl(${c[0]},100%,50%)`;
			blocks_ctx.fillRect(blk.rect.x, blk.rect.y, blk.rect.width, blk.rect.height);
		}
	}

	URL.revokeObjectURL(url);

	return {
		rectangles,
		width : img.width,
		height: img.height,
		name  : file.name
	};
}

/* ---------- EXPORT CLICK ---------- */
exportBtn.addEventListener("click", async () => {
	if (!fileInput.files.length) {
		alert("Select one or more images first.");
		return;
	}

	error.textContent = "";
	const surfaces = [];

	/* sequential processing keeps memory usage predictable */
	for (const f of fileInput.files) {
		try {
			surfaces.push(await analyseImage(f));
		} catch (err) {
			error.textContent = `Failed on ${f.name}: ${err}`;
			console.error(err);
		}
	}

	const rbxm = buildCombinedRbxm(surfaces, {
		keepTransparency: enableTransparency.checked
	});

	const blob = new Blob([rbxm], { type: "text/plain" });
	const a    = document.createElement("a");
	a.download = `batch_${Date.now()}.rbxmx`;
	a.href     = URL.createObjectURL(blob);
	a.click();
	a.remove();
});

/* ---- misc unchanged controls ---- */
extreme.addEventListener("click", () => {
	threshold.max = extreme.checked ? 100000 : 1000;
});

window.onload = () => {
	threshold.value  = 100;
	extreme.checked  = false;
	enableTransparency.checked = false;
	setDebugText("threshold", threshold.value);
};
