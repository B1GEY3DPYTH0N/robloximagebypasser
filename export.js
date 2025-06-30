/* export.js – Fixed UDim2 tags, correct CanvasSize, safe transparency */

let ref = 0;
const newRef = () => `RBX${(++ref).toString(16)}`;

/* helpers ------------------------------------------------------------- */
const udim2 = (xs, xo, ys, yo) => `
        <UDim2>
            <XS>${xs}</XS><XO>${xo}</XO>
            <YS>${ys}</YS><YO>${yo}</YO>
        </UDim2>`;

const color3 = (r, g, b) => `${(r / 255).toFixed(6)} ${(g / 255).toFixed(6)} ${(b / 255).toFixed(6)}`;

/* One rectangle -> Frame ---------------------------------------------- */
const frameBlock = (blk) => {
  const [r, g, b, a = 255] = blk.color;           // default alpha 255
  const transp = (255 - a) / 255;                 // 0 = opaque, 1 = invisible

  return `
      <Item class="Frame" referent="${newRef()}">
        <Properties>
          <bool    name="Active">true</bool>
          <Color3  name="BackgroundColor3">${color3(r, g, b)}</Color3>
          <Number  name="BackgroundTransparency">${transp}</Number>
          <UDim2   name="Position">${udim2(0, blk.rect.x, 0, blk.rect.y)}</UDim2>
          <UDim2   name="Size">${udim2(0, blk.rect.width, 0, blk.rect.height)}</UDim2>
        </Properties>
      </Item>`;
};

/* One picture -> Part ▸ SurfaceGui ------------------------------------ */
const pictureBlock = ({ rectangles, width, height, name }, keepTransparency) => {
  const partRef    = newRef();
  const guiRef     = newRef();
  const cleanName  = name.replace(/\.[^.]+$/, ""); // strip extension

  return `
  <Item class="Part" referent="${partRef}">
    <Properties>
      <string  name="Name">${cleanName}_Part</string>
      <bool    name="Anchored">true</bool>
      <Vector3 name="Size">4 4 0.2</Vector3>
    </Properties>

    <Item class="SurfaceGui" referent="${guiRef}">
      <Properties>
        <string name="Name">${cleanName}</string>
        <bool   name="Active">true</bool>
        <Vector2 name="CanvasSize">${width} ${height}</Vector2>
      </Properties>
${rectangles.map(r =>
     frameBlock(keepTransparency ? r : { ...r, color: [...r.color.slice(0, 3), 255] })
   ).join("")}
    </Item>
  </Item>`;
};

/* Public: build ONE valid .rbxmx -------------------------------------- */
export const buildCombinedRbxm = (images, { keepTransparency = true } = {}) => {
  ref = 0;  // reset referent counter each export

  const header = `<?xml version="1.0" encoding="utf-8"?>
<roblox version="4">
  <Meta name="ExplicitAutoJoints">true</Meta>`;
  const footer = `\n</roblox>`;

  return (
    header +
    images.map(img => pictureBlock(img, keepTransparency)).join("") +
    footer
  );
};
