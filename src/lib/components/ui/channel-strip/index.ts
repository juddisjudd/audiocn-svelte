import Root from "./channel-strip.svelte";
import Actions from "./channel-strip-actions.svelte";
import Controls from "./channel-strip-controls.svelte";
import Description from "./channel-strip-description.svelte";
import Fader from "./channel-strip-fader.svelte";
import Header from "./channel-strip-header.svelte";
import Icon from "./channel-strip-icon.svelte";
import Meter from "./channel-strip-meter.svelte";
import Notice from "./channel-strip-notice.svelte";
import Status from "./channel-strip-status.svelte";
import Text from "./channel-strip-text.svelte";
import Title from "./channel-strip-title.svelte";
import Value from "./channel-strip-value.svelte";

export {
	channelStripVariants,
	channelStripLayoutVariants,
	type ChannelStripProps,
	type ChannelStripVariant,
} from "./channel-strip.svelte";
export {
	channelStripNoticeVariants,
	type ChannelStripNoticeProps,
	type ChannelStripNoticeVariant,
} from "./channel-strip-notice.svelte";
export {
	type ChannelStripStatusProps,
	type ChannelStripStatusTone,
} from "./channel-strip-status.svelte";
export {
	useChannelStrip,
	type ChannelStripContextValue,
} from "./channel-strip-context.svelte.js";

export {
	Root,
	Header,
	Icon,
	Title,
	Description,
	Text,
	Status,
	Actions,
	Meter,
	Fader,
	Value,
	Controls,
	Notice,
	//
	Root as ChannelStrip,
	Header as ChannelStripHeader,
	Icon as ChannelStripIcon,
	Title as ChannelStripTitle,
	Description as ChannelStripDescription,
	Text as ChannelStripText,
	Status as ChannelStripStatus,
	Actions as ChannelStripActions,
	Meter as ChannelStripMeter,
	Fader as ChannelStripFader,
	Value as ChannelStripValue,
	Controls as ChannelStripControls,
	Notice as ChannelStripNotice,
};
