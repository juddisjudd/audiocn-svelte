<script lang="ts">
	import MoonIcon from "phosphor-svelte/lib/MoonIcon";
	import SunIcon from "phosphor-svelte/lib/SunIcon";
	import { toggleMode } from "mode-watcher";
	import { Button } from "#lib/components/ui/button/index.js";
</script>

<Button
	variant="ghost"
	size="icon"
	aria-label="Toggle dark mode"
	title="Toggle dark mode (D)"
	onclick={toggleMode}
>
	<SunIcon class="hidden dark:block" />
	<MoonIcon class="dark:hidden" />
</Button>
