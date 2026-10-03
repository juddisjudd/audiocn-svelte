<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type KnobDialProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
</script>

<script lang="ts">
	import { useKnob } from "./knob-context.svelte.js";
	import {
		VIEWBOX,
		angleFor,
		dragAngle,
		dragPosition,
		incrementFor,
		keyTarget,
		type DragState,
	} from "./knob-utils.js";

	type DialEvent<E extends Event> = E & { currentTarget: EventTarget & HTMLDivElement };

	let {
		ref = $bindable(null),
		class: className,
		children,
		ondblclick,
		onkeydown,
		onlostpointercapture,
		onpointerdown,
		onpointermove,
		onpointerup,
		...restProps
	}: KnobDialProps = $props();

	const knob = useKnob("KnobDial");
	let drag: DragState | null = null;
	let dragging = $state(false);

	const reset = () => {
		knob.change(knob.resetValue, { reason: "reset" });
		knob.commit(knob.resetValue);
	};

	// A non-passive listener blocks scrolling, so only attach one when the
	// wheel is allowed.
	$effect(() => {
		const element = ref;
		if (!(element && knob.allowWheel)) {
			return;
		}
		const listener = (event: WheelEvent) => {
			// Shift turns the wheel sideways on some systems.
			const delta = event.deltaY || event.deltaX;
			if (knob.disabled || document.activeElement !== element || delta === 0) {
				return;
			}
			event.preventDefault();
			const fine = event.shiftKey || event.altKey;
			const increment = fine ? knob.fineStep : knob.step;
			const direction = delta < 0 ? 1 : -1;
			const next = knob.quantize(knob.value + direction * increment, increment);
			knob.change(next, { event, reason: "wheel" });
			knob.commit(next);
		};
		element.addEventListener("wheel", listener, { passive: false });
		return () => {
			element.removeEventListener("wheel", listener);
		};
	});

	const handleDoubleClick = (event: DialEvent<MouseEvent>) => {
		ondblclick?.(event);
		if (!knob.disabled) {
			reset();
		}
	};

	const handleKeyDown = (event: DialEvent<KeyboardEvent>) => {
		onkeydown?.(event);
		if (knob.disabled) {
			return;
		}
		if (event.key === "Enter") {
			event.preventDefault();
			knob.setEditing(true);
			return;
		}
		const increment = incrementFor(event, knob);
		const next = keyTarget(event.key, knob.value, increment, knob);
		if (next === null) {
			return;
		}
		event.preventDefault();
		const quantized = knob.quantize(next, Math.min(increment, knob.step));
		knob.change(quantized, { event, reason: "keyboard" });
		knob.commit(quantized);
	};

	const handlePointerDown = (event: DialEvent<PointerEvent>) => {
		onpointerdown?.(event);
		if (knob.disabled || event.button !== 0) {
			return;
		}
		if (event.altKey) {
			event.preventDefault();
			reset();
			return;
		}
		const element = event.currentTarget;
		element.setPointerCapture(event.pointerId);
		element.focus();
		drag = {
			angle: dragAngle(event, element, knob.dragDirection),
			position: knob.taper.toPosition(knob.value),
			x: event.clientX,
			y: event.clientY,
		};
		dragging = true;
	};

	const handlePointerMove = (event: DialEvent<PointerEvent>) => {
		onpointermove?.(event);
		const last = drag;
		if (!last) {
			return;
		}
		const angle = dragAngle(event, event.currentTarget, knob.dragDirection);
		const next = dragPosition(event, last, angle, knob, knob.arc);
		drag = {
			angle,
			position: next,
			x: event.clientX,
			y: event.clientY,
		};
		const increment = event.shiftKey ? knob.fineStep : knob.step;
		knob.change(knob.quantize(knob.taper.toValue(next), increment), {
			event,
			reason: "drag",
		});
	};

	const endDrag = (event: DialEvent<PointerEvent>) => {
		if (!drag) {
			return;
		}
		drag = null;
		dragging = false;
		const element = event.currentTarget;
		if (element.hasPointerCapture(event.pointerId)) {
			element.releasePointerCapture(event.pointerId);
		}
		knob.commit(knob.value);
	};

	const handlePointerUp = (event: DialEvent<PointerEvent>) => {
		onpointerup?.(event);
		endDrag(event);
	};

	const handleLostPointerCapture = (event: DialEvent<PointerEvent>) => {
		onlostpointercapture?.(event);
		endDrag(event);
	};
</script>

<div
	bind:this={ref}
	aria-disabled={knob.disabled || undefined}
	aria-labelledby={knob.labelId}
	aria-valuemax={knob.max}
	aria-valuemin={knob.min}
	aria-valuenow={knob.value}
	aria-valuetext={knob.format(knob.value)}
	class={cn(
		"relative size-(--knob-size) cursor-grab touch-none rounded-full outline-none aria-disabled:cursor-default data-dragging:cursor-grabbing",
		className
	)}
	data-dragging={dragging ? "" : undefined}
	data-slot="knob-dial"
	ondblclick={handleDoubleClick}
	onkeydown={handleKeyDown}
	onlostpointercapture={handleLostPointerCapture}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	role="slider"
	style:--knob-angle="{angleFor(knob.position, knob.arc)}deg"
	tabindex={knob.disabled ? -1 : 0}
	{...restProps}
>
	<svg aria-hidden="true" class="size-full overflow-visible" viewBox="0 0 {VIEWBOX} {VIEWBOX}">
		{@render children?.()}
	</svg>
</div>
