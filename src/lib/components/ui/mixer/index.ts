import Root from "./mixer.svelte";
import Actions from "./mixer-actions.svelte";
import Channels from "./mixer-channels.svelte";
import Empty from "./mixer-empty.svelte";
import Header from "./mixer-header.svelte";
import Master from "./mixer-master.svelte";
import Separator from "./mixer-separator.svelte";
import Title from "./mixer-title.svelte";

export { type MixerProps } from "./mixer.svelte";
export { type MixerChannelsProps } from "./mixer-channels.svelte";
export { useMixerContext, type MixerContextValue } from "./mixer-context.svelte.js";

export {
	Root,
	Header,
	Title,
	Actions,
	Channels,
	Separator,
	Master,
	Empty,
	//
	Root as Mixer,
	Header as MixerHeader,
	Title as MixerTitle,
	Actions as MixerActions,
	Channels as MixerChannels,
	Separator as MixerSeparator,
	Master as MixerMaster,
	Empty as MixerEmpty,
};
