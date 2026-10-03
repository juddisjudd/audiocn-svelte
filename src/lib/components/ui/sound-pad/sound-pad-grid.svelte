<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import { clamp } from "#lib/audio/decibels.js";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type SoundPadGridProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/**
		 * The most columns. The grid drops columns to keep pads at least
		 * `--pad-min-width` wide (default 5.5rem). Default 4.
		 */
		columns?: number;
		/** Listen for pad hotkeys. Default false. */
		hotkeys?: boolean;
		/** `global` listens on the whole page, never while typing. Default `focus`. */
		hotkeyScope?: "focus" | "global";
	};

	type GridKeyboardEvent = KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement };

	const isTyping = (target: EventTarget | null) =>
		target instanceof HTMLElement &&
		(target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName));

	const moveFocus = (event: GridKeyboardEvent) => {
		// data-sound-pad, not data-slot: a trigger rendering the pad replaces its slot.
		const pads = [...event.currentTarget.querySelectorAll<HTMLElement>("[data-sound-pad]")];
		const index = pads.indexOf(event.target as HTMLElement);
		if (index === -1) {
			return;
		}
		const perRow = Math.max(1, pads.filter((pad) => pad.offsetTop === pads[0]?.offsetTop).length);
		const moves: Record<string, number> = {
			ArrowDown: perRow,
			ArrowLeft: -1,
			ArrowRight: 1,
			ArrowUp: -perRow,
		};
		const offset = moves[event.key];
		if (offset === undefined) {
			return;
		}
		const next = pads[clamp(index + offset, 0, pads.length - 1)];
		if (next) {
			event.preventDefault();
			next.focus();
		}
	};
</script>

<script lang="ts">
	import { type PadHandlers, setSoundPadGridContext } from "./sound-pad-context.svelte.js";

	let {
		ref = $bindable(null),
		columns = 4,
		hotkeys = false,
		hotkeyScope = "focus",
		class: className,
		style,
		children,
		onkeydown,
		onkeyup,
		...restProps
	}: SoundPadGridProps = $props();

	const pads = new Map<string, PadHandlers>();
	const held = new Set<string>();

	const register = (hotkey: string, handlers: PadHandlers) => {
		const key = hotkey.toLowerCase();
		pads.set(key, handlers);
		return () => {
			if (pads.get(key) === handlers) {
				pads.delete(key);
				// A pad going away (disabled, loading, unmounted) mid-hold won't see
				// its keyup, so release it now.
				if (held.delete(key)) {
					handlers.release();
				}
			}
		};
	};

	const handleDown = (key: string, repeat: boolean, target: EventTarget | null) => {
		if (!hotkeys || repeat || isTyping(target)) {
			return false;
		}
		const pad = pads.get(key.toLowerCase());
		if (!pad) {
			return false;
		}
		held.add(key.toLowerCase());
		pad.press();
		return true;
	};

	const handleUp = (key: string) => {
		const normalized = key.toLowerCase();
		if (!held.has(normalized)) {
			return;
		}
		held.delete(normalized);
		pads.get(normalized)?.release();
	};

	$effect(() => {
		if (!hotkeys || hotkeyScope !== "global") {
			return;
		}
		const down = (event: KeyboardEvent) => {
			if (event.metaKey || event.ctrlKey || event.altKey) {
				return;
			}
			if (handleDown(event.key, event.repeat, event.target)) {
				event.preventDefault();
			}
		};
		const up = (event: KeyboardEvent) => {
			handleUp(event.key);
		};
		// Keyups never arrive once the window loses focus or this subscription
		// ends, so release what is held then.
		const releaseHeld = () => {
			for (const key of held) {
				pads.get(key)?.release();
			}
			held.clear();
		};
		document.addEventListener("keydown", down);
		document.addEventListener("keyup", up);
		window.addEventListener("blur", releaseHeld);
		return () => {
			document.removeEventListener("keydown", down);
			document.removeEventListener("keyup", up);
			window.removeEventListener("blur", releaseHeld);
			releaseHeld();
		};
	});

	setSoundPadGridContext({
		get hotkeys() {
			return hotkeys;
		},
		register,
	});

	const handleKeyDown = (event: GridKeyboardEvent) => {
		onkeydown?.(event);
		if (event.defaultPrevented) {
			return;
		}
		const hotkeyPressed =
			hotkeyScope === "focus" &&
			!event.metaKey &&
			!event.ctrlKey &&
			!event.altKey &&
			handleDown(event.key, event.repeat, event.target);
		if (hotkeyPressed) {
			event.preventDefault();
			return;
		}
		moveFocus(event);
	};

	const handleKeyUp = (event: GridKeyboardEvent) => {
		onkeyup?.(event);
		if (hotkeyScope === "focus") {
			handleUp(event.key);
		}
	};

	// Up to `columns` tracks, never narrower than --pad-min-width.
	const columnsStyle = $derived(
		`--pad-columns:repeat(auto-fill, minmax(max(var(--pad-min-width, 5.5rem), calc((100% - ${columns - 1} * var(--pad-gap)) / ${columns})), 1fr));${style ?? ""}`
	);
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	bind:this={ref}
	data-slot="sound-pad-grid"
	role="group"
	style={columnsStyle}
	class={cn("grid grid-cols-(--pad-columns) gap-(--pad-gap) [--pad-gap:0.5rem]", className)}
	onkeydown={handleKeyDown}
	onkeyup={handleKeyUp}
	{...restProps}
>
	{@render children?.()}
</div>
