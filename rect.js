/* rect.js  —  UN-MODULE'D VERSION */
function divideIntoRectangles(pixels, threshold) {
  // pixels is a 2-D array of [r,g,b,a]; threshold 0-255
  const w = pixels.length;
  const h = pixels[0].length;
  const rects = [];

  const used = Array.from({ length: w }, () =>
    Array(h).fill(false)
  );

  function same(c1, c2) {
    const d =
      Math.abs(c1[0] - c2[0]) +
      Math.abs(c1[1] - c2[1]) +
      Math.abs(c1[2] - c2[2]) +
      Math.abs(c1[3] - c2[3]);
    return d <= threshold * 4; // quick + cheap
  }

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      if (used[x][y]) continue;
      const col = pixels[x][y];

      // grow right
      let maxW = 1;
      while (
        x + maxW < w &&
        !used[x + maxW][y] &&
        same(col, pixels[x + maxW][y])
      )
        maxW++;

      // grow down with same colour row-by-row
      let maxH = 1;
      outer: while (y + maxH < h) {
        for (let xx = 0; xx < maxW; xx++)
          if (
            used[x + xx][y + maxH] ||
            !same(col, pixels[x + xx][y + maxH])
          )
            break outer;
        maxH++;
      }

      // mark used & store rect
      for (let xx = 0; xx < maxW; xx++)
        for (let yy = 0; yy < maxH; yy++)
          used[x + xx][y + yy] = true;

      rects.push({ rect: { x, y, width: maxW, height: maxH }, color: col });
    }
  }
  return rects;
}
window.divideIntoRectangles = divideIntoRectangles; // make global
