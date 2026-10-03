<script lang="ts" module>
	import type { SoundPadMode } from "#lib/components/ui/sound-pad/index.js";

	export interface SoundboardSound {
		id: string;
		label: string;
		src: string | AudioBuffer;
		hotkey?: string;
		mode?: SoundPadMode;
		/** 0..1. Default 1. */
		volume?: number;
		accent?: string;
	}

	export interface SoundboardPadActions {
		stop: () => void;
	}

	export interface SoundboardPadProps {
		sound: SoundboardSound;
		bus: AudioNode | null;
		onChange: (sound: SoundboardSound) => void;
		onRemove: () => void;
	}

	const MODES: { value: SoundPadMode; label: string }[] = [
		{ label: "One shot", value: "one-shot" },
		{ label: "Toggle", value: "toggle" },
		{ label: "Hold", value: "hold" },
		{ label: "Loop", value: "loop" },
	];

	const VOLUMES = [1, 0.75, 0.5, 0.25];
</script>

<script lang="ts">
	import {
		ContextMenu,
		ContextMenuContent,
		ContextMenuGroup,
		ContextMenuItem,
		ContextMenuLabel,
		ContextMenuRadioGroup,
		ContextMenuRadioItem,
		ContextMenuSeparator,
		ContextMenuTrigger,
	} from "#lib/components/ui/context-menu/index.js";
	import {
		SoundPad,
		SoundPadLabel,
		SoundPadProgress,
		SoundPadShortcut,
	} from "#lib/components/ui/sound-pad/index.js";
	import { useSound } from "#lib/hooks/use-sound.svelte.js";

	// eslint-disable-next-line svelte/no-unused-props -- onChange hands the whole sound back
	let { sound, bus, onChange, onRemove }: SoundboardPadProps = $props();

	const mode = $derived(sound.mode ?? "one-shot");
	const player = useSound(
		() => sound.src,
		() => ({
			destination: bus,
			interrupt: mode !== "one-shot",
			loop: mode === "loop",
			volume: sound.volume ?? 1,
		})
	);

	export function stop() {
		player.stop();
	}
</script>

<ContextMenu>
	<ContextMenuTrigger>
		{#snippet child({ props })}
			<SoundPad
				{...props}
				accent={sound.accent}
				hotkey={sound.hotkey}
				loading={!player.isLoaded}
				{mode}
				onStop={() => player.stop()}
				onTrigger={() => player.play()}
				playing={player.isPlaying}
			>
				<SoundPadLabel>{sound.label}</SoundPadLabel>
				<SoundPadShortcut />
				<SoundPadProgress source={player.progress} />
			</SoundPad>
		{/snippet}
	</ContextMenuTrigger>
	<ContextMenuContent class="w-48">
		<ContextMenuGroup>
			<ContextMenuLabel>Mode</ContextMenuLabel>
			<ContextMenuRadioGroup
				bind:value={() => mode, (value) => onChange({ ...sound, mode: value as SoundPadMode })}
			>
				{#each MODES as option (option.value)}
					<ContextMenuRadioItem value={option.value}>{option.label}</ContextMenuRadioItem>
				{/each}
			</ContextMenuRadioGroup>
		</ContextMenuGroup>
		<ContextMenuSeparator />
		<ContextMenuGroup>
			<ContextMenuLabel>Volume</ContextMenuLabel>
			<ContextMenuRadioGroup
				bind:value={
					() => String(sound.volume ?? 1), (value) => onChange({ ...sound, volume: Number(value) })
				}
			>
				{#each VOLUMES as volume (volume)}
					<ContextMenuRadioItem value={String(volume)}>
						{Math.round(volume * 100)}%
					</ContextMenuRadioItem>
				{/each}
			</ContextMenuRadioGroup>
		</ContextMenuGroup>
		<ContextMenuSeparator />
		<ContextMenuGroup>
			<ContextMenuItem onSelect={onRemove} variant="destructive">Remove</ContextMenuItem>
		</ContextMenuGroup>
	</ContextMenuContent>
</ContextMenu>
