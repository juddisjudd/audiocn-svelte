<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	export type AudioDeviceSelectPermissionProps = WithElementRef<
		Omit<HTMLAttributes<HTMLDivElement>, "children">,
		HTMLDivElement
	> & {
		/** Default: "Allow microphone access to see your devices." */
		message?: string;
		/** Default: "Allow access". */
		actionLabel?: string;
	};
</script>

<script lang="ts">
	import { Button } from "#lib/components/ui/button/index.js";
	import { useAudioDeviceSelect } from "./audio-device-select-context.svelte.js";

	let {
		ref = $bindable(null),
		message,
		actionLabel = "Allow access",
		class: className,
		...restProps
	}: AudioDeviceSelectPermissionProps = $props();

	const context = useAudioDeviceSelect("AudioDeviceSelectPermission");
	const denied = $derived(context.permission === "denied");
	const text = $derived(
		message ??
			(denied
				? "Microphone access is blocked. Allow it in your browser's site settings."
				: "Allow microphone access to see your devices.")
	);
</script>

<div
	bind:this={ref}
	class={cn("flex flex-col items-start gap-2 p-2 text-xs text-muted-foreground", className)}
	data-slot="audio-device-select-permission"
	{...restProps}
>
	<p>{text}</p>
	{#if !denied && context.onRequestPermission}
		<Button onclick={() => context.onRequestPermission?.()} size="xs" variant="outline">
			{actionLabel}
		</Button>
	{/if}
</div>
