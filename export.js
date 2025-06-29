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
export const header = `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
	<Meta name="ExplicitAutoJoints">true</Meta>
	<External>null</External>
	<External>nil</External>
	<Item class="Part">
		<Properties>
			<bool name="Anchored">true</bool>
			<BinaryString name="AttributesSerialize"></BinaryString>
			<float name="BackParamA">-0.5</float>
			<float name="BackParamB">0.5</float>
			<token name="BackSurface">0</token>
			<token name="BackSurfaceInput">0</token>
			<float name="BottomParamA">-0.5</float>
			<float name="BottomParamB">0.5</float>
			<token name="BottomSurface">0</token>
			<token name="BottomSurfaceInput">0</token>
			<CoordinateFrame name="CFrame">
				<X>0</X>
				<Y>0</Y>
				<Z>0</Z>
				<R00>1</R00>
				<R01>0</R01>
				<R02>0</R02>
				<R10>0</R10>
				<R11>1</R11>
				<R12>0</R12>
				<R20>0</R20>
				<R21>0</R21>
				<R22>1</R22>
			</CoordinateFrame>
			<bool name="CanCollide">true</bool>
			<bool name="CanQuery">true</bool>
			<bool name="CanTouch">true</bool>
			<bool name="CastShadow">true</bool>
			<string name="CollisionGroup">Default</string>
			<int name="CollisionGroupId">0</int>
			<Color3uint8 name="Color3uint8">4294967295</Color3uint8>
			<PhysicalProperties name="CustomPhysicalProperties">
				<CustomPhysics>false</CustomPhysics>
			</PhysicalProperties>
			<float name="FrontParamA">-0.5</float>
			<float name="FrontParamB">0.5</float>
			<token name="FrontSurface">0</token>
			<token name="FrontSurfaceInput">0</token>
			<float name="LeftParamA">-0.5</float>
			<float name="LeftParamB">0.5</float>
			<token name="LeftSurface">0</token>
			<token name="LeftSurfaceInput">0</token>
			<bool name="Locked">false</bool>
			<bool name="Massless">false</bool>
			<token name="Material">256</token>
			<string name="MaterialVariantSerialized"></string>
			<string name="Name">BypassedImage</string>
			<CoordinateFrame name="PivotOffset">
				<X>0</X>
				<Y>0</Y>
				<Z>0</Z>
				<R00>1</R00>
				<R01>0</R01>
				<R02>0</R02>
				<R10>0</R10>
				<R11>1</R11>
				<R12>0</R12>
				<R20>0</R20>
				<R21>0</R21>
				<R22>1</R22>
			</CoordinateFrame>
			<float name="Reflectance">0</float>
			<float name="RightParamA">-0.5</float>
			<float name="RightParamB">0.5</float>
			<token name="RightSurface">0</token>
			<token name="RightSurfaceInput">0</token>
			<int name="RootPriority">0</int>
			<Vector3 name="RotVelocity">
				<X>0</X>
				<Y>0</Y>
				<Z>0</Z>
			</Vector3>
			<int64 name="SourceAssetId">-1</int64>
			<BinaryString name="Tags"></BinaryString>
			<float name="TopParamA">-0.5</float>
			<float name="TopParamB">0.5</float>
			<token name="TopSurface">0</token>
			<token name="TopSurfaceInput">0</token>
			<float name="Transparency">0</float>
			<Vector3 name="Velocity">
				<X>0</X>
				<Y>0</Y>
				<Z>0</Z>
			</Vector3>
			<token name="formFactorRaw">1</token>
			<token name="shape">1</token>
			<Vector3 name="size">
				<X>16</X>
				<Y>16</Y>
				<Z>1</Z>
			</Vector3>
		</Properties>
		<Item class="SurfaceGui">
			<Properties>
				<bool name="Active">true</bool>
				<Ref name="Adornee">null</Ref>
				<bool name="AlwaysOnTop">false</bool>
				<BinaryString name="AttributesSerialize"></BinaryString>
				<bool name="AutoLocalize">true</bool>
				<float name="Brightness">1</float>
				<Vector2 name="CanvasSize">
					<X>800</X>
					<Y>600</Y>
				</Vector2>
				<bool name="ClipsDescendants">true</bool>
				<bool name="Enabled">true</bool>
				<token name="Face">5</token>
				<float name="LightInfluence">1</float>
				<string name="Name">SurfaceGui</string>
				<float name="PixelsPerStud">50</float>
				<bool name="ResetOnSpawn">true</bool>
				<Ref name="RootLocalizationTable">null</Ref>
				<token name="SelectionBehaviorDown">0</token>
				<token name="SelectionBehaviorLeft">0</token>
				<token name="SelectionBehaviorRight">0</token>
				<token name="SelectionBehaviorUp">0</token>
				<bool name="SelectionGroup">false</bool>
				<token name="SizingMode">1</token>
				<int64 name="SourceAssetId">-1</int64>
				<BinaryString name="Tags"></BinaryString>
				<float name="ToolPunchThroughDistance">0</float>
				<token name="ZIndexBehavior">1</token>
				<float name="ZOffset">0</float>
			</Properties>
`;
export const footer = `
</Item>
	</Item>
</roblox>
`;

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
