<script lang="ts" module>
	import type { Snippet } from "svelte";

	import type { ChannelStripStatusTone } from "#lib/components/ui/channel-strip/index.js";
	import type { Mixer } from "#lib/hooks/use-mixer.svelte.js";
	import type { FrameSource, MeterFrame } from "#lib/audio/types.js";

	export interface MixerSourceStripProps {
		id: string;
		title: string;
		description?: string;
		icon: Snippet;
		accent?: string;
		mixer: Mixer;
		meter: FrameSource<MeterFrame>;
		status?: { label: string; tone: ChannelStripStatusTone };
		/** Buttons in the header. */
		actions?: Snippet;
		/** A ChannelStripNotice, shown under the strip. */
		notice?: Snippet;
		/** Show the monitor toggle. Default true. */
		monitorable?: boolean;
		disabled?: boolean;
	}
</script>

<script lang="ts">
	import { HeadphonesIcon } from "phosphor-svelte";

	import {
		ChannelStrip,
		ChannelStripActions,
		ChannelStripControls,
		ChannelStripDescription,
		ChannelStripFader,
		ChannelStripHeader,
		ChannelStripIcon,
		ChannelStripMeter,
		ChannelStripStatus,
		ChannelStripText,
		ChannelStripTitle,
		ChannelStripValue,
	} from "#lib/components/ui/channel-strip/index.js";
	import {
		MonitorToggle,
		MuteToggle,
		SoloToggle,
	} from "#lib/components/ui/channel-toggle/index.js";
	import { Fader, FaderRange, FaderThumb, FaderTrack } from "#lib/components/ui/fader/index.js";
	import { LevelMeter } from "#lib/components/ui/level-meter/index.js";
	import { formatDb } from "#lib/audio/decibels.js";

	let {
		id,
		title,
		description,
		icon,
		accent,
		mixer,
		meter,
		status,
		actions,
		notice,
		monitorable = true,
		disabled = false,
	}: MixerSourceStripProps = $props();

	const channel = $derived(mixer.channel(id));
</script>

{#if channel}
	<ChannelStrip
		{accent}
		dimmed={mixer.isDimmed(id)}
		{disabled}
		muted={channel.muted}
		solo={channel.solo}
	>
		<ChannelStripHeader>
			<ChannelStripIcon>{@render icon()}</ChannelStripIcon>
			<ChannelStripText>
				<ChannelStripTitle>{title}</ChannelStripTitle>
				{#if description}
					<ChannelStripDescription>{description}</ChannelStripDescription>
				{/if}
			</ChannelStripText>
			{#if status}
				<ChannelStripStatus tone={status.tone}>
					{status.label}
				</ChannelStripStatus>
			{/if}
			{#if actions}
				<ChannelStripActions>{@render actions()}</ChannelStripActions>
			{/if}
		</ChannelStripHeader>
		<ChannelStripMeter>
			<LevelMeter
				aria-label={`${title} level`}
				channelCount={2}
				class="h-full"
				size="sm"
				source={meter}
			/>
		</ChannelStripMeter>
		<ChannelStripFader>
			<Fader
				aria-label={`${title} volume`}
				bind:value={() => channel.gainDb, (gainDb) => mixer.setGain(id, gainDb)}
				max={12}
				min={-60}
				silenceAtMin
				size="sm"
				taper="audio"
			>
				<FaderTrack>
					<FaderRange />
					<FaderThumb />
				</FaderTrack>
			</Fader>
		</ChannelStripFader>
		<ChannelStripValue>
			{formatDb(channel.gainDb, { floorDb: -60 })}
		</ChannelStripValue>
		<ChannelStripControls>
			<MuteToggle
				aria-label={`Mute ${title}`}
				bind:pressed={() => channel.muted, (muted) => mixer.setMuted(id, muted)}
				size="sm"
			>
				M
			</MuteToggle>
			<SoloToggle
				aria-label={`Solo ${title}`}
				bind:pressed={() => channel.solo, (solo) => mixer.setSolo(id, solo)}
				size="sm"
			>
				S
			</SoloToggle>
			{#if monitorable}
				<MonitorToggle
					aria-label={`Monitor ${title}`}
					bind:pressed={() => channel.monitor, (monitor) => mixer.setMonitor(id, monitor)}
					size="sm"
				>
					<HeadphonesIcon />
				</MonitorToggle>
			{/if}
		</ChannelStripControls>
		{@render notice?.()}
	</ChannelStrip>
{/if}
