/* export.js – XML-only, multi-image, single-file exporter ****************/

let refCounter = 0;
const newRef   = () => `RBX${refCounter++}`;

/* UDim2 helper --------------------------------------------------------- */
const udim2 = (xs, ys, xp = 0, yp = 0) => `
        <UDim2>
            <XS>${xs}</XS><YS>${ys}</YS>
            <XP>${xp}</XP><YP>${yp}</YP>
        </UDim2>`;

/* One <Frame> block ---------------------------------------------------- */
export const frameXML = (blk, w, h, offset) => `
            <Item class="Frame" referent="${newRef()}">
              <Properties>
                <bool name="Active">true</bool>
                <Color3 name="BackgroundColor3">${blk.color[0]/255} ${blk.color[1]/255} ${blk.color[2]/255}</Color3>
                <Number name="BackgroundTransparency">${(255 - blk.color[3]) / 255}</Number>
                <UDim2 name="Position">${udim2(blk.rect.x / w, 0, blk.rect.y / h, 0)}</UDim2>
                <UDim2 name="Size">${udim2(
                   blk.rect.width  / w + offset,
                   blk.rect.height / h + offset
                 )}</UDim2>
              </Properties>
            </Item>`;

/* Wrap one picture in Part▸SurfaceGui ---------------------------------- */
const pictureXML = ({ rectangles, width, height, name }, opts) => {
  const partRef    = newRef();
  const surfaceRef = newRef();
  const cleanName  = name.replace(/\.[^.]+$/, "");

  return `
  <Item class="Part" referent="${partRef}">
    <Properties>
      <string name="Name">${cleanName}_Part</string>
      <bool   name="Anchored">true</bool>
      <Vector3 name="Size">4 4 0.2</Vector3>
    </Properties>

    <Item class="SurfaceGui" referent="${surfaceRef}">
      <Properties>
        <string name="Name">${cleanName}</string>
        <bool   name="Active">true</bool>
        <UDim2  name="CanvasSize">${udim2(width, height)}</UDim2>
      </Properties>
${rectangles.map(b => frameXML(
      opts.keepTransparency ? b : { ...b, color: [...b.color.slice(0,3),255] },
      width,
      height,
      opts.imageOffset
)).join("")}
    </Item>
  </Item>`;
};

/* Public: build ONE valid .rbxmx for ANY number of images -------------- */
export const buildCombinedRbxm = (pictures, {
  imageOffset       = 0.05,
  keepTransparency  = true
} = {}) => {
  refCounter = 0;                                // reset for each build
  const header = `<?xml version="1.0" encoding="utf-8"?>
<roblox version="4">
  <Meta name="ExplicitAutoJoints">true</Meta>`;
  const footer = `</roblox>`;

  return (
    header +
    pictures.map(p => pictureXML(p, { imageOffset, keepTransparency })).join("") +
    footer
  );
};
