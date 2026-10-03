<script lang="ts">
	import GithubLogoIcon from "phosphor-svelte/lib/GithubLogoIcon";
	import { page } from "$app/state";
	import { buttonVariants } from "#lib/components/ui/button/index.js";
	import { cn } from "#lib/utils.js";
	import { withBase, withoutBase } from "../paths.js";
	import { siteConfig } from "../site.js";
	import Brand from "./brand.svelte";
	import ModeToggle from "./mode-toggle.svelte";
	import ThemePicker from "./theme-picker.svelte";

	const LINKS = [
		{ href: "/docs", label: "Docs" },
		{ href: "/docs/components", label: "Components" },
		{ href: "/docs/blocks", label: "Blocks" },
	];

	const pathname = $derived(withoutBase(page.url.pathname));
	const onDocs = $derived(pathname === "/docs" || pathname.startsWith("/docs/"));

	const isActive = (href: string) => {
		const nested = LINKS.some(
			(link) => link.href !== href && link.href.startsWith(href) && pathname.startsWith(link.href)
		);
		return !nested && (pathname === href || pathname.startsWith(`${href}/`));
	};
</script>

<header
	class="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60"
>
	<div class="mx-auto flex h-14 w-full max-w-360 items-center gap-2 px-4 sm:px-6">
		<Brand class="me-2" />
		<nav aria-label="Main" class="hidden items-center gap-1 text-sm md:flex">
			{#each LINKS as link (link.href)}
				<a
					href={withBase(link.href)}
					aria-current={isActive(link.href) ? "page" : undefined}
					class="rounded-md px-2.5 py-1.5 font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:text-primary"
				>
					{link.label}
				</a>
			{/each}
		</nav>
		<div class="ms-auto flex items-center gap-1">
			<!-- The home page has its own theme swatches. -->
			{#if onDocs}
				<ThemePicker class="hidden sm:flex" />
			{/if}
			{#if siteConfig.githubUrl}
				<a
					href={siteConfig.githubUrl}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="GitHub"
					class={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
				>
					<GithubLogoIcon />
				</a>
			{/if}
			<ModeToggle />
		</div>
	</div>
</header>
