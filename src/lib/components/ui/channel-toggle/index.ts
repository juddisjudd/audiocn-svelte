import Root from "./channel-toggle.svelte";
import Monitor from "./monitor-toggle.svelte";
import Mute from "./mute-toggle.svelte";
import Solo from "./solo-toggle.svelte";

export {
	channelToggleVariants,
	type ChannelToggleProps,
	type ChannelTogglePresetProps,
	type ChannelToggleSize,
	type ChannelToggleTone,
	type ChannelToggleVariant,
} from "./channel-toggle.svelte";

export {
	Root,
	Mute,
	Solo,
	Monitor,
	//
	Root as ChannelToggle,
	Mute as MuteToggle,
	Solo as SoloToggle,
	Monitor as MonitorToggle,
};
