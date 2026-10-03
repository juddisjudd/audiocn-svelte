<script lang="ts" module>
	import type { FrameSource, MeterFrame } from "#lib/audio/types.js";

	export interface MusicTrack {
		id: string;
		title: string;
		artist?: string;
		src: string;
		artwork?: string;
		/** Seconds, shown before the file loads. */
		duration?: number;
	}

	export interface MusicPlayerProps {
		tracks?: MusicTrack[];
		defaultTracks?: MusicTrack[];
		onTrackChange?: (track: MusicTrack) => void;
		/** A level source, usually the microphone, that ducks the music. */
		duckingSource?: FrameSource<MeterFrame> | null;
		/** Route the music into a mixer instead of the speakers. */
		output?: AudioNode | null;
		class?: string;
	}

	type Repeat = "off" | "all" | "one";

	const NO_TRACKS: MusicTrack[] = [];
	const DUCK_THRESHOLD_DB = -35;
	const DUCK_ATTACK = 0.02;
	const DUCK_RELEASE = 0.15;
	/** How long a duck holds after the last loud frame before it lets go. */
	const DUCK_HOLD = 0.2;

	const nextRepeat: Record<Repeat, Repeat> = {
		all: "one",
		off: "all",
		one: "off",
	};
</script>

<script lang="ts">
	import MusicNotesIcon from "phosphor-svelte/lib/MusicNotesIcon";
	import PauseIcon from "phosphor-svelte/lib/PauseIcon";
	import PlayIcon from "phosphor-svelte/lib/PlayIcon";
	import RepeatIcon from "phosphor-svelte/lib/RepeatIcon";
	import RepeatOnceIcon from "phosphor-svelte/lib/RepeatOnceIcon";
	import ShuffleIcon from "phosphor-svelte/lib/ShuffleIcon";
	import SkipBackIcon from "phosphor-svelte/lib/SkipBackIcon";
	import SkipForwardIcon from "phosphor-svelte/lib/SkipForwardIcon";
	import SpeakerHighIcon from "phosphor-svelte/lib/SpeakerHighIcon";
	import SpeakerXIcon from "phosphor-svelte/lib/SpeakerXIcon";

	import {
		AudioPlayer,
		AudioPlayerArtwork,
		AudioPlayerControls,
		AudioPlayerDescription,
		AudioPlayerNext,
		AudioPlayerPlay,
		AudioPlayerPrevious,
		AudioPlayerTime,
		AudioPlayerTitle,
		AudioPlayerVolume,
	} from "#lib/components/ui/audio-player/index.js";
	import { Card, CardContent } from "#lib/components/ui/card/index.js";
	import {
		Empty,
		EmptyDescription,
		EmptyHeader,
		EmptyMedia,
		EmptyTitle,
	} from "#lib/components/ui/empty/index.js";
	import { Label } from "#lib/components/ui/label/index.js";
	import {
		ParameterSlider,
		ParameterSliderControl,
		ParameterSliderHeader,
		ParameterSliderLabel,
		ParameterSliderValue,
	} from "#lib/components/ui/parameter-slider/index.js";
	import { Switch } from "#lib/components/ui/switch/index.js";
	import { Toggle } from "#lib/components/ui/toggle/index.js";
	import {
		TrackList,
		TrackListItem,
		TrackListItemContent,
		TrackListItemDescription,
		TrackListItemDuration,
		TrackListItemIndex,
		TrackListItemTitle,
	} from "#lib/components/ui/track-list/index.js";
	import {
		VolumeControlMute,
		VolumeControlSlider,
	} from "#lib/components/ui/volume-control/index.js";
	import {
		Waveform,
		WaveformCanvas,
		WaveformCursor,
		WaveformHover,
	} from "#lib/components/ui/waveform/index.js";
	import { getMediaElementSource } from "#lib/hooks/use-audio-analyser.svelte.js";
	import { useAudioContext } from "#lib/hooks/use-audio-context.svelte.js";
	import { useAudioPlayer } from "#lib/hooks/use-audio-player.svelte.js";
	import { useFrameSource } from "#lib/hooks/use-frame-source.svelte.js";
	import { useWaveformData } from "#lib/hooks/use-waveform-data.svelte.js";
	import { dbToGain } from "#lib/audio/decibels.js";
	import { formatTime } from "#lib/audio/time.js";

	let {
		tracks: tracksProp,
		defaultTracks = NO_TRACKS,
		onTrackChange,
		duckingSource,
		output,
		class: className,
	}: MusicPlayerProps = $props();

	const tracks = $derived(tracksProp ?? defaultTracks);
	const duckingId = $props.id();
	let index = $state(0);
	let shuffle = $state(false);
	let repeat = $state<Repeat>("all");
	let ducking = $state(true);
	// Once the listener has played or picked a track, later tracks play on
	// their own, including after repeat-all wraps back to the first.
	let autoAdvance = $state(false);
	let duckAmountDb = $state(-12);
	const track = $derived<MusicTrack | undefined>(tracks[index]);

	const go = (direction: number) => {
		if (tracks.length === 0) {
			return;
		}
		let next = (index + direction + tracks.length) % tracks.length;
		if (shuffle && tracks.length > 1) {
			next = (index + 1 + Math.floor(Math.random() * (tracks.length - 1))) % tracks.length;
		}
		index = next;
		autoAdvance = true;
		const nextTrack = tracks[next];
		if (nextTrack) {
			onTrackChange?.(nextTrack);
		}
	};

	const player = useAudioPlayer(() => ({
		autoPlay: autoAdvance,
		loop: repeat === "one",
		onEnded: () => {
			if (repeat === "all" || index < tracks.length - 1) {
				go(1);
			}
		},
		src: track?.src,
	}));
	const waveform = useWaveformData(() => track?.src ?? null, { samples: 400 });

	const { context } = useAudioContext();
	const duckGain = context?.createGain() ?? null;
	const routed = $derived(output !== undefined || duckingSource !== undefined);

	$effect(() => {
		const { element } = player;
		if (!(context && duckGain && element && routed)) {
			return;
		}
		const source = getMediaElementSource(context, element);
		try {
			source.disconnect(context.destination);
		} catch {
			// Not connected to the speakers.
		}
		source.connect(duckGain);
		const target = output === undefined ? context.destination : output;
		if (target) {
			duckGain.connect(target);
		}
		return () => {
			source.disconnect(duckGain);
			if (target) {
				duckGain.disconnect(target);
			}
			source.connect(context.destination);
		};
	});

	useFrameSource(
		() => duckingSource,
		(frame) => {
			if (!(duckGain && context)) {
				return;
			}
			let loudest = Number.NEGATIVE_INFINITY;
			for (const level of frame.channels) {
				loudest = Math.max(loudest, level.peakDb);
			}
			if (!(ducking && loudest >= DUCK_THRESHOLD_DB)) {
				return;
			}
			// Each loud frame ducks and schedules its own release, so the music
			// comes back when the voice goes quiet or its frames stop arriving
			// (the mic is turned off, ducking is switched off).
			const now = context.currentTime;
			const { gain } = duckGain;
			gain.cancelScheduledValues(now);
			gain.setTargetAtTime(dbToGain(duckAmountDb), now, DUCK_ATTACK);
			gain.setTargetAtTime(1, now + DUCK_HOLD, DUCK_RELEASE);
		},
		() => ({ enabled: routed && Boolean(duckGain) })
	);

	const selectTrack = (item: MusicTrack, position: number) => {
		const current = position === index;
		index = position;
		onTrackChange?.(item);
		if (current) {
			player.toggle();
		} else {
			autoAdvance = true;
		}
	};
