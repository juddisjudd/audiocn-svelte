<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";
	import type { HTMLButtonAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";

	export type SoundPadMode = "one-shot" | "toggle" | "hold" | "loop";

	export const soundPadVariants = tv({
		base: "group/sound-pad focus-visible:ring-ring/40 relative flex flex-col items-start justify-between gap-2 overflow-hidden rounded-xl p-3 text-left transition-[background-color,box-shadow,transform] outline-none select-none [--pad-accent:var(--primary)] focus-visible:ring-3 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 data-loading:opacity-60 data-playing:ring-2 data-playing:ring-(--pad-accent)",
		variants: {
			size: {
				default: "min-h-24",
				lg: "min-h-32 p-4",
				sm: "min-h-16 p-2",
			},
			variant: {
				default:
					"bg-[color-mix(in_oklch,var(--pad-accent)_14%,var(--muted))] hover:bg-[color-mix(in_oklch,var(--pad-accent)_22%,var(--muted))]",
				ghost: "hover:bg-muted",
				outline: "hover:bg-muted border bg-transparent",
			},
		},
		defaultVariants: { size: "default", variant: "default" },
	});

	export type SoundPadSize = VariantProps<typeof soundPadVariants>["size"];
	export type SoundPadVariant = VariantProps<typeof soundPadVariants>["variant"];

	export type SoundPadProps = WithElementRef<HTMLButtonAttributes> & {
		onTrigger?: () => void;
		onStop?: () => void;
		playing?: boolean;
		/** How presses map to trigger and stop. Default `one-shot`. */
		mode?: SoundPadMode;
		/** Active when the grid enables hotkeys. */
		hotkey?: string;
		/** The sound is not ready yet. */
		loading?: boolean;
		/** A CSS colour for the pad. */
		accent?: string;
		variant?: SoundPadVariant;
		size?: SoundPadSize;
	};

	type PadMouseEvent = MouseEvent & { currentTarget: EventTarget & HTMLButtonElement };
	type PadKeyboardEvent = KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement };
	type PadPointerEvent = PointerEvent & { currentTarget: EventTarget & HTMLButtonElement };
</script>

<script lang="ts">
	import { getSoundPadGridContext, setSoundPadContext } from "./sound-pad-context.svelte.js";

	let {
		ref = $bindable(null),
		onTrigger,
		onStop,
		playing = false,
		mode = "one-shot",
		hotkey,
		loading = false,
		accent,
		variant = "default",
		size = "default",
		disabled,
		class: className,
		style,
		onpointerdown,
		onpointerup,
		onpointerleave,
		onclick,
		onkeydown,
		onkeyup,
		children,
		...restProps
	}: SoundPadProps = $props();

	const grid = getSoundPadGridContext();
	let pressed = $state(false);
	const inactive = $derived(disabled || loading);
	const holding = $derived(mode === "hold");

	const press = () => {
		pressed = true;
		if ((mode === "toggle" || mode === "loop") && playing) {
			onStop?.();
			return;
		}
		onTrigger?.();
	};

	const release = () => {
		pressed = false;
		if (mode === "hold") {
			onStop?.();
		}
	};

	// The grid calls these from its own key listeners, and they read the
	// current props, so the pad registers only when its hotkey or state changes.
	$effect(() => {
		if (!(grid && hotkey) || inactive) {
			return;
		}
		return grid.register(hotkey, { press, release });
	});

	setSoundPadContext({
		get hotkey() {
			return hotkey;
		},
		get playing() {
			return playing;
		},
	});

	const handleClick = (event: PadMouseEvent) => {
		onclick?.(event);
		if (!holding && event.detail === 0) {
			press();
			pressed = false;
		}
	};

	const handleKeyDown = (event: PadKeyboardEvent) => {
		onkeydown?.(event);
		if (holding && (event.key === " " || event.key === "Enter") && !event.repeat) {
			event.preventDefault();
			press();
		}
	};

	const handleKeyUp = (event: PadKeyboardEvent) => {
		onkeyup?.(event);
		if (holding && (event.key === " " || event.key === "Enter")) {
			release();
		}
	};

	const handlePointerDown = (event: PadPointerEvent) => {
		onpointerdown?.(event);
		if (event.button === 0) {
			press();
		}
	};

	const handlePointerLeave = (event: PadPointerEvent) => {
		onpointerleave?.(event);
		if (pressed) {
			release();
		}
	};

	const handlePointerUp = (event: PadPointerEvent) => {
		onpointerup?.(event);
		release();
	};
</script>

<button
	bind:this={ref}
	aria-keyshortcuts={hotkey}
	aria-pressed={mode === "toggle" || mode === "loop" ? playing : undefined}
	class={cn(soundPadVariants({ size, variant }), className)}
	data-loading={loading ? "" : undefined}
	data-mode={mode}
	data-playing={playing ? "" : undefined}
	data-pressed={pressed ? "" : undefined}
	data-slot="sound-pad"
	data-sound-pad=""
	disabled={inactive}
	onclick={handleClick}
	onkeydown={handleKeyDown}
	onkeyup={handleKeyUp}
	onpointerdown={handlePointerDown}
	onpointerleave={handlePointerLeave}
	onpointerup={handlePointerUp}
	style={accent ? `--pad-accent:${accent};${style ?? ""}` : style}
	type="button"
	{...restProps}
>
	{@render children?.()}
</button>
