<script lang="ts" module>
	import type { SystemAudioStatus } from "#lib/hooks/use-system-audio.svelte.js";

	export interface SystemAudioSettingsProps {
		/** Capture state. Leave it out to let the switch alone decide. */
		enabled?: boolean;
		onEnabledChange?: (enabled: boolean) => void;
		gainDb?: number;
		onGainChange?: (gainDb: number) => void;
		/** The captured stream after the level control, for your own routing. */
		onStreamChange?: (stream: MediaStream | null) => void;
		class?: string;
	}

	const DEFAULT_GAIN_DB = -6;

	const STATE_LABELS: Record<SystemAudioStatus, string> = {
		active: "On",
		denied: "Needs permission",
		ended: "Ended",
		idle: "Off",
		"no-audio": "No audio shared",
		prompting: "Choose what to share…",
		unsupported: "Unsupported",
	};
</script>

<script lang="ts">
	import { untrack } from "svelte";
	import DesktopIcon from "phosphor-svelte/lib/DesktopIcon";
	import InfoIcon from "phosphor-svelte/lib/InfoIcon";
	import WarningIcon from "phosphor-svelte/lib/WarningIcon";

	import { Alert, AlertDescription, AlertTitle } from "#lib/components/ui/alert/index.js";
	import { Badge } from "#lib/components/ui/badge/index.js";
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from "#lib/components/ui/card/index.js";
	import {
		Field,
		FieldContent,
		FieldDescription,
		FieldGroup,
		FieldLabel,
	} from "#lib/components/ui/field/index.js";
	import { LevelMeter } from "#lib/components/ui/level-meter/index.js";
	import {
		ParameterSlider,
		ParameterSliderControl,
		ParameterSliderHeader,
		ParameterSliderInput,
		ParameterSliderLabel,
		ParameterSliderReset,
	} from "#lib/components/ui/parameter-slider/index.js";
	import { Switch } from "#lib/components/ui/switch/index.js";
	import { useAudioAnalyser } from "#lib/hooks/use-audio-analyser.svelte.js";
	import { useAudioContext } from "#lib/hooks/use-audio-context.svelte.js";
	import { useGainNode } from "#lib/hooks/use-gain-node.svelte.js";
	import { useSystemAudio } from "#lib/hooks/use-system-audio.svelte.js";
	import { dbToGain } from "#lib/audio/decibels.js";

	let {
		enabled = $bindable(),
		onEnabledChange,
		gainDb = $bindable(DEFAULT_GAIN_DB),
		onGainChange,
		onStreamChange,
		class: className,
	}: SystemAudioSettingsProps = $props();

	const enabledId = $props.id();
	const system = useSystemAudio();
	const { context } = useAudioContext();
	const output = context?.createMediaStreamDestination() ?? null;
	// The captured stream, through the level control, into a stream for the
	// parent. Not routed to the speakers.
	const gainNode = useGainNode(() => ({
		destination: output,
		gain: dbToGain(gainDb),
		input: system.stream,
	}));
	const analyser = useAudioAnalyser(() => (system.stream ? gainNode : null), {
		channels: "stereo",
	});
	const active = $derived(system.status === "active");
	const processed = $derived(context && gainNode && output && system.stream ? output.stream : null);

	// A new callback from the parent must not re-emit the same stream.
	$effect(() => {
		const stream = processed;
		untrack(() => onStreamChange?.(stream));
	});

	$effect(() => {
		if (enabled === true) {
			const capturing = untrack(() => system.status === "active" || system.status === "prompting");
			if (!capturing) {
				system.start();
			}
		} else if (enabled === false) {
			system.stop();
		}
	});

	const setEnabled = (next: boolean) => {
		// Controlled, the effect above acts once `enabled` changes. When it
		// already says so (capture ended while `enabled` stayed true), nothing
		// will change, so act here.
		const controlled = enabled !== undefined;
		const willChange = controlled && enabled !== next;
		if (controlled) {
			enabled = next;
		}
		onEnabledChange?.(next);
		if (willChange) {
			return;
		}
		if (next) {
			system.start();
		} else {
			system.stop();
		}
	};
</script>

<Card class={className}>
	<CardHeader>
		<CardTitle>
			<span class="flex items-center gap-2">
				<DesktopIcon />
				System audio
			</span>
		</CardTitle>
		<CardDescription>Add the sound from your computer to your recording or stream.</CardDescription>
	</CardHeader>
	<CardContent>
		<FieldGroup>
			<Field orientation="horizontal">
				<FieldContent>
					<div class="flex flex-wrap items-center gap-2">
						<FieldLabel for={enabledId}>Capture system audio</FieldLabel>
						<Badge variant={active ? "default" : "secondary"}>
							{STATE_LABELS[system.status]}
						</Badge>
					</div>
					<FieldDescription>
						Your browser asks what to share. Choose a screen or tab and turn on its audio.
					</FieldDescription>
				</FieldContent>
				<Switch
					bind:checked={() => active || system.status === "prompting", setEnabled}
					disabled={!system.isSupported}
					id={enabledId}
				/>
			</Field>
			<ParameterSlider
				bind:value={gainDb}
				disabled={!active}
				max={12}
				min={-24}
				onValueChange={(next) => onGainChange?.(next)}
				origin={0}
				resetValue={DEFAULT_GAIN_DB}
				unit="dB"
			>
				<ParameterSliderHeader>
					<ParameterSliderLabel>Level</ParameterSliderLabel>
					<ParameterSliderReset />
					<ParameterSliderInput />
				</ParameterSliderHeader>
				<ParameterSliderControl />
			</ParameterSlider>
			{#if active}
				<LevelMeter aria-label="System audio level" channelCount={2} source={analyser.meter} />
			{/if}
			{#if system.isSupported}
				<Alert>
					<InfoIcon />
					<AlertTitle>What gets captured</AlertTitle>
					<AlertDescription>
						Everything the shared screen, window or tab plays. Some browsers only offer tab audio.
					</AlertDescription>
				</Alert>
			{:else}
				<Alert variant="destructive">
					<WarningIcon />
					<AlertTitle>Not available in this browser</AlertTitle>
					<AlertDescription>
						This browser cannot capture system audio. Try a Chromium-based browser.
					</AlertDescription>
				</Alert>
			{/if}
			{#if system.status === "denied"}
				<Alert variant="destructive">
					<WarningIcon />
					<AlertTitle>Capture was not started</AlertTitle>
					<AlertDescription>
						No screen or tab was shared. Turn capture on again and approve the browser's sharing
						request. If access is blocked, allow screen sharing in your browser or system settings.
					</AlertDescription>
				</Alert>
			{/if}
			{#if system.status === "no-audio"}
				<Alert variant="destructive">
					<WarningIcon />
					<AlertTitle>No audio was shared</AlertTitle>
					<AlertDescription>
						Turn capture on again and tick the option to share audio.
					</AlertDescription>
				</Alert>
			{/if}
		</FieldGroup>
	</CardContent>
</Card>
