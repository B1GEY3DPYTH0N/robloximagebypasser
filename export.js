/*  export.js – v2  */
/*  The fixed binary blob that Roblox expects.                     *
 *  The only part that must be unique per‑image is the SurfaceGui  *
 *  name ("BypassedImage" in the original tool).                   */
const RAW_HEADER =
  ` true null nil true -0.5 0.5 0 0 -0.5 0.5 0 0  0 0 0 1 0 0 0 1 0 0 0 1 true true true true Default 0 4294967295  false -0.5 0.5 0 0 -0.5 0.5 0 0 false false 256 {{NAME}}  0 0 0 1 0 0 0 1 0 0 0 1 0 -0.5 0.5 0 0 0  0 0 0 -1 -0.5 0.5 0 0 0  0 0 0 1 1  16 16 1 true null false true 1  800 600 true true 5 1 SurfaceGui 50 true null 0 0 0 0 false 1 -1 0 1 0 `;

/** Return a SurfaceGui header whose Name property equals `surfaceName`. */
export function generateHeader(surfaceName = "BypassedImage") {
  return RAW_HEADER.replace(/{{NAME}}/g, surfaceName);
}

/* Roblox XML fragments do not need any formal closing tag here, but the
 * legacy exporter kept an empty footer token. Keep it for parity. */
export const footer = `  `;

/** Build a single rectangular Frame. */
export function generateFrame(
  x,
  y,
  width,
  height,
  imagewidth,
  imageheight,
  imageoffset,
  r,
  g,
  b,
  a
) {
  return ` true  0 0 true 0  ${r / 255} ${g / 255} ${b / 255} ${(255 - a) / 255}  0.105882362 0.164705887 0.207843155 0 0 false false 0 Frame null null null null  ${x / imagewidth} 0 ${y / imageheight} 0 null 0 false 0 0 0 0 false null 0  ${(width / imagewidth) + imageoffset} 0 ${(height / imageheight) + imageoffset} 0 0 -1 0 true 1 `;
}
