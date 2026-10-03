import Root from "./volume-control.svelte";
import Mute from "./volume-control-mute.svelte";
import Slider from "./volume-control-slider.svelte";
import Value from "./volume-control-value.svelte";

export { type VolumeControlProps } from "./volume-control.svelte";
export { type VolumeControlMuteProps } from "./volume-control-mute.svelte";
export { type VolumeControlSliderProps } from "./volume-control-slider.svelte";
export { type VolumeControlValueProps } from "./volume-control-value.svelte";
export type { VolumeCurve, VolumeLevel } from "./volume-control-utils.js";

export {
	Root,
	Mute,
	Slider,
	Value,
	//
	Root as VolumeControl,
	Mute as VolumeControlMute,
	Slider as VolumeControlSlider,
	Value as VolumeControlValue,
};
