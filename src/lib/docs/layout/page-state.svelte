<script lang="ts">
	import type { Snippet } from "svelte";
	import * as Empty from "#lib/components/ui/empty/index.js";

	interface Props {
		title: string;
		description: string;
		children?: Snippet;
	}

	let { title, description, children }: Props = $props();
</script>

<main class="mx-auto flex w-full max-w-xl flex-1 items-center px-4 py-16">
	<Empty.Root>
		<Empty.Header>
			<Empty.Title>
				<h1>{title}</h1>
			</Empty.Title>
			<Empty.Description>{description}</Empty.Description>
		</Empty.Header>
		<Empty.Content>
			<div class="flex flex-wrap justify-center gap-3">
				{@render children?.()}
			</div>
		</Empty.Content>
	</Empty.Root>
</main>
