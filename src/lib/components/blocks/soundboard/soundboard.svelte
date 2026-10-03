<script lang="ts" module>
	import type { SoundboardPadActions, SoundboardSound } from "./soundboard-pad.svelte";

	export interface SoundboardProps {
		sounds?: SoundboardSound[];
		defaultSounds?: SoundboardSound[];
		onSoundsChange?: (sounds: SoundboardSound[]) => void;
		/** Route pads into a mixer instead of the speakers. */
		output?: AudioNode | null;
		/** Default 4. */
		columns?: number;
		class?: string;
	}

	const AUDIO_FILE = /^audio\//u;
	const FILE_EXTENSION = /\.[^.]+$/u;
	const NO_SOUNDS: SoundboardSound[] = [];

	const fileToSound = (file: File, index: number): SoundboardSound & { src: string } => ({
		hotkey: index < 9 ? String(index + 1) : undefined,
		id: `${file.name}-${file.lastModified}`,
		label: file.name.replace(FILE_EXTENSION, ""),
		src: URL.createObjectURL(file),
	});
</script>

<script lang="ts">
	import PlusIcon from "phosphor-svelte/lib/PlusIcon";
	import SpeakerHighIcon from "phosphor-svelte/lib/SpeakerHighIcon";
	import StopIcon from "phosphor-svelte/lib/StopIcon";
	import WaveformIcon from "phosphor-svelte/lib/WaveformIcon";
	import { untrack } from "svelte";

	import { Alert, AlertDescription } from "#lib/components/ui/alert/index.js";
	import { Button } from "#lib/components/ui/button/index.js";
	import {
		Empty,
		EmptyDescription,
		EmptyHeader,
		EmptyMedia,
		EmptyTitle,
	} from "#lib/components/ui/empty/index.js";
	import { Label } from "#lib/components/ui/label/index.js";
	import { SoundPad, SoundPadGrid, SoundPadLabel } from "#lib/components/ui/sound-pad/index.js";
	import { Switch } from "#lib/components/ui/switch/index.js";
	import {
		VolumeControl,
		VolumeControlMute,
		VolumeControlSlider,
	} from "#lib/components/ui/volume-control/index.js";
	import { useGainNode } from "#lib/hooks/use-gain-node.svelte.js";

	import SoundboardPad from "./soundboard-pad.svelte";

	let {
		sounds: soundsProp,
		defaultSounds = NO_SOUNDS,
		onSoundsChange,
		output,
		columns = 4,
		class: className,
	}: SoundboardProps = $props();

	let soundsState = $state.raw(untrack(() => defaultSounds));
	const sounds = $derived(soundsProp ?? soundsState);
	let volume = $state(1);
	let muted = $state(false);
	const bus = useGainNode(() => ({
		destination: output,
		gain: muted ? 0 : volume ** 2,
	}));
	let hotkeys = $state(true);
	let dragging = $state(false);
	let feedback = $state("");
	let removedSound = $state.raw<{ sound: SoundboardSound; index: number } | null>(null);
	const hotkeysId = $props.id();
	let fileInput = $state<HTMLInputElement | null>(null);
	const pads: Record<string, SoundboardPadActions | null> = {};
	// Object URLs this board created for dropped files.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- bookkeeping, never rendered
	const objectUrls = new Set<string>();

	const update = (next: SoundboardSound[]) => {
		soundsState = next;
		onSoundsChange?.(next);
	};

	const addFiles = (files: FileList | null | undefined) => {
		if (!files || files.length === 0) {
			return;
		}
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a local lookup, never rendered
		const existingIds = new Set(sounds.map((sound) => sound.id));
		const added = [...files]
			.filter((file) => AUDIO_FILE.test(file.type))
			.filter((file) => {
				const id = `${file.name}-${file.lastModified}`;
				if (existingIds.has(id)) {
					return false;
				}
				existingIds.add(id);
				return true;
			})
			.map((file, index) => fileToSound(file, sounds.length + index));
		if (added.length === 0) {
			feedback = "No new sounds added. Choose audio files that aren't already on the board.";
			return;
		}
		for (const sound of added) {
			objectUrls.add(sound.src);
		}
		update([...sounds, ...added]);
		feedback = `Added ${added.length} ${added.length === 1 ? "sound" : "sounds"}.`;
	};

	// Frees a dropped file once no pad uses it and its removal can't be undone.
	const releaseObjectUrl = ({ src }: SoundboardSound) => {
		const inUse = sounds.some((item) => item.src === src);
		if (typeof src === "string" && !inUse && objectUrls.delete(src)) {
			URL.revokeObjectURL(src);
		}
	};

	const removeSound = (sound: SoundboardSound) => {
		if (removedSound) {
			releaseObjectUrl(removedSound.sound);
		}
		removedSound = {
			index: sounds.findIndex((item) => item.id === sound.id),
			sound,
		};
		update(sounds.filter((item) => item.id !== sound.id));
		feedback = `Removed ${sound.label}. You can undo this removal.`;
	};

	const undoRemoval = () => {
		if (!removedSound) {
			return;
		}
		const { sound, index } = removedSound;
		if (!sounds.some((item) => item.id === sound.id)) {
			update([...sounds.slice(0, index), sound, ...sounds.slice(index)]);
		}
		removedSound = null;
		feedback = `Restored ${sound.label}.`;
	};

	const stopAll = () => {
		for (const pad of Object.values(pads)) {
			pad?.stop();
		}
		feedback = "Stopped all sounds.";
	};
