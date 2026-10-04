<script lang="ts">
	import { mode, setMode } from 'mode-watcher';
	import { tick } from 'svelte';

	type Mode = 'dark' | 'light';

	// mode-watcher owns the mode (the `dark` class on <html>), shared with the
	// home page and the D shortcut. It applies the class a frame late, so the
	// class is also set here, inside the view transition's snapshot window.
	function applyMode(next: Mode) {
		const root = document.documentElement;
		root.classList.toggle('dark', next === 'dark');
		root.style.colorScheme = next;
		setMode(next);
	}

	function toggle() {
		const next: Mode = mode.current === 'dark' ? 'light' : 'dark';
		// The dissolve (#svocs-dissolve filter in the docs layout) needs view
		// transitions and motion allowed; otherwise switch instantly.
		if (
			!document.startViewTransition ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		) {
			applyMode(next);
			return;
		}
		const transition = document.startViewTransition(async () => {
			applyMode(next);
			await tick();
		});
		// The SMIL animations can only start once the snapshot pseudo-elements
		// exist; a fresh turbulence seed varies the pattern per toggle.
		transition.ready
			.then(() => {
				document
					.querySelector('#svocs-dissolve feTurbulence')
					?.setAttribute('seed', String(Math.floor(Math.random() * 1000)));
				for (const anim of document.querySelectorAll<SVGAnimateElement>(
					'#svocs-dissolve animate'
				)) {
					anim.beginElement();
				}
			})
			.catch(() => {
				// transition was skipped — the mode is applied either way
			});
	}
</script>

<button type="button" onclick={toggle} aria-label="Toggle dark mode" title="Toggle dark mode (D)">
	<svg class="moon" viewBox="0 0 16 16" aria-hidden="true">
		<path
			d="M13.4 9.9A5.6 5.6 0 0 1 6.1 2.6 5.6 5.6 0 1 0 13.4 9.9Z"
			fill="none"
			stroke="currentColor"
			stroke-width="1.4"
			stroke-linejoin="round"
		/>
	</svg>
	<svg class="sun" viewBox="0 0 16 16" aria-hidden="true">
		<circle cx="8" cy="8" r="3.1" fill="none" stroke="currentColor" stroke-width="1.4" />
		<path
			d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1"
			stroke="currentColor"
			stroke-width="1.4"
			stroke-linecap="round"
		/>
	</svg>
</button>

<style>
	button {
		width: 2.2rem;
		height: 2.2rem;
		display: grid;
		place-items: center;
		border-radius: 0.5rem;
		border: 1px solid var(--line);
		background: color-mix(in srgb, var(--bg-soft) 88%, transparent);
		color: var(--text);
		cursor: pointer;
		transition:
			transform 0.16s ease,
			color 0.16s ease;
	}

	button:active {
		transform: scale(0.94);
	}

	@media (hover: hover) and (pointer: fine) {
		button:hover {
			color: var(--brand-soft);
		}
	}

	svg {
		width: 1.05rem;
		height: 1.05rem;
	}

	.moon,
	:global(.dark) .sun {
		display: none;
	}

	:global(.dark) .moon {
		display: block;
	}
</style>
