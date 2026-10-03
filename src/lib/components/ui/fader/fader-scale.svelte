<script lang="ts" module>
	import type { DbScaleProps } from "#lib/components/ui/db-scale/index.js";

	export type FaderScaleProps = Omit<DbScaleProps, "minDb" | "maxDb" | "taper" | "orientation">;
</script>

<script lang="ts">
	import { DbScale } from "#lib/components/ui/db-scale/index.js";
	import { cn } from "#lib/utils.js";
	import { useFader } from "./fader-utils.js";

	let { ref = $bindable(null), class: className, ...restProps }: FaderScaleProps = $props();

	const fader = useFader("FaderScale");
</script>

<div
	data-slot="fader-scale"
	class={cn(
		fader.orientation === "horizontal"
			? "px-[calc(var(--fader-thumb-size)/2)]"
			: "py-[calc(var(--fader-thumb-size)/2)]",
		className
	)}
>
	<DbScale
		bind:ref
		maxDb={fader.max}
		minDb={fader.min}
		orientation={fader.orientation}
		taper={fader.taper}
		{...restProps}
	/>
</div>
