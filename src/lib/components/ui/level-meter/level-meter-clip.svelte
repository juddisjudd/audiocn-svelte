<script lang="ts" module>
	import type { ClipIndicatorProps } from "#lib/components/ui/clip-indicator/index.js";

	export type LevelMeterClipProps = Omit<ClipIndicatorProps, "source">;
</script>

<script lang="ts">
	import { ClipIndicator } from "#lib/components/ui/clip-indicator/index.js";
	import { useLevelMeterContext } from "./level-meter-utils.js";

	let { ref = $bindable(null), ...restProps }: LevelMeterClipProps = $props();

	const context = useLevelMeterContext("LevelMeterClip");
	let indicator: ReturnType<typeof ClipIndicator> | undefined;

	export function report(db: number) {
		indicator?.report(db);
	}

	export function reset() {
		indicator?.reset();
	}
</script>

<ClipIndicator bind:this={indicator} bind:ref source={context.frames} {...restProps} />
