<script lang="ts">
	import {
		Knob,
		KnobCap,
		KnobDial,
		KnobLabel,
		KnobScale,
		KnobValue,
		type KnobCapProps,
		type KnobProps,
		type KnobScaleProps,
	} from "./index.js";

	let {
		layout,
		scaleProps,
		capProps,
		dialStyle,
		...knobProps
	}: KnobProps & {
		layout: "value" | "scale" | "cap" | "style";
		scaleProps?: KnobScaleProps;
		capProps?: KnobCapProps;
		dialStyle?: string;
	} = $props();
</script>

<Knob {...knobProps}>
	{#if layout === "value"}
		<KnobDial />
		<KnobValue />
		<KnobLabel>Gain</KnobLabel>
	{:else if layout === "scale"}
		<KnobDial>
			<KnobScale {...scaleProps} />
		</KnobDial>
	{:else if layout === "cap"}
		<KnobDial>
			<KnobCap {...capProps} />
		</KnobDial>
	{:else}
		<KnobDial style={dialStyle} />
	{/if}
</Knob>
