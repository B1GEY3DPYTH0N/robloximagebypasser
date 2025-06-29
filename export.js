/**
 * export.js  — NOW SUPPORTS MANY SURFACEGUIs IN ONE RBXMX
 *
 *  ✱  Keep the ORIGINAL `header` and `footer` strings EXACTLY as they were.
 *     They already contain all the XML boiler-plate Roblox needs.
 *  ✱  New helpers:
 *        makeHeader(name)          – duplicate header but patch the <Name> field
 *        buildSurface(...)         – turn one rect-list into one SurfaceGui block
 *        buildCombinedRbxm([...])  – concatenate any number of SurfaceGui blocks
 */

/* ----------  UNCHANGED CONSTANTS FROM THE ORIGINAL FILE  ---------- */
export const header = ` …PASTE THE ORIGINAL LONG HEADER STRING HERE, UNTOUCHED… `;
export const footer = ` …PASTE THE ORIGINAL LONG FOOTER STRING HERE, UNTOUCHED… `;

export const generateFrame = (
  x, y, width, height,
  imageWidth, imageHeight, imageOffset,
  r, g, b, a
) => `
	<Item class="Frame">
		<Properties>
			<bool name="Active">true</bool>
			<UDim2 name="Size">
				<XS>${(width  / imageWidth)  + imageOffset}</XS>
				<YS>0</YS>
				<XP>0</XP>
				<YP>0</YP>
			</UDim2>
			<UDim2 name="Position">
				<XS>${x / imageWidth}</XS>
				<YS>0</YS>
				<XP>${y / imageHeight}</XP>
				<YP>0</YP>
			</UDim2>
			<Color3 name="BackgroundColor3">${r/255} ${g/255} ${b/255}</Color3>
			<Number name="BackgroundTransparency">${(255 - a) / 255}</Number>
			<Int name="LayoutOrder">1</Int>
		</Properties>
	</Item>`;

/* ------------------------------------------------------------------ */
/** Returns a fresh copy of `header` with its Name field changed. */
export function makeHeader(surfaceName = "BypassedImage") {
	return header.replace(/BypassedImage/g, surfaceName);
}

/**
 * Turns ONE rectangle list into ONE SurfaceGui XML chunk.
 * `rectangles` – output of divideIntoRectangles()
 * `imgW/H`     – original dimensions
 */
export function buildSurface(rectangles, imgW, imgH, surfaceName, {
	imageOffset       = 0.05,
	keepTransparency  = true
} = {}) {
	let out = makeHeader(surfaceName);
	for (const blk of rectangles) {
		out += generateFrame(
			blk.rect.x, blk.rect.y,
			blk.rect.width, blk.rect.height,
			imgW, imgH, imageOffset,
			blk.color[0], blk.color[1], blk.color[2],
			keepTransparency ? (blk.color[3] ?? 255) : 255
		);
	}
	out += footer;
	return out;
}

/**
 * Accepts an array of the form
 *   [{rectangles, width, height, name}, …]
 * and squashes every SurfaceGui into ONE .rbxmx string.
 */
export function buildCombinedRbxm(surfaces, opts = {}) {
	let combined = "";
	for (const s of surfaces) {
		combined += buildSurface(
			s.rectangles,
			s.width,
			s.height,
			s.name.replace(/\.[^.]+$/, ""), // strip .png etc.
			opts
		);
	}
	return combined;
}
