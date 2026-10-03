<script lang="ts" module>
	import type { DbScaleProps } from "#lib/components/ui/db-scale/index.js";

	export type LevelMeterScaleProps = Omit<
		DbScaleProps,
		"minDb" | "maxDb" | "taper" | "orientation"
	>;
</script>

<script lang="ts">
	import { DbScale } from "#lib/components/ui/db-scale/index.js";
	import { cn } from "#lib/utils.js";
	import { useLevelMeterContext } from "./level-meter-utils.js";

	let { ref = $bindable(null), class: className, ...restProps }: LevelMeterScaleProps = $props();

	const context = useLevelMeterContext("LevelMeterScale");
</script>

<!-- Horizontal meters reserve space below the tracks for the scale. -->
<DbScale
	bind:ref
	class={cn(
		context.orientation === "horizontal" &&
			"absolute top-[calc(100%+var(--meter-gap))] left-0 h-(--meter-scale-size)",
		className
	)}
	maxDb={context.maxDb}
	minDb={context.minDb}
	orientation={context.orientation}
	taper={context.taper}
	{...restProps}
/>
