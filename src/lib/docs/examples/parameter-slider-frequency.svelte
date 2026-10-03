<script lang="ts">
	import {
		ParameterSlider,
		ParameterSliderControl,
		ParameterSliderHeader,
		ParameterSliderLabel,
		ParameterSliderMarks,
		ParameterSliderValue,
	} from "#lib/components/ui/parameter-slider/index.js";

	const formatHz = (hz: number) =>
		hz >= 1000 ? `${(hz / 1000).toFixed(hz >= 10_000 ? 0 : 1)} kHz` : `${Math.round(hz)} Hz`;

	const marks = [
		{ label: "20", value: 20 },
		{ label: "200", value: 200 },
		{ label: "2k", value: 2000 },
		{ label: "20k", value: 20_000 },
	];
</script>

<ParameterSlider
	class="max-w-sm"
	format={formatHz}
	{marks}
	max={20_000}
	min={20}
	scale="log"
	step={1}
	value={1000}
>
	<ParameterSliderHeader>
		<ParameterSliderLabel>High-pass filter</ParameterSliderLabel>
		<ParameterSliderValue />
	</ParameterSliderHeader>
	<ParameterSliderControl />
	<ParameterSliderMarks />
</ParameterSlider>
