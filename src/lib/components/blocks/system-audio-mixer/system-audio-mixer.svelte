<script lang="ts" module>
	import type { ChannelStripStatusTone } from "#lib/components/ui/channel-strip/index.js";
	import type { UseSystemAudioResult } from "#lib/hooks/use-system-audio.svelte.js";
	import type { Orientation } from "#lib/audio/types.js";

	export type MixerSourceId = "microphone" | "system" | "music" | "sounds";

	export interface MixerTrack {
		id: string;
		title: string;
		artist?: string;
		src: string;
	}

	export interface MixerSound {
		id: string;
		label: string;
		src: string | AudioBuffer;
		hotkey?: string;
		accent?: string;
	}

	export interface SystemAudioMixerProps {
		/** Rows or console strips. Default `horizontal`. */
		orientation?: Orientation;
		onOrientationChange?: (orientation: Orientation) => void;
		/** Which sources to show. Default all four. */
		sources?: MixerSourceId[];
		/** Save mixer settings to localStorage under this key. */
		persistKey?: string;
		/** The mixed output, for recording or streaming. */
		onOutputChange?: (stream: MediaStream | null) => void;
		/** Tracks for the music channel. */
		tracks?: MixerTrack[];
		/** Sounds for the sounds channel. */
		sounds?: MixerSound[];
		class?: string;
	}

	const ALL_SOURCES: MixerSourceId[] = ["microphone", "system", "music", "sounds"];

	const NO_TRACKS: MixerTrack[] = [];
	const NO_SOUNDS: MixerSound[] = [];

	const CHANNELS = [
		{ id: "microphone" },
		{ gainDb: -6, id: "system" },
		{ gainDb: -12, id: "music", monitor: true },
		{ gainDb: -6, id: "sounds", monitor: true },
	];

	const systemStatus = (
		system: UseSystemAudioResult
	): { label: string; tone: ChannelStripStatusTone } => {
		if (system.status === "active") {
			return { label: "On", tone: "live" };
		}
		if (system.status === "unsupported") {
			return { label: "Unsupported", tone: "warning" };
		}
		return { label: "Off", tone: "default" };
	};
</script>

<script lang="ts">
	import { untrack } from "svelte";
	import {
		ArrowCounterClockwiseIcon,
		DesktopIcon,
		MusicNotesIcon,
		PauseIcon,
		PlayIcon,
		SkipForwardIcon,
		SquaresFourIcon,
		WaveformIcon,
	} from "phosphor-svelte";

	import { Button } from "#lib/components/ui/button/index.js";
	import { ChannelStripNotice } from "#lib/components/ui/channel-strip/index.js";
	import {
		Mixer,
		MixerActions,
		MixerChannels,
		MixerEmpty,
		MixerHeader,
		MixerMaster,
		MixerSeparator,
		MixerTitle,
	} from "#lib/components/ui/mixer/index.js";
	import { Popover, PopoverContent, PopoverTrigger } from "#lib/components/ui/popover/index.js";
	import { SoundPadGrid } from "#lib/components/ui/sound-pad/index.js";
	import { Switch } from "#lib/components/ui/switch/index.js";
	import { Tabs, TabsList, TabsTrigger } from "#lib/components/ui/tabs/index.js";
	import { useAudioPlayer } from "#lib/hooks/use-audio-player.svelte.js";
	import { useGainNode } from "#lib/hooks/use-gain-node.svelte.js";
	import { useMicrophone } from "#lib/hooks/use-microphone.svelte.js";
	import { useMixer } from "#lib/hooks/use-mixer.svelte.js";
	import { useSystemAudio } from "#lib/hooks/use-system-audio.svelte.js";
	import { useWebAudioMixer } from "#lib/hooks/use-web-audio-mixer.svelte.js";
	import { cn } from "#lib/utils.js";
	import MixerMasterStrip from "./mixer-master-strip.svelte";
	import MixerMicrophoneChannel from "./mixer-microphone-channel.svelte";
	import MixerPad from "./mixer-pad.svelte";
	import MixerSourceStrip from "./mixer-source-strip.svelte";

	let {
		orientation = $bindable("horizontal"),
		onOrientationChange,
		sources = ALL_SOURCES,
		persistKey,
		onOutputChange,
		tracks = NO_TRACKS,
		sounds = NO_SOUNDS,
		class: className,
	}: SystemAudioMixerProps = $props();

	const mixer = useMixer(() => ({ channels: CHANNELS, persistKey }));

	let deviceId = $state<string | null>(null);
	const microphone = useMicrophone(() => ({ deviceId }));
	const system = useSystemAudio();

	let trackIndex = $state(0);
	const track = $derived(tracks[trackIndex]);
	const nextTrack = () => {
		trackIndex = tracks.length > 0 ? (trackIndex + 1) % tracks.length : 0;
	};
	const player = useAudioPlayer(() => ({ onEnded: nextTrack, src: track?.src }));

	// Sound pads play into one bus so the mixer sees them as a single source.
	const soundBus = useGainNode({ destination: null });

	const graph = useWebAudioMixer(mixer, () => ({
		ducking: { targets: ["music"], trigger: "microphone" },
		inputs: {
			microphone: microphone.stream,
			music: player.element,
			sounds: soundBus,
			system: system.stream,
		},
	}));

	// Fires when the stream changes, not when the callback does.
	$effect(() => {
		const output = graph.output;
		untrack(() => onOutputChange?.(output));
	});

	const show = (id: MixerSourceId) => sources.includes(id);
	const meterFor = (id: MixerSourceId) => graph.meters[id] ?? graph.master.meter;

	const setOrientation = (next: string) => {
		orientation = next as Orientation;
		onOrientationChange?.(orientation);
	};

	const systemActive = $derived(system.status === "active");
