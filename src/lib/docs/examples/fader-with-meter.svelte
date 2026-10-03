<script lang="ts">
	import { Fader, FaderThumb, FaderTrack, FaderValue } from "#lib/components/ui/fader/index.js";
	import { LevelMeter } from "#lib/components/ui/level-meter/index.js";
	import { useDemoSignal } from "#lib/hooks/use-demo-signal.svelte.js";

	let gainDb = $state(0);
	const signal = useDemoSignal({ channels: 2, kind: "music" });
</script>

<Fader
	aria-label="Program gain"
	class="h-64 flex-col items-center"
	max={6}
	min={-60}
	orientation="vertical"
	size="lg"
	variant="console"
	bind:value={gainDb}
>
	<FaderValue />
	<FaderTrack class="w-6 overflow-visible bg-transparent">
		<LevelMeter
			aria-label="Program level"
			class="absolute inset-0 h-full min-h-0"
			maxDb={6}
			orientation="vertical"
			size="sm"
			source={signal.meter}
		/>
		<FaderThumb />
	</FaderTrack>
</Fader>
