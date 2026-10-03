<script lang="ts">
	import * as Select from "#lib/components/ui/select/index.js";
	import { cn } from "#lib/utils.js";
	import { isTheme, THEMES } from "../site-themes.js";
	import { siteTheme } from "../theme.js";

	let { class: className }: { class?: string } = $props();

	const selected = $derived(THEMES.find((theme) => theme.value === siteTheme.current) ?? THEMES[0]);
</script>

<Select.Root
	type="single"
	value={siteTheme.current}
	onValueChange={(next) => {
		if (isTheme(next)) {
			siteTheme.current = next;
		}
	}}
>
	<Select.Trigger aria-label="Colour theme" size="sm" class={cn("w-28", className)}>
		<span data-slot="select-value">
			<span
				aria-hidden="true"
				class="size-3 rounded-full bg-(--swatch)"
				style:--swatch={selected.swatch}
			></span>
			{selected.label}
		</span>
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			{#each THEMES as theme (theme.value)}
				<Select.Item value={theme.value} label={theme.label}>
					<span
						aria-hidden="true"
						class="size-3 rounded-full bg-(--swatch)"
						style:--swatch={theme.swatch}
					></span>
					{theme.label}
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>
