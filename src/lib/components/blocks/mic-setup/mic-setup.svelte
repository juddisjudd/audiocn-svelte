<script lang="ts" module>
	export interface MicSetupProps {
		deviceId?: string | null;
		onDeviceChange?: (deviceId: string | null) => void;
		gainDb?: number;
		onGainChange?: (gainDb: number) => void;
		muted?: boolean;
		onMutedChange?: (muted: boolean) => void;
		/** Open the microphone on mount instead of waiting for a click. Default false. */
		autoStart?: boolean;
		class?: string;
	}

	const CHECK_DURATION_MS = 3000;

	type CheckResult = "good" | "quiet" | "loud" | "silent";

	const RESULTS: Record<CheckResult, { title: string; description: string; ok: boolean }> = {
		good: {
			description: "Your level sits in the right range.",
			ok: true,
			title: "Sounds good",
		},
		loud: {
			description: "Your voice clipped. Lower the gain.",
			ok: false,
			title: "Too loud",
		},
		quiet: {
			description: "Raise the gain or move closer.",
			ok: false,
			title: "Too quiet",
		},
		silent: {
			description: "Check the device and that it is not muted.",
			ok: false,
			title: "No signal",
		},
	};

	const judge = (peakDb: number): CheckResult => {
		if (peakDb < -55) {
			return "silent";
		}
		if (peakDb >= -1) {
			return "loud";
		}
		if (peakDb < -30) {
			return "quiet";
		}
		return "good";
	};
</script>

<script lang="ts">
	import { untrack } from "svelte";
	import CheckCircleIcon from "phosphor-svelte/lib/CheckCircleIcon";
	import MicrophoneIcon from "phosphor-svelte/lib/MicrophoneIcon";
	import WarningCircleIcon from "phosphor-svelte/lib/WarningCircleIcon";

	import { Alert, AlertDescription, AlertTitle } from "#lib/components/ui/alert/index.js";
	import {
		AudioDeviceSelect,
		AudioDeviceSelectContent,
		AudioDeviceSelectPreview,
		AudioDeviceSelectTrigger,
		AudioDeviceSelectValue,
	} from "#lib/components/ui/audio-device-select/index.js";
	import { Button } from "#lib/components/ui/button/index.js";
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from "#lib/components/ui/card/index.js";
	import { DbReadout } from "#lib/components/ui/db-readout/index.js";
	import { Field, FieldGroup, FieldLabel } from "#lib/components/ui/field/index.js";
	import {
		LevelMeter,
		LevelMeterBar,
		LevelMeterChannel,
		LevelMeterChannels,
		LevelMeterClip,
		LevelMeterHold,
		LevelMeterScale,
		LevelMeterTrack,
	} from "#lib/components/ui/level-meter/index.js";
	import { LiveWaveform } from "#lib/components/ui/live-waveform/index.js";
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
	import { useAudioDevices } from "#lib/hooks/use-audio-devices.svelte.js";
	import { useGainNode } from "#lib/hooks/use-gain-node.svelte.js";
	import { useMicrophone } from "#lib/hooks/use-microphone.svelte.js";
	import { dbToGain } from "#lib/audio/decibels.js";

	let {
		deviceId = $bindable(null),
		onDeviceChange,
		gainDb = $bindable(0),
		onGainChange,
		muted = $bindable(false),
		onMutedChange,
		autoStart = false,
		class: className,
	}: MicSetupProps = $props();

	const muteId = $props.id();
	let started = $state(untrack(() => autoStart));

	const devices = useAudioDevices();
	const microphone = useMicrophone(() => ({ deviceId, enabled: started }));

	// Runs the microphone through a gain stage and analyses the result. Not
	// routed to the speakers: the analyser taps it, and nothing else.
	const gainNode = useGainNode(() => ({
		destination: null,
		gain: muted ? 0 : dbToGain(gainDb),
		input: microphone.stream,
	}));
	const analyser = useAudioAnalyser(() => (microphone.stream ? gainNode : null), {
		historySize: 120,
	});

	// Listens for a few seconds, then judges the loudest peak.
	let checking = $state(false);
	let result = $state<CheckResult | null>(null);

	$effect(() => {
		if (!checking) {
			return;
		}
		let peak = Number.NEGATIVE_INFINITY;
		const unsubscribe = analyser.meter.subscribe((frame) => {
			for (const level of frame.channels) {
				peak = Math.max(peak, level.peakDb);
			}
		});
		const timer = setTimeout(() => {
			checking = false;
			result = judge(peak);
		}, CHECK_DURATION_MS);
		return () => {
			unsubscribe();
			clearTimeout(timer);
		};
	});

	const startCheck = () => {
		result = null;
		checking = true;
	};

	const active = $derived(microphone.status === "active");
	const verdict = $derived(result ? RESULTS[result] : null);
