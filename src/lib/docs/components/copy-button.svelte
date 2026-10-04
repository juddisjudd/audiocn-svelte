<script lang="ts">
	import CheckIcon from "phosphor-svelte/lib/CheckIcon";
	import CopyIcon from "phosphor-svelte/lib/CopyIcon";
	import XCircleIcon from "phosphor-svelte/lib/XCircleIcon";

	interface Props {
		/** The text to copy, or a function that returns it at click time. */
		text: string | (() => string);
		label?: string;
	}

	let { text, label = "Copy" }: Props = $props();

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

<!-- Styled like the svocs code-copy button, with shadcn fallbacks outside the docs. -->
<button
	type="button"
	data-slot="copy-button"
	data-state={copyState}
	aria-label={copyState === "done" ? "Copied" : label}
	onclick={copy}
>
	{#if copyState === "done"}
		<CheckIcon />
	{:else if copyState === "error"}
		<XCircleIcon />
	{:else}
		<CopyIcon />
	{/if}
</button>

<style>
	button {
		display: grid;
		place-items: center;
		width: 1.9rem;
		height: 1.9rem;
		padding: 0;
		border: 1px solid var(--line, var(--border));
		border-radius: 0.4rem;
		background: color-mix(in srgb, var(--bg-elev, var(--background)) 85%, transparent);
		color: var(--text-dim, var(--muted-foreground));
		cursor: pointer;
		transition: color 120ms ease;
	}

	button:hover {
		color: var(--brand-soft, var(--foreground));
	}

	button[data-state="done"] {
		color: var(--brand-strong, var(--foreground));
	}

	button:focus-visible {
		outline: 2px solid var(--brand, var(--ring));
		outline-offset: 2px;
	}

	button :global(svg) {
		width: 0.9rem;
		height: 0.9rem;
	}
</style>
