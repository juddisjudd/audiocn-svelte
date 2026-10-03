<script lang="ts" module>
	import type { DbReadoutProps } from "#lib/components/ui/db-readout/index.js";

	export type LevelMeterValueProps = Omit<DbReadoutProps, "source" | "value">;
</script>

<script lang="ts">
	import { DbReadout, readChannel } from "#lib/components/ui/db-readout/index.js";
	import { cn } from "#lib/utils.js";
	import { useLevelMeterContext } from "./level-meter-utils.js";

	let {
		ref = $bindable(null),
		measure = "peak",
		channel = "max",
		class: className,
		...restProps
	}: LevelMeterValueProps = $props();

	const context = useLevelMeterContext("LevelMeterValue");
	// Declarative levels only change on update, so show them as a value. A
	// stream keeps its live readout, which falls to −∞ when it stops.
	const value = $derived(
		context.declared ? readChannel(context.declared, measure, channel) : undefined
	);
</script>

<DbReadout
	bind:ref
	class={cn("text-xs text-muted-foreground", className)}
	floorDb={context.minDb}
	source={context.declared ? null : context.frames}
	{value}
	{measure}
	{channel}
	{...restProps}
/>
