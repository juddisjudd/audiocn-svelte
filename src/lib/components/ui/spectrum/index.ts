import Root from "./spectrum.svelte";
import Canvas from "./spectrum-canvas.svelte";
import FrequencyAxis from "./spectrum-frequency-axis.svelte";
import LevelAxis from "./spectrum-level-axis.svelte";

export { type SpectrumProps } from "./spectrum.svelte";
export { type SpectrumCanvasProps } from "./spectrum-canvas.svelte";
export { type SpectrumFrequencyAxisProps } from "./spectrum-frequency-axis.svelte";
export { type SpectrumLevelAxisProps } from "./spectrum-level-axis.svelte";
export { type SpectrumVariant } from "./spectrum-context.svelte.js";
export {
	Root,
	Canvas,
	FrequencyAxis,
	LevelAxis,
	//
	Root as Spectrum,
	Canvas as SpectrumCanvas,
	FrequencyAxis as SpectrumFrequencyAxis,
	LevelAxis as SpectrumLevelAxis,
};
