<script lang="ts">
	import type { PageData } from './$types';
	import DocArticle from '#lib/docs/layout/doc-article.svelte';

	let { data }: { data: PageData } = $props();
</script>

<DocArticle {data} path={data.entry.path} />
