<script lang="ts">
	import ArrowRightIcon from "phosphor-svelte/lib/ArrowRightIcon";
	import { Button } from "#lib/components/ui/button/index.js";
	import { InstallCommand } from "#lib/docs/components/index.js";
	import ShowcaseGrid from "#lib/docs/home/showcase-grid.svelte";
	import ThemeSwatches from "#lib/docs/home/theme-swatches.svelte";
	import { siteConfig } from "#lib/docs/site.js";

	let { data } = $props();
</script>

<svelte:head>
	<title>{siteConfig.title}</title>
	<meta name="description" content={siteConfig.description} />
	<meta property="og:title" content={siteConfig.title} />
	<meta property="og:description" content={siteConfig.description} />
	<link rel="canonical" href={siteConfig.url} />
</svelte:head>

<main class="w-full">
	<section class="relative isolate overflow-hidden px-4 pt-16 pb-20 sm:px-6 lg:pt-24 lg:pb-28">
		<div
			aria-hidden="true"
			class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_50%_45%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent)]"
		></div>
		<div class="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center">
			<a
				href="/docs/components"
				class="group/pill flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors outline-none hover:bg-muted/60 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
			>
				Audio components for shadcn-svelte
				<ArrowRightIcon
					aria-hidden="true"
					class="size-3 transition-transform group-hover/pill:translate-x-0.5"
				/>
			</a>
			<h1
				class="max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl"
			>
				Audio UI, mixed and mastered.
			</h1>
			<p class="max-w-2xl text-base text-balance text-muted-foreground sm:text-lg">
				Meters, faders, knobs, visualizers and a complete mixer for Svelte. Built the shadcn way, so
				you own every line.
			</p>
			<div class="flex flex-wrap justify-center gap-3">
				<Button href="/docs" size="lg">Get started</Button>
				<Button href="/docs/components" size="lg" variant="outline">Browse components</Button>
			</div>
			<div class="w-full max-w-xl text-left">
				<InstallCommand name="mixer" />
			</div>
			<p class="text-sm text-balance text-muted-foreground">
				A Svelte 5 port of
				<a
					href={siteConfig.upstream.url}
					target="_blank"
					rel="noopener noreferrer"
					class="text-foreground underline underline-offset-4">{siteConfig.upstream.name}</a
				>, the React audio components by fortysevenfx and orcdev ({siteConfig.upstream.license}).
			</p>
		</div>
	</section>

	<div class="mx-auto flex w-full max-w-7xl flex-col px-4 pb-24 sm:px-6">
		<div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<p class="text-sm text-muted-foreground">
				Everything here is live. Drag a fader, turn a knob, hit a pad.
			</p>
			<ThemeSwatches />
		</div>
		<ShowcaseGrid />
		<div class="mt-12 flex justify-center">
			<Button href="/docs/components" size="lg" variant="outline">
				{data.componentCount > 0
					? `Browse all ${data.componentCount} components`
					: "Browse components"}
				<ArrowRightIcon data-icon="inline-end" />
			</Button>
		</div>
	</div>
</main>
