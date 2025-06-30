// index.js

import { setDebugText, commaSeparate, range, range2 } from "./utility.js";
import { divideIntoRectangles, reassembleImage } from "./rect.js";
import { rbxmxHeader, rbxmxFooter, generateImagePart } from "./export.js";

// define our variables
const original_canvas = document.querySelector("#original");
const original_ctx = original_canvas.getContext("2d");
const blocks_canvas = document.querySelector("#blocks");
const blocks_ctx = blocks_canvas.getContext("2d");
const final_canvas = document.querySelector("#final");
const final_ctx = final_canvas.getContext("2d");

const threshold = document.querySelector("#threshold");
const fileupload = document.querySelector(`input[type="file"]`);
const extreme = document.querySelector("#extreme");
const enabletransparency = document.querySelector("#transparency");
const error = document.querySelector("#error");
const processBtn = document.querySelector("#process");
const exportBtn = document.querySelector("#export");
const statusDiv = document.querySelector("#process-status");

// Global state
let lastFiles = [];
let processedImages = [];

// init function is called to display a preview of one image
async function init(image, filename) {
	document.querySelector("#original-title").textContent = filename;
	document.querySelector("#blocks-title").textContent = filename;
	document.querySelector("#final-title").textContent = filename;

	original_canvas.width = image.width;
	original_canvas.height = image.height;
	blocks_canvas.width = image.width;
	blocks_canvas.height = image.height;
	final_canvas.width = image.width;
	final_canvas.height = image.height;
    
	original_ctx.clearRect(0, 0, original_canvas.width, original_canvas.height);
	blocks_ctx.clearRect(0, 0, blocks_canvas.width, blocks_canvas.height);
	final_ctx.clearRect(0, 0, final_canvas.width, final_canvas.height);

	setDebugText("size", `${image.width}x${image.height}`);
	setDebugText("pixels", commaSeparate(image.width * image.height));

	for (const x of range(image.width)) {
		for (const y of range(image.height)) {
			var pixel = image.getPixelXY(x, y);
			original_ctx.fillStyle = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] ?? 255})`;
			original_ctx.fillRect(x, y, 1, 1);
		}	
	}

	document.querySelector("#linewarning").innerHTML = "note: the squares/lines that may show up here will not <br> show up in-game.";
}

// get a 2d array of pixels from a rectangular area
function getPixels(x1, y1, x2, y2, image) {
	var pixels = [];
	for (const x of range2(x1, x2)) {
		var row = [];
		for (const y of range2(y1, y2)) {
			row.push(image.getPixelXY(x, y));
		}
		pixels.push(row);
	}
	return pixels;
}

// the main script, runs for each image
function run(image) {
	var startTime = Date.now();
	var pixels = getPixels(0, 0, image.width, image.height, image);
	var rect = divideIntoRectangles(pixels, threshold.value);
	var reassembled = reassembleImage(rect, image.width, image.height);

	blocks_ctx.clearRect(0, 0, blocks_canvas.width, blocks_canvas.height);
	final_ctx.clearRect(0, 0, final_canvas.width, final_canvas.height);

	for (const x of range(image.width)) {
		for (const y of range(image.height)) {
			var pixel = reassembled[x][y];
			blocks_ctx.fillStyle = `hsl(${pixel[0]}, 100%, 50%)`;
			blocks_ctx.fillRect(x, y, 1, 1);
			final_ctx.fillStyle = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] ?? 255})`;
			final_ctx.fillRect(x, y, 1, 1);
		}
	}

	setDebugText("blocks", commaSeparate(rect.length));
	setDebugText("time", `${Date.now() - startTime}ms`);
	setDebugText("improvement", `${Math.round((1 - (rect.length / (image.width * image.height))) * 100)}%`);

	return rect;
}

// Main logic for processing all selected files
async function processFiles(files) {
    processedImages = [];
    error.innerHTML = "";

    if (files.length === 0) return;
    
    let i = 1;
    for (const file of files) {
        statusDiv.innerHTML = `Processing image ${i}/${files.length}: ${file.name}`;
        const fileURL = URL.createObjectURL(file);
        
        try {
            const image = await IJS.Image.load(fileURL);
            URL.revokeObjectURL(fileURL);
            
            // For the last image, update the canvas previews
            if (i === files.length) {
                await init(image, file.name);
            }
            
            const rects = run(image);
            
            processedImages.push({
                name: file.name,
                width: image.width,
                height: image.height,
                rects: rects,
            });

        } catch (err) {
            error.innerHTML += `Failed to process ${file.name}: "${err}"<br>`;
        }
        i++;
    }
    statusDiv.innerHTML = `Processed ${processedImages.length} of ${files.length} images. Ready to export.`;
}

function exportToROBLOX() {
    if (processedImages.length === 0) {
        alert("No images processed. Please select images and click 'Process!' first.");
        return null;
    }

	let output = rbxmxHeader;
    const partSpacing = 20; // 20 studs between parts

	processedImages.forEach((procImg, index) => {
        const position = { x: index * partSpacing, y: 0, z: 0 };
        const imageName = procImg.name.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize name
        output += generateImagePart(
            procImg.rects,
            imageName,
            procImg.width,
            procImg.height,
            position,
            enabletransparency.checked
        );
    });

	output += rbxmxFooter;
	return output;
}

// --- Event Listeners ---

fileupload.addEventListener("change", (event) => {
    lastFiles = event.target.files;
    statusDiv.innerHTML = `${lastFiles.length} file(s) selected. Adjust settings and click 'Process!'`;
    exportBtn.disabled = true;
});

processBtn.addEventListener("click", async () => {
    if (lastFiles.length === 0) {
        alert("Please select images first.");
        return;
    }
    exportBtn.disabled = true;
    processBtn.disabled = true;
    processBtn.textContent = "Processing...";

    await processFiles(lastFiles);

    if(processedImages.length > 0) {
        exportBtn.disabled = false;
    }
    processBtn.disabled = false;
    processBtn.textContent = "Process!";
});

exportBtn.addEventListener("click", () => {
	const output = exportToROBLOX();
    if (!output) return;

	const file = new Blob([output], { type: "text/plain" });

    let downloadName = 'batch_export.rbxmx';
    if (lastFiles.length > 0) {
        const baseName = lastFiles[0].name.substring(0, lastFiles[0].name.lastIndexOf('.')) || 'image';
        downloadName = lastFiles.length === 1 ? `${baseName}.rbxmx` : `${baseName}_and_${lastFiles.length-1}_others.rbxmx`;
    }

	const a = document.createElement("a");
	a.download = downloadName;
	a.href = window.URL.createObjectURL(file);
	a.click();
	a.remove();
});

threshold.addEventListener("input", () => {
    setDebugText("threshold", threshold.value);
    if (threshold.value < 1) {
        document.querySelector("#thresholdwarning").innerHTML = "note: a threshold of zero removes the block <br> compression entirely, instead directly <br> copying the pixels. use with caution! <br>";
    } else {
        document.querySelector("#thresholdwarning").innerHTML = "";
    }
});

extreme.addEventListener("click", () => {
	if (extreme.checked == true) {
		threshold.max = 100000;
	} else {
		threshold.max = 1000;
	}
});

window.onload = () => {
	threshold.value = 50;
	extreme.checked = false;
	enabletransparency.checked = false;
	setDebugText("threshold", threshold.value);
};
