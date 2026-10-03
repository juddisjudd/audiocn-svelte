<script lang="ts">
	import {
		ParameterSlider,
		ParameterSliderControl,
		ParameterSliderHeader,
		ParameterSliderLabel,
		ParameterSliderValue,
	} from "#lib/components/ui/parameter-slider/index.js";

	const formatHz = (hz: number) =>
		hz >= 1000 ? `${(hz / 1000).toFixed(hz >= 10_000 ? 0 : 1)} kHz` : `${Math.round(hz)} Hz`;
</script>

<div class="flex w-full flex-col gap-5">
	<ParameterSlider format={formatHz} max={20_000} min={20} scale="log" step={1} value={2400}>
		<ParameterSliderHeader>
			<ParameterSliderLabel>Frequency</ParameterSliderLabel>
			<ParameterSliderValue />
		</ParameterSliderHeader>
		<ParameterSliderControl />
	</ParameterSlider>
	<ParameterSlider decimals={1} max={10} min={0.1} scale="log" step={0.1} value={1.4}>
		<ParameterSliderHeader>
			<ParameterSliderLabel>Q</ParameterSliderLabel>
			<ParameterSliderValue />
		</ParameterSliderHeader>
		<ParameterSliderControl />
	</ParameterSlider>
	<ParameterSlider decimals={1} max={12} min={-12} origin={0} step={0.5} unit="dB" value={3.5}>
		<ParameterSliderHeader>
			<ParameterSliderLabel>Gain</ParameterSliderLabel>
			<ParameterSliderValue />
		</ParameterSliderHeader>
		<ParameterSliderControl />
	</ParameterSlider>
</div>
