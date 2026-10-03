<script lang="ts">
	import { Dialog } from "bits-ui";
	import ListIcon from "phosphor-svelte/lib/ListIcon";
	import XIcon from "phosphor-svelte/lib/XIcon";
	import { afterNavigate } from "$app/navigation";
	import { page } from "$app/state";
	import { withoutBase } from "#lib/docs/paths.js";
	import { Button } from "#lib/components/ui/button/index.js";
	import DocsSidebar from "#lib/docs/layout/docs-sidebar.svelte";
	import ThemePicker from "#lib/docs/layout/theme-picker.svelte";

	let { data, children } = $props();

	let menuOpen = $state(false);

	const pathname = $derived(withoutBase(page.url.pathname));
	const current = $derived(
		data.nav.find((item) => item.type === "page" && item.href === pathname)?.title
	);

	afterNavigate(() => {
		menuOpen = false;
	});
</script>

<div class="mx-auto flex w-full max-w-360 flex-1">
	<aside
		class="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-64 shrink-0 overflow-y-auto border-e px-4 py-8 lg:block"
	>
		<DocsSidebar nav={data.nav} {pathname} />
	</aside>

	<div class="flex min-w-0 flex-1 flex-col">
		<div
			class="sticky top-14 z-30 flex h-11 items-center gap-2 border-b bg-background/80 px-2 backdrop-blur supports-backdrop-filter:bg-background/60 lg:hidden"
		>
			<Dialog.Root bind:open={menuOpen}>
				<Dialog.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="ghost" size="sm">
							<ListIcon />
							Menu
						</Button>
					{/snippet}
				</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Overlay
						class="fixed inset-0 z-50 bg-black/40 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
					/>
					<Dialog.Content
						class="fixed inset-y-0 start-0 z-50 flex w-72 max-w-[85vw] flex-col border-e bg-background shadow-lg outline-none data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:animate-in data-[state=open]:slide-in-from-left"
					>
						<div class="flex h-14 items-center justify-between border-b px-4">
							<Dialog.Title class="text-sm font-semibold">Documentation</Dialog.Title>
							<Dialog.Close>
								{#snippet child({ props })}
									<Button {...props} variant="ghost" size="icon-sm" aria-label="Close menu">
										<XIcon />
									</Button>
								{/snippet}
							</Dialog.Close>
						</div>
						<div class="flex-1 overflow-y-auto px-4 py-6">
							<DocsSidebar nav={data.nav} {pathname} />
						</div>
						<div class="border-t p-4">
							<ThemePicker />
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
			{#if current}
				<span class="truncate text-sm text-muted-foreground">{current}</span>
			{/if}
		</div>

		{@render children()}
	</div>
</div>
