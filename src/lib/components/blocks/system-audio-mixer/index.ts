import Root from "./system-audio-mixer.svelte";
import MasterStrip from "./mixer-master-strip.svelte";
import SourceStrip from "./mixer-source-strip.svelte";

export {
	type MixerSound,
	type MixerSourceId,
	type MixerTrack,
	type SystemAudioMixerProps,
} from "./system-audio-mixer.svelte";
export { type MixerMasterStripProps } from "./mixer-master-strip.svelte";
export { type MixerSourceStripProps } from "./mixer-source-strip.svelte";

export {
	Root,
	SourceStrip,
	MasterStrip,
	//
	Root as SystemAudioMixer,
	SourceStrip as MixerSourceStrip,
	MasterStrip as MixerMasterStrip,
};
