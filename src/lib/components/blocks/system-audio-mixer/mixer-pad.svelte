<script lang="ts">
	import {
		SoundPad,
		SoundPadLabel,
		SoundPadProgress,
		SoundPadShortcut,
	} from "#lib/components/ui/sound-pad/index.js";
	import { useSound } from "#lib/hooks/use-sound.svelte.js";
	import type { MixerSound } from "./system-audio-mixer.svelte";

	let { sound, bus }: { sound: MixerSound; bus: AudioNode | null } = $props();

	const player = useSound(
		() => sound.src,
		() => ({ destination: bus })
	);
</script>

<SoundPad
	accent={sound.accent}
	hotkey={sound.hotkey}
	loading={!player.isLoaded}
	onTrigger={() => player.play()}
	playing={player.isPlaying}
	size="sm"
>
	<SoundPadLabel>{sound.label}</SoundPadLabel>
	<SoundPadShortcut />
	<SoundPadProgress source={player.progress} />
</SoundPad>
