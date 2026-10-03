<script lang="ts">
	import type { Snippet } from "svelte";
	import CheckCircleIcon from "phosphor-svelte/lib/CheckCircleIcon";
	import InfoIcon from "phosphor-svelte/lib/InfoIcon";
	import LightbulbIcon from "phosphor-svelte/lib/LightbulbIcon";
	import WarningIcon from "phosphor-svelte/lib/WarningIcon";
	import XCircleIcon from "phosphor-svelte/lib/XCircleIcon";
	import { cn } from "#lib/utils.js";

	type CalloutType = "info" | "warn" | "warning" | "error" | "success" | "idea";

	interface Props {
		title?: string;
		type?: CalloutType;
		class?: string;
		children?: Snippet;
	}

	let { title, type = "info", class: className, children }: Props = $props();

	const tone = $derived(type === "warning" ? "warn" : type);

	const ICONS = {
		info: InfoIcon,
		warn: WarningIcon,
		error: XCircleIcon,
		success: CheckCircleIcon,
		idea: LightbulbIcon,
	};

	const Icon = $derived(ICONS[tone]);
</script>

<div
	role="note"
	data-slot="callout"
	data-type={tone}
	class={cn(
		"my-6 flex gap-3 rounded-xl border bg-card p-4 text-sm text-card-foreground",
		"[--callout:var(--primary)] data-[type=error]:[--callout:var(--destructive)] data-[type=success]:[--callout:var(--meter-ok)] data-[type=warn]:[--callout:var(--meter-warn)]",
		className
	)}
>
	<Icon aria-hidden="true" weight="fill" class="mt-0.5 size-4 shrink-0 text-(--callout)" />
	<div class="flex min-w-0 flex-1 flex-col gap-1">
		{#if title}
			<div class="font-medium">{title}</div>
		{/if}
		<div class="callout-body text-muted-foreground">
			{@render children?.()}
		</div>
	</div>
</div>
