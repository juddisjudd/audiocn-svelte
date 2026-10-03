<script lang="ts">
	import {
		ParameterSlider,
		ParameterSliderControl,
		ParameterSliderDescription,
		ParameterSliderHeader,
		ParameterSliderInput,
		ParameterSliderLabel,
		ParameterSliderReset,
	} from "#lib/components/ui/parameter-slider/index.js";

	let offsetMs = $state(0);
</script>

<ParameterSlider
	class="max-w-sm"
	largeStep={50}
	max={1000}
	min={-1000}
	origin={0}
	step={5}
	unit="ms"
	bind:value={offsetMs}
>
	<ParameterSliderHeader>
		<ParameterSliderLabel>Sync offset</ParameterSliderLabel>
		<ParameterSliderReset />
		<ParameterSliderInput />
	</ParameterSliderHeader>
	<ParameterSliderControl />
	<ParameterSliderDescription>
		Delays the microphone to line up with your camera.
	</ParameterSliderDescription>
</ParameterSlider>
