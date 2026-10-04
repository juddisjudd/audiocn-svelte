<script lang="ts">
	import GithubLogoIcon from "phosphor-svelte/lib/GithubLogoIcon";
	import SearchBox from "#lib/themes/docs/SearchBox.svelte";
	import ThemeToggle from "#lib/themes/docs/ThemeToggle.svelte";
	import { REPO_URL } from "#lib/site.js";
	import Brand from "./brand.svelte";
	import ThemePicker from "./theme-picker.svelte";

	let { onSearch }: { onSearch: () => void } = $props();
</script>

<header>
	<div class="topbar">
		<Brand />
		<div class="actions">
			<div class="search-wrap">
				<SearchBox onOpen={onSearch} />
			</div>
			<ThemePicker
				class="hidden h-[2.2rem] rounded-lg border-(--line) bg-(--bg-soft)/88 text-(--text) sm:flex"
			/>
			<ThemeToggle />
			{#if REPO_URL}
				<a class="repo" href={REPO_URL} target="_blank" rel="noreferrer" aria-label="GitHub">
					<GithubLogoIcon />
				</a>
			{/if}
		</div>
	</div>
</header>

<style>
	header {
		position: sticky;
		top: 0;
		z-index: 40;
		background: color-mix(in srgb, var(--bg) 78%, transparent);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--line-strong);
		box-shadow: var(--shadow-bar);
	}

	.topbar {
		padding: 0.65rem 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		color: var(--text);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.search-wrap {
		width: min(11rem, 40vw);
	}

	.repo {
		width: 2.2rem;
		height: 2.2rem;
		display: grid;
		place-items: center;
		border-radius: 0.5rem;
		border: 1px solid var(--line);
		background: color-mix(in srgb, var(--bg-soft) 88%, transparent);
		color: var(--text);
		transition: color 0.16s ease;
	}

	.repo:hover {
		color: var(--brand-soft);
	}

	.repo :global(svg) {
		width: 1.15rem;
		height: 1.15rem;
	}

	@media (max-width: 560px) {
		.search-wrap {
			width: 2.4rem;
		}
	}
</style>
