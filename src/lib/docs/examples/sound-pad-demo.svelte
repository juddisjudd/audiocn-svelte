<script lang="ts">
	import MegaphoneIcon from "phosphor-svelte/lib/MegaphoneIcon";
	import {
		SoundPad,
		SoundPadIcon,
		SoundPadLabel,
		SoundPadProgress,
		SoundPadShortcut,
	} from "#lib/components/ui/sound-pad/index.js";
	import { useSound } from "#lib/hooks/use-sound.svelte.js";
	import { useDemoSounds } from "#lib/docs/use-demo-audio.svelte.js";

	const sounds = useDemoSounds();
	const airhorn = useSound(() => sounds.current[0]?.src ?? null);
</script>

<SoundPad
	accent="oklch(0.7 0.2 30)"
	class="w-40"
	hotkey="1"
	loading={!airhorn.isLoaded}
	onTrigger={() => airhorn.play()}
	playing={airhorn.isPlaying}
>
	<SoundPadIcon>
		<MegaphoneIcon />
	</SoundPadIcon>
	<SoundPadLabel>Airhorn</SoundPadLabel>
	<SoundPadShortcut />
	<SoundPadProgress source={airhorn.progress} />
</SoundPad>
