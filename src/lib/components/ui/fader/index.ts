import Root from "./fader.svelte";
import Label from "./fader-label.svelte";
import Range from "./fader-range.svelte";
import Reset from "./fader-reset.svelte";
import Scale from "./fader-scale.svelte";
import Thumb from "./fader-thumb.svelte";
import Track from "./fader-track.svelte";
import Value from "./fader-value.svelte";

export { faderVariants, type FaderProps, type FaderSize } from "./fader.svelte";
export { type FaderLabelProps } from "./fader-label.svelte";
export { type FaderRangeProps } from "./fader-range.svelte";
export { type FaderResetProps } from "./fader-reset.svelte";
export { type FaderScaleProps } from "./fader-scale.svelte";
export { type FaderThumbProps } from "./fader-thumb.svelte";
export { type FaderTrackProps } from "./fader-track.svelte";
export { type FaderValueProps } from "./fader-value.svelte";
export type { FaderChangeDetails, FaderChangeReason, FaderVariant } from "./fader-utils.js";

export {
	Root,
	Label,
	Track,
	Range,
	Thumb,
	Scale,
	Value,
	Reset,
	//
	Root as Fader,
	Label as FaderLabel,
	Track as FaderTrack,
	Range as FaderRange,
	Thumb as FaderThumb,
	Scale as FaderScale,
	Value as FaderValue,
	Reset as FaderReset,
};
