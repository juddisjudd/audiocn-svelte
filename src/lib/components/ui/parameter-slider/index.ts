import Root from "./parameter-slider.svelte";
import Control from "./parameter-slider-control.svelte";
import Description from "./parameter-slider-description.svelte";
import Header from "./parameter-slider-header.svelte";
import Input from "./parameter-slider-input.svelte";
import Label from "./parameter-slider-label.svelte";
import Marks from "./parameter-slider-marks.svelte";
import Reset from "./parameter-slider-reset.svelte";
import Value from "./parameter-slider-value.svelte";

export { type ParameterSliderProps } from "./parameter-slider.svelte";
export { type ParameterSliderControlProps } from "./parameter-slider-control.svelte";
export { type ParameterSliderDescriptionProps } from "./parameter-slider-description.svelte";
export { type ParameterSliderHeaderProps } from "./parameter-slider-header.svelte";
export { type ParameterSliderInputProps } from "./parameter-slider-input.svelte";
export { type ParameterSliderLabelProps } from "./parameter-slider-label.svelte";
export { type ParameterSliderMarksProps } from "./parameter-slider-marks.svelte";
export { type ParameterSliderResetProps } from "./parameter-slider-reset.svelte";
export { type ParameterSliderValueProps } from "./parameter-slider-value.svelte";
export type {
	ParameterChangeDetails,
	ParameterChangeReason,
	ParameterMark,
} from "./parameter-slider-utils.js";

export {
	Root,
	Header,
	Label,
	Input,
	Value,
	Reset,
	Control,
	Marks,
	Description,
	//
	Root as ParameterSlider,
	Header as ParameterSliderHeader,
	Label as ParameterSliderLabel,
	Input as ParameterSliderInput,
	Value as ParameterSliderValue,
	Reset as ParameterSliderReset,
	Control as ParameterSliderControl,
	Marks as ParameterSliderMarks,
	Description as ParameterSliderDescription,
};
