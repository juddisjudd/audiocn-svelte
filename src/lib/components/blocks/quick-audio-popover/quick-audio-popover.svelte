<script lang="ts" module>
	import type { Snippet } from "svelte";

	export interface QuickAudioPopoverProps {
		/** Extra content at the bottom, such as a link to full audio settings. */
		children?: Snippet;
		side?: "top" | "bottom" | "left" | "right";
		align?: "start" | "center" | "end";
	}
</script>

<script lang="ts">
	import { MicrophoneIcon, MicrophoneSlashIcon } from "phosphor-svelte";

	import { AudioDeviceSelect } from "#lib/components/ui/audio-device-select/index.js";
	import { BarVisualizer } from "#lib/components/ui/bar-visualizer/index.js";
	import { Button } from "#lib/components/ui/button/index.js";
	import { Field, FieldGroup, FieldLabel } from "#lib/components/ui/field/index.js";
	import {
		Popover,
		PopoverContent,
		PopoverDescription,
		PopoverHeader,
		PopoverTitle,
		PopoverTrigger,
	} from "#lib/components/ui/popover/index.js";
	import { Separator } from "#lib/components/ui/separator/index.js";
	import { Switch } from "#lib/components/ui/switch/index.js";
	import { useAudioAnalyser } from "#lib/hooks/use-audio-analyser.svelte.js";
	import { useAudioDevices } from "#lib/hooks/use-audio-devices.svelte.js";
	import { useMicrophone } from "#lib/hooks/use-microphone.svelte.js";
	import { useSystemAudio } from "#lib/hooks/use-system-audio.svelte.js";

	let { children, side = "bottom", align = "center" }: QuickAudioPopoverProps = $props();

	const systemAudioId = $props.id();
	const devices = useAudioDevices();
	let deviceId = $state<string | null>(null);
	let muted = $state(false);
	const microphone = useMicrophone(() => ({ deviceId }));
	const analyser = useAudioAnalyser(
		() => microphone.stream,
		() => ({ enabled: !muted })
	);
	const system = useSystemAudio();
	const micActive = $derived(microphone.status === "active");
	const live = $derived(micActive && !muted);
</script>

<Popover>
	<PopoverTrigger>
		{#snippet child({ props })}
			<Button
				{...props}
				aria-label={live ? "Audio: microphone live" : "Audio settings"}
				variant="outline"
			>
				{#if live}
					<MicrophoneIcon data-icon="inline-start" />
				{:else}
					<MicrophoneSlashIcon data-icon="inline-start" />
				{/if}
				<BarVisualizer
					aria-hidden="true"
					barCount={5}
					class="h-4 w-8 text-foreground [--bar-gap:2px] [--bar-width:3px]"
					minLevel={0.15}
					source={live ? analyser.visual : null}
				/>
			</Button>
		{/snippet}
	</PopoverTrigger>
	<PopoverContent {align} class="w-80" {side}>
		<PopoverHeader>
			<PopoverTitle>Audio</PopoverTitle>
			<PopoverDescription>Microphone and system audio.</PopoverDescription>
		</PopoverHeader>
		<FieldGroup>
			<Field>
				<FieldLabel>Microphone</FieldLabel>
				<AudioDeviceSelect
					bind:value={deviceId}
					devices={devices.devices}
					loading={devices.isLoading}
					onRequestPermission={() => devices.requestPermission()}
					permission={devices.permission === "unsupported" ? "denied" : devices.permission}
				/>
			</Field>
			<div class="flex gap-2">
				<Button
					class="flex-1"
					onclick={() => (micActive ? microphone.stop() : microphone.start())}
					size="sm"
					variant="outline"
				>
					{micActive ? "Turn off" : "Turn on"}
				</Button>
				<Button
					class="flex-1"
					disabled={!micActive}
					onclick={() => (muted = !muted)}
					size="sm"
					variant={muted ? "destructive" : "outline"}
				>
					{muted ? "Unmute" : "Mute"}
				</Button>
			</div>
			<Separator />
			<Field orientation="horizontal">
				<FieldLabel for={systemAudioId}>System audio</FieldLabel>
				<Switch
					bind:checked={
						() => system.status === "active",
						(checked) => (checked ? system.start() : system.stop())
					}
					disabled={!system.isSupported}
					id={systemAudioId}
				/>
			</Field>
			{@render children?.()}
		</FieldGroup>
	</PopoverContent>
</Popover>
