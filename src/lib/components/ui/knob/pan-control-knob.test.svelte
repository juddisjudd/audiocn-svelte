<script lang="ts" module>
	const PERCENT = 100;
	const CENTER_TEXT = /^c(?:enter|entre)?$/iu;
	const SIDE_PREFIX = /^[LR]/iu;

	const formatPan = (value: number): string => {
		const amount = Math.round(Math.abs(value) * PERCENT);
		if (amount === 0) {
			return "C";
		}
		return `${value < 0 ? "L" : "R"}${amount}`;
	};

	const parsePan = (text: string): number | null => {
		const trimmed = text.trim().replaceAll("−", "-");
		if (CENTER_TEXT.test(trimmed)) {
			return 0;
		}
		const side = SIDE_PREFIX.test(trimmed) ? trimmed[0]?.toUpperCase() : null;
		const digits = (side ? trimmed.slice(1) : trimmed).trim();
		const amount = Number(digits) / PERCENT;
		if (digits === "" || Number.isNaN(amount)) {
			return null;
		}
		return side === "L" ? -Math.abs(amount) : amount;
	};

	const describePan = (value: number): string => {
		const amount = Math.round(Math.abs(value) * PERCENT);
		if (amount === 0) {
			return "Center";
		}
		return `${amount}% ${value < 0 ? "left" : "right"}`;
	};
</script>

<script lang="ts">
	import { setAudioConfig } from "#lib/hooks/use-audio-config.svelte.js";
	import {
		Knob,
		KnobDial,
		KnobLabel,
		KnobPointer,
		KnobRange,
		KnobTrack,
		KnobValue,
	} from "./index.js";

	let { disabled = false }: { disabled?: boolean } = $props();

	setAudioConfig(() => (disabled ? { disabled: true } : {}));

	let pan = $state(0);
</script>

<Knob
	bind:value={pan}
	format={formatPan}
	largeStep={0.25}
	max={1}
	min={-1}
	origin={0}
	parse={parsePan}
	resetValue={0}
	step={0.05}
>
	<KnobDial aria-valuetext={describePan(pan)}>
		<KnobTrack />
		<KnobRange />
		<KnobPointer />
	</KnobDial>
	<KnobValue />
	<KnobLabel>Pan</KnobLabel>
</Knob>