</script>

<!-- Dropping files is a shortcut for the Add sounds controls, so the board needs no role. -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class={className}
	data-dragging={dragging ? "" : undefined}
	data-slot="soundboard"
	ondragleave={() => {
		dragging = false;
	}}
	ondragover={(event) => {
		event.preventDefault();
		dragging = true;
	}}
	ondrop={(event) => {
		event.preventDefault();
		dragging = false;
		addFiles(event.dataTransfer?.files);
	}}
>
	<div class="mb-3 flex flex-wrap items-center gap-3">
		<h3 class="font-heading mr-auto font-medium">Soundboard</h3>
		<div class="flex items-center gap-2">
			<Switch bind:checked={hotkeys} id={hotkeysId} size="sm" />
			<Label for={hotkeysId}>Hotkeys</Label>
		</div>
		<VolumeControl class="w-36" bind:muted bind:value={volume}>
			<VolumeControlMute>
				<SpeakerHighIcon />
			</VolumeControlMute>
			<VolumeControlSlider />
		</VolumeControl>
		<Button onclick={stopAll} size="sm" variant="outline">
			<StopIcon data-icon="inline-start" />
			Stop all
		</Button>
	</div>
	{#if feedback}
		<output aria-live="polite" class="mb-3 block">
			<Alert role="none">
				<AlertDescription>{feedback}</AlertDescription>
				{#if removedSound}
					<div class="mt-2">
						<Button onclick={undoRemoval} size="sm" variant="outline">Undo removal</Button>
					</div>
				{/if}
			</Alert>
		</output>
	{/if}
	{#if sounds.length === 0}
		<div class="rounded-xl border border-dashed">
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<WaveformIcon />
					</EmptyMedia>
					<EmptyTitle>No sounds yet</EmptyTitle>
					<EmptyDescription>Drop audio files here, or add them from your computer.</EmptyDescription
					>
				</EmptyHeader>
				<Button onclick={() => fileInput?.click()} size="sm" variant="outline">
					<PlusIcon data-icon="inline-start" />
					Add sounds
				</Button>
			</Empty>
		</div>
	{:else}
		<SoundPadGrid class="data-dragging:ring-2" {columns} hotkeyScope="global" {hotkeys}>
			{#each sounds as sound (sound.id)}
				<SoundboardPad
					bind:this={pads[sound.id]}
					{bus}
					onChange={(next) => update(sounds.map((item) => (item.id === sound.id ? next : item)))}
					onRemove={() => removeSound(sound)}
					{sound}
				/>
			{/each}
			<SoundPad
				aria-label="Add sounds"
				class="items-center justify-center border-dashed text-muted-foreground"
				onTrigger={() => fileInput?.click()}
				variant="outline"
			>
				<PlusIcon class="size-5" />
				<SoundPadLabel>Add</SoundPadLabel>
			</SoundPad>
		</SoundPadGrid>
	{/if}
	<input
		accept="audio/*"
		aria-label="Add audio files"
		bind:this={fileInput}
		class="hidden"
		multiple
		onchange={(event) => {
			addFiles(event.currentTarget.files);
			event.currentTarget.value = "";
		}}
		type="file"
	/>
</div>
