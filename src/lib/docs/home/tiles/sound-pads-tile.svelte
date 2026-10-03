<script lang="ts">
	import { Skeleton } from "#lib/components/ui/skeleton/index.js";
	import {
		SoundPad,
		SoundPadGrid,
		SoundPadLabel,
		SoundPadProgress,
		type SoundPadMode,
	} from "#lib/components/ui/sound-pad/index.js";
	import { useSound } from "#lib/hooks/use-sound.svelte.js";
	import { DEMO_SOUNDS } from "#lib/docs/demo-audio.js";
	import { useDemoSounds } from "#lib/docs/use-demo-audio.svelte.js";

	const MODES: Record<string, SoundPadMode> = {
		drumroll: "hold",
		whoosh: "toggle",
	};

	const sounds = useDemoSounds();

	const pads = DEMO_SOUNDS.map((sound) => {
		const mode = MODES[sound.id] ?? "one-shot";
		const player = useSound(() => sounds.current.find(({ id }) => id === sound.id)?.src ?? null, {
			loop: mode !== "one-shot",
		});
		return { mode, player, sound };
	});
</script>

<!-- Hotkeys stay off on the home page, so the pads never take keys from it. -->
{#if sounds.current.length === 0}
	<Skeleton class="h-76 w-full @sm:h-50" />
{:else}
	<SoundPadGrid class="w-full" columns={4}>
		{#each pads as { mode, player, sound } (sound.id)}
			<SoundPad
				accent={sound.accent}
				loading={!player.isLoaded}
				{mode}
				onStop={() => player.stop()}
				onTrigger={() => player.play()}
				playing={player.isPlaying}
			>
				<SoundPadLabel>{sound.label}</SoundPadLabel>
				<SoundPadProgress source={player.progress} variant={mode === "one-shot" ? "bar" : "ring"} />
			</SoundPad>
		{/each}
	</SoundPadGrid>
{/if}
