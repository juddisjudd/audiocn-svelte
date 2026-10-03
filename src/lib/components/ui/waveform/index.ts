import Root from "./waveform.svelte";
import Canvas from "./waveform-canvas.svelte";
import Cursor from "./waveform-cursor.svelte";
import Hover from "./waveform-hover.svelte";
import Marker from "./waveform-marker.svelte";
import Region from "./waveform-region.svelte";

export { type WaveformProps } from "./waveform.svelte";
export { type WaveformCanvasProps } from "./waveform-canvas.svelte";
export { type WaveformCursorProps } from "./waveform-cursor.svelte";
export { type WaveformHoverProps } from "./waveform-hover.svelte";
export { type WaveformMarkerProps } from "./waveform-marker.svelte";
export { type WaveformRegionProps, type WaveformRegionValue } from "./waveform-region.svelte";
export { type WaveformVariant } from "./waveform-context.svelte.js";
export {
	Root,
	Canvas,
	Cursor,
	Hover,
	Region,
	Marker,
	//
	Root as Waveform,
	Canvas as WaveformCanvas,
	Cursor as WaveformCursor,
	Hover as WaveformHover,
	Region as WaveformRegion,
	Marker as WaveformMarker,
};
