import Root from "./electric-waveform.svelte";

export {
	type ElectricWaveformActions,
	type ElectricWaveformProps,
} from "./electric-waveform.svelte";
export {
	createElectricTrace,
	type ElectricBranch,
	type ElectricTrace,
	type ElectricTraceGeometry,
	type ElectricTraceOptions,
	type ElectricWaveformMode,
} from "./electric-waveform-utils.js";

export {
	Root,
	//
	Root as ElectricWaveform,
};
