import { getContext, setContext } from "svelte";

import type { Orientation } from "#lib/audio/types.js";

export interface ChannelStripContextValue {
	readonly orientation: Orientation;
	readonly titleId: string;
	readonly muted: boolean;
	readonly solo: boolean;
	readonly dimmed: boolean;
}

const CHANNEL_STRIP_KEY = Symbol("audiocn.channel-strip");

export const setChannelStripContext = (value: ChannelStripContextValue): ChannelStripContextValue =>
	setContext(CHANNEL_STRIP_KEY, value);

export const getChannelStripContext = (part: string): ChannelStripContextValue => {
	const context = getContext<ChannelStripContextValue | undefined>(CHANNEL_STRIP_KEY);
	if (!context) {
		throw new Error(`${part} must be used inside ChannelStrip.`);
	}
	return context;
};

/** The state of the surrounding channel strip, for custom parts. */
export const useChannelStrip = (): ChannelStripContextValue =>
	getChannelStripContext("useChannelStrip");