</script>

<Card class={className}>
	<CardHeader>
		<CardTitle>Microphone</CardTitle>
		<CardDescription>Pick a microphone and check your level.</CardDescription>
	</CardHeader>
	<CardContent>
		<FieldGroup>
			<Field>
				<FieldLabel>Device</FieldLabel>
				<AudioDeviceSelect
					bind:value={deviceId}
					devices={devices.devices}
					loading={devices.isLoading}
					onRequestPermission={() => devices.requestPermission()}
					onValueChange={(next) => onDeviceChange?.(next)}
					permission={devices.permission === "unsupported" ? "denied" : devices.permission}
				>
					<AudioDeviceSelectTrigger>
						<MicrophoneIcon class="text-muted-foreground" />
						<AudioDeviceSelectValue placeholder="Default microphone" />
					</AudioDeviceSelectTrigger>
					<AudioDeviceSelectContent />
				</AudioDeviceSelect>
				<AudioDeviceSelectPreview class="relative">
					{#if !active}
						<Button
							class="absolute inset-0 z-10 m-auto w-fit"
							onclick={() => (started = true)}
							size="xs"
							variant="outline"
						>
							Turn on microphone
						</Button>
					{/if}
					<LiveWaveform
						active={active && !muted}
						aria-label="Microphone preview"
						barWidth={2}
						class="h-10"
						mode="scrolling"
						source={analyser.visual}
					/>
				</AudioDeviceSelectPreview>
			</Field>
			<Field>
				<div class="flex items-center justify-between">
					<FieldLabel>Level</FieldLabel>
					<DbReadout class="text-xs text-muted-foreground" holdMs={500} source={analyser.meter} />
				</div>
				<LevelMeter aria-label="Microphone level" source={analyser.meter}>
					<LevelMeterChannels>
						<LevelMeterChannel>
							<LevelMeterTrack>
								<LevelMeterBar />
								<LevelMeterHold />
							</LevelMeterTrack>
						</LevelMeterChannel>
						<LevelMeterScale />
					</LevelMeterChannels>
					<LevelMeterClip />
				</LevelMeter>
			</Field>
			<ParameterSlider
				bind:value={gainDb}
				max={24}
				min={-24}
				onValueChange={(next) => onGainChange?.(next)}
				origin={0}
				resetValue={0}
				unit="dB"
			>
				<ParameterSliderHeader>
					<ParameterSliderLabel>Gain</ParameterSliderLabel>
					<ParameterSliderReset />
					<ParameterSliderInput />
				</ParameterSliderHeader>
				<ParameterSliderControl />
			</ParameterSlider>
			<Field orientation="horizontal">
				<Switch
					bind:checked={muted}
					id={muteId}
					onCheckedChange={(next) => onMutedChange?.(next)}
				/>
				<FieldLabel for={muteId}>Mute microphone</FieldLabel>
			</Field>
			<div class="flex flex-col gap-3">
				<Button
					class="self-start"
					disabled={!active || checking}
					onclick={startCheck}
					variant="outline"
				>
					{checking ? "Listening… say a few words" : "Check level"}
				</Button>
				{#if verdict}
					<Alert variant={verdict.ok ? "default" : "destructive"}>
						{#if verdict.ok}
							<CheckCircleIcon />
						{:else}
							<WarningCircleIcon />
						{/if}
						<AlertTitle>{verdict.title}</AlertTitle>
						<AlertDescription>{verdict.description}</AlertDescription>
					</Alert>
				{/if}
				{#if microphone.status === "denied"}
					<Alert variant="destructive">
						<WarningCircleIcon />
						<AlertTitle>Microphone blocked</AlertTitle>
						<AlertDescription>
							Allow microphone access in your browser's site settings.
						</AlertDescription>
					</Alert>
				{/if}
			</div>
		</FieldGroup>
	</CardContent>
</Card>
