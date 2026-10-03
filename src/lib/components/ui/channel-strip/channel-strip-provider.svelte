<script lang="ts">
	import type { Snippet } from "svelte";

	import type { Orientation } from "#lib/audio/types.js";
	import { type AudioSize, setAudioConfig } from "#lib/hooks/use-audio-config.svelte.js";
	import { setChannelStripContext } from "./channel-strip-context.svelte.js";

	let {
		orientation,
		size,
		disabled,
		muted,
		solo,
		dimmed,
		titleId,
		children,
	}: {
		orientation: Orientation;
		size: AudioSize;
		disabled: boolean;
		muted: boolean;
		solo: boolean;
		dimmed: boolean;
		titleId: string;
		children: Snippet;
	} = $props();

	setChannelStripContext({
		get dimmed() {
			return dimmed;
		},
		get muted() {
			return muted;
		},
		get orientation() {
			return orientation;
		},
		get solo() {
			return solo;
		},
		get titleId() {
			return titleId;
		},
	});

	setAudioConfig(() => ({ dimmed: muted || dimmed, disabled, orientation, size }));
</script>

{@render children()}
