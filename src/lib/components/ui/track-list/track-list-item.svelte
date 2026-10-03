<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "#lib/utils.js";

	export type TrackListItemProps = WithElementRef<HTMLAttributes<HTMLLIElement>> & {
		/** The current track. */
		active?: boolean;
		/** The current track, playing. */
		playing?: boolean;
		disabled?: boolean;
		/** Click, Enter or Space. */
		onSelect?: () => void;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	};

	type ItemMouseEvent = MouseEvent & { currentTarget: EventTarget & HTMLLIElement };
	type ItemKeyboardEvent = KeyboardEvent & { currentTarget: EventTarget & HTMLLIElement };
</script>

<script lang="ts">
	import { createAttachmentKey } from "svelte/attachments";

	import { setTrackListItemContext } from "./track-list-context.svelte.js";

	let {
		ref = $bindable(null),
		active = false,
		playing = false,
		disabled = false,
		onSelect,
		child,
		class: className,
		children,
		onclick,
		onkeydown,
		...restProps
	}: TrackListItemProps = $props();

	setTrackListItemContext({
		get active() {
			return active;
		},
		get playing() {
			return playing;
		},
	});

	const handleClick = (event: ItemMouseEvent) => {
		onclick?.(event);
		const interactive = (event.target as HTMLElement).closest("button, a, input");
		if (!disabled && (!interactive || interactive === event.currentTarget)) {
			onSelect?.();
		}
	};

	const handleKeyDown = (event: ItemKeyboardEvent) => {
		onkeydown?.(event);
		if (event.target !== event.currentTarget || disabled) {
			return;
		}
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onSelect?.();
		}
	};

	const refAttachment = createAttachmentKey();
	const attachRef = (node: HTMLElement) => {
		ref = node;
		return () => {
			ref = null;
		};
	};

	const mergedProps = $derived({
		"data-active": active ? "" : undefined,
		"data-disabled": disabled ? "" : undefined,
		"data-playing": playing ? "" : undefined,
		"data-slot": "track-list-item",
		"aria-current": active ? ("true" as const) : undefined,
		"aria-disabled": disabled || undefined,
		tabindex: disabled ? -1 : 0,
		...restProps,
		class: cn(
			"group/track-list-item hover:bg-muted/60 focus-visible:ring-ring/30 data-active:bg-muted relative flex min-h-(--track-row-height) cursor-default items-center gap-3 rounded-lg px-2 text-sm transition-colors outline-none focus-visible:ring-3 data-disabled:opacity-50",
			className
		),
		onclick: handleClick,
		onkeydown: handleKeyDown,
		[refAttachment]: attachRef,
	});
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<li {...mergedProps}>
		{@render children?.()}
	</li>
{/if}