</script>

{#snippet systemIcon()}
	<DesktopIcon />
{/snippet}

{#snippet systemActions()}
	<Switch
		aria-label="Capture system audio"
		bind:checked={() => systemActive, (checked) => (checked ? system.start() : system.stop())}
		disabled={!system.isSupported}
		size="sm"
	/>
{/snippet}

{#snippet systemNotice()}
	<ChannelStripNotice variant="warning">
		Nothing to hear: tick "Share audio" in the browser's picker.
	</ChannelStripNotice>
{/snippet}

{#snippet musicIcon()}
	<MusicNotesIcon />
{/snippet}

{#snippet musicActions()}
	<Button
		aria-label={player.playing ? "Pause music" : "Play music"}
		disabled={!track}
		onclick={() => player.toggle()}
		size="icon-xs"
		variant="ghost"
	>
		{#if player.playing}
			<PauseIcon />
		{:else}
			<PlayIcon />
		{/if}
	</Button>
	<Button
		aria-label="Next track"
		disabled={tracks.length < 2}
		onclick={nextTrack}
		size="icon-xs"
		variant="ghost"
	>
		<SkipForwardIcon />
	</Button>
{/snippet}

{#snippet soundsIcon()}
	<WaveformIcon />
{/snippet}

{#snippet soundsActions()}
	<Popover>
		<PopoverTrigger>
			{#snippet child({ props })}
				<Button
					{...props}
					aria-label="Sound pads"
					disabled={sounds.length === 0}
					size="icon-xs"
					variant="ghost"
				>
					<SquaresFourIcon />
				</Button>
			{/snippet}
		</PopoverTrigger>
		<PopoverContent class="w-80">
			<SoundPadGrid class="[--pad-min-width:4rem]" columns={4} hotkeys>
				{#each sounds as sound (sound.id)}
					<MixerPad bus={soundBus} {sound} />
				{/each}
			</SoundPadGrid>
		</PopoverContent>
	</Popover>
{/snippet}

<Mixer class={cn("[--channel-strip-header-width:16rem]", className)} {orientation}>
	<MixerHeader>
		<MixerTitle>Audio mixer</MixerTitle>
		<MixerActions>
			<Tabs bind:value={() => orientation, setOrientation}>
				<TabsList>
					<TabsTrigger value="horizontal">Rows</TabsTrigger>
					<TabsTrigger value="vertical">Console</TabsTrigger>
				</TabsList>
			</Tabs>
			<Button aria-label="Reset mixer" onclick={() => mixer.reset()} size="icon-sm" variant="ghost">
				<ArrowCounterClockwiseIcon />
			</Button>
		</MixerActions>
	</MixerHeader>
	<MixerChannels>
		{#if show("microphone")}
			<MixerMicrophoneChannel
				{deviceId}
				meter={meterFor("microphone")}
				{microphone}
				{mixer}
				onDeviceChange={(next) => (deviceId = next)}
			/>
		{/if}
		{#if show("system")}
			<MixerSourceStrip
				accent="var(--chart-4)"
				actions={systemActions}
				description={systemActive ? "Capturing" : "Share a screen or tab with audio"}
				icon={systemIcon}
				id="system"
				meter={meterFor("system")}
				{mixer}
				monitorable={false}
				notice={system.status === "no-audio" ? systemNotice : undefined}
				status={systemStatus(system)}
				title="System audio"
			/>
		{/if}
		{#if show("music")}
			<MixerSourceStrip
				accent="var(--chart-1)"
				actions={musicActions}
				description={track ? track.title : "No tracks"}
				icon={musicIcon}
				id="music"
				meter={meterFor("music")}
				{mixer}
				status={player.playing ? { label: "Playing", tone: "live" } : undefined}
				title="Music"
			/>
		{/if}
		{#if show("sounds")}
			<MixerSourceStrip
				accent="var(--chart-3)"
				actions={soundsActions}
				description={`${sounds.length} pads`}
				icon={soundsIcon}
				id="sounds"
				meter={meterFor("sounds")}
				{mixer}
				title="Sounds"
			/>
		{/if}
	</MixerChannels>
	<MixerEmpty>No audio sources.</MixerEmpty>
	<MixerSeparator />
	<MixerMaster>
		<MixerMasterStrip meter={graph.master.meter} {mixer} />
	</MixerMaster>
</Mixer>
