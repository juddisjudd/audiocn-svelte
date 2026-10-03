<script lang="ts">
	import { page } from "$app/state";
	import { Button } from "#lib/components/ui/button/index.js";
	import PageState from "#lib/docs/layout/page-state.svelte";
	import { withBase } from "#lib/docs/paths.js";
	import { siteConfig } from "#lib/docs/site.js";

	const notFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{notFound ? "Page not found" : "Something went wrong"} — {siteConfig.name}</title>
</svelte:head>

{#if notFound}
	<PageState
		title="Page not found"
		description="This page doesn't exist. Browse the documentation to find components, hooks and blocks."
	>
		<Button href={withBase("/docs")}>Browse documentation</Button>
		<Button href={withBase("/")} variant="outline">Go home</Button>
	</PageState>
{:else}
	<PageState title="Something went wrong" description={page.error?.message ?? "Please try again."}>
		<Button href={withBase("/")}>Go home</Button>
	</PageState>
{/if}
