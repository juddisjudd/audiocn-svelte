<script lang="ts">
	import { withBase } from "../paths.js";
	import { siteConfig } from "../site.js";
</script>

<footer>
	<div class="footer-wrap">
		<p>
			audiocn-<span class="svelte">svelte</span> is a Svelte port of
			<a href={siteConfig.upstream.url} target="_blank" rel="noopener noreferrer"
				>{siteConfig.upstream.name}</a
			>
			by fortysevenfx and orcdev, used under the {siteConfig.upstream.license} licence.
		</p>
		<nav aria-label="Secondary">
			<a href={withBase("/docs")}>Docs</a>
			<a href={withBase("/llms.txt")}>llms.txt</a>
			<a href={siteConfig.upstream.site} target="_blank" rel="noopener noreferrer">audiocn.dev</a>
			<a href="https://svocs.dev" target="_blank" rel="noopener noreferrer">Built with svocs</a>
		</nav>
	</div>
</footer>

<style>
	footer {
		border-top: 1px solid var(--line-strong);
		padding: 1rem;
		background: color-mix(in srgb, var(--bg) 78%, transparent);
	}

	.footer-wrap {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem 1.5rem;
		font-size: 0.82rem;
		color: var(--text-dim);
	}

	p {
		margin: 0;
	}

	.svelte {
		color: #ff3e00;
	}

	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	a {
		color: var(--text-dim);
		text-decoration: none;
		transition: color 120ms ease;
	}

	p a {
		color: var(--text-soft);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	a:hover {
		color: var(--brand-soft);
	}
</style>
