<script lang="ts">
	import {
		ParameterSlider,
		ParameterSliderControl,
		ParameterSliderInput,
		ParameterSliderLabel,
		type ParameterSliderProps,
	} from "./index.js";

	let {
		label,
		input = false,
		parentValue,
		...sliderProps
	}: ParameterSliderProps & {
		label?: string;
		input?: boolean;
		/** Makes the slider controlled by a parent that never takes a new value. */
		parentValue?: number;
	} = $props();
</script>

{#snippet parts()}
	{#if label}
		<ParameterSliderLabel>{label}</ParameterSliderLabel>
	{/if}
	{#if input}
		<ParameterSliderInput />
	{/if}
	<ParameterSliderControl />
{/snippet}

{#if parentValue === undefined}
	<ParameterSlider {...sliderProps}>
		{@render parts()}
	</ParameterSlider>
{:else}
	<ParameterSlider bind:value={() => parentValue ?? 0, () => {}} {...sliderProps}>
		{@render parts()}
	</ParameterSlider>
{/if}
