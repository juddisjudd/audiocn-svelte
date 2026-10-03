<script lang="ts">
	import { withBase } from "../paths.js";
	import { siteConfig } from "../site.js";

	const LINK = "text-muted-foreground hover:text-foreground underline-offset-4 hover:underline";
</script>

<footer class="border-t">
	<div
		class="mx-auto flex w-full max-w-360 flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-left"
	>
		<p class="text-sm text-balance text-muted-foreground">
			audiocn-<span class="text-[#ff3e00]">svelte</span> is a Svelte port of
			<a
				href={siteConfig.upstream.url}
				target="_blank"
				rel="noopener noreferrer"
				class="text-foreground underline underline-offset-4">{siteConfig.upstream.name}</a
			>
			by fortysevenfx and orcdev, used under the {siteConfig.upstream.license} licence.
		</p>
		<nav aria-label="Secondary" class="flex flex-wrap items-center gap-4 text-sm">
			<a class={LINK} href={withBase("/docs")}>Docs</a>
			<a class={LINK} href={withBase("/llms.txt")}>llms.txt</a>
			<a class={LINK} href={siteConfig.upstream.site} target="_blank" rel="noopener noreferrer"
				>audiocn.dev</a
			>
		</nav>
	</div>
</footer>
