<script lang="ts">
	import { Button } from "#lib/components/ui/button/index.js";
	import { THEMES } from "../site-themes.js";
	import { siteTheme } from "../theme.js";
</script>

<!-- Retheme the whole showcase at once, in sync with the navbar picker. -->
<fieldset class="flex flex-wrap items-center gap-1">
	<legend class="sr-only">Colour theme</legend>
	{#each THEMES as theme (theme.value)}
		<Button
			size="xs"
			variant={siteTheme.current === theme.value ? "outline" : "ghost"}
			aria-pressed={siteTheme.current === theme.value}
			onclick={() => (siteTheme.current = theme.value)}
		>
			<span
				aria-hidden="true"
				class="size-2.5 rounded-full bg-(--swatch) ring-1 ring-foreground/15"
				style:--swatch={theme.swatch}
			></span>
			{theme.label}
		</Button>
	{/each}
</fieldset>
