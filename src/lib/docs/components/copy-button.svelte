<script lang="ts">
	import CheckIcon from "phosphor-svelte/lib/CheckIcon";
	import CopyIcon from "phosphor-svelte/lib/CopyIcon";
	import XCircleIcon from "phosphor-svelte/lib/XCircleIcon";
	import { Button } from "#lib/components/ui/button/index.js";
	import { cn } from "#lib/utils.js";

	interface Props {
		/** The text to copy, or a function that returns it at click time. */
		text: string | (() => string);
		class?: string;
		label?: string;
	}

	let { text, class: className, label = "Copy" }: Props = $props();

	let copyState = $state<"idle" | "done" | "error">("idle");
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		clearTimeout(timer);
		try {
			await navigator.clipboard.writeText(typeof text === "function" ? text() : text);
			copyState = "done";
		} catch {
			copyState = "error";
		}
		timer = setTimeout(() => (copyState = "idle"), 2000);
	}

	$effect(() => () => clearTimeout(timer));
</script>

<Button
	variant="ghost"
	size="icon-sm"
	aria-label={copyState === "done" ? "Copied" : label}
	data-state={copyState}
	class={cn(
		"size-7 rounded-md text-muted-foreground [&_svg:not([class*='size-'])]:size-3.5",
		className
	)}
	onclick={copy}
>
	{#if copyState === "done"}
		<CheckIcon />
	{:else if copyState === "error"}
		<XCircleIcon />
	{:else}
		<CopyIcon />
	{/if}
</Button>