</script>

{#if tracks.length === 0}
	<Empty class={className}>
		<EmptyHeader>
			<EmptyMedia variant="icon">
				<MusicNotesIcon />
			</EmptyMedia>
			<EmptyTitle>No music</EmptyTitle>
			<EmptyDescription>Add tracks to start playing.</EmptyDescription>
		</EmptyHeader>
	</Empty>
{:else}
	<Card class={className}>
		<CardContent>
			<div class="flex flex-col gap-4">
				<AudioPlayer
					class="flex-col items-stretch gap-3"
					onNext={() => go(1)}
					onPrevious={() => go(-1)}
					{player}
				>
					<div class="flex items-center gap-3">
						{#if track?.artwork}
							<AudioPlayerArtwork src={track.artwork} />
						{:else}
							<span
								class="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground"
							>
								<MusicNotesIcon class="size-5" />
							</span>
						{/if}
						<div class="flex min-w-0 flex-1 flex-col">
							<AudioPlayerTitle>{track?.title}</AudioPlayerTitle>
							<AudioPlayerDescription>{track?.artist}</AudioPlayerDescription>
						</div>
					</div>
					<Waveform
						class="h-14"
						currentTime={player.currentTime}
						duration={waveform.duration || player.duration}
						loading={waveform.status === "loading"}
						onSeekCommit={(value) => player.seek(value)}
						peaks={waveform.peaks}
						time={player.time}
					>
						<WaveformCanvas />
						<WaveformCursor />
						<WaveformHover />
					</Waveform>
					<div class="flex items-center justify-between">
						<AudioPlayerTime />
						<AudioPlayerTime type="remaining" />
					</div>
					<div class="flex items-center justify-between gap-2">
						<Toggle aria-label="Shuffle" bind:pressed={shuffle} size="sm">
							<ShuffleIcon />
						</Toggle>
						<AudioPlayerControls>
							<AudioPlayerPrevious>
								<SkipBackIcon />
							</AudioPlayerPrevious>
							<AudioPlayerPlay>
								{#snippet children({ playing })}
									{#if playing}
										<PauseIcon weight="fill" />
									{:else}
										<PlayIcon weight="fill" />
									{/if}
								{/snippet}
							</AudioPlayerPlay>
							<AudioPlayerNext>
								<SkipForwardIcon />
							</AudioPlayerNext>
						</AudioPlayerControls>
						<Toggle
							aria-label="Repeat: {repeat}"
							bind:pressed={
								() => repeat !== "off",
								() => {
									repeat = nextRepeat[repeat];
								}
							}
							size="sm"
						>
							{#if repeat === "one"}
								<RepeatOnceIcon />
							{:else}
								<RepeatIcon />
							{/if}
						</Toggle>
					</div>
					<AudioPlayerVolume>
						<VolumeControlMute>
							{#if player.muted}
								<SpeakerXIcon />
							{:else}
								<SpeakerHighIcon />
							{/if}
						</VolumeControlMute>
						<VolumeControlSlider />
					</AudioPlayerVolume>
				</AudioPlayer>
				<TrackList variant="outline">
					{#each tracks as item, position (item.id)}
						<TrackListItem
							active={position === index}
							onSelect={() => selectTrack(item, position)}
							playing={position === index && player.playing}
						>
							<TrackListItemIndex>{position + 1}</TrackListItemIndex>
							<TrackListItemContent>
								<TrackListItemTitle>{item.title}</TrackListItemTitle>
								{#if item.artist}
									<TrackListItemDescription>{item.artist}</TrackListItemDescription>
								{/if}
							</TrackListItemContent>
							<TrackListItemDuration>
								{item.duration ? formatTime(item.duration) : null}
							</TrackListItemDuration>
						</TrackListItem>
					{/each}
				</TrackList>
				{#if duckingSource !== undefined}
					<div class="flex flex-col gap-3 rounded-xl border p-3">
						<div class="flex items-center justify-between">
							<Label for={duckingId}>Lower music while you talk</Label>
							<Switch bind:checked={ducking} id={duckingId} size="sm" />
						</div>
						<ParameterSlider
							disabled={!ducking}
							max={0}
							min={-30}
							bind:value={duckAmountDb}
							unit="dB"
						>
							<ParameterSliderHeader>
								<ParameterSliderLabel>Amount</ParameterSliderLabel>
								<ParameterSliderValue />
							</ParameterSliderHeader>
							<ParameterSliderControl />
						</ParameterSlider>
					</div>
				{/if}
			</div>
		</CardContent>
	</Card>
{/if}
