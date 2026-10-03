import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig(({ mode }) => ({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			preprocess: [mdsvex({ extensions: ['.svx', '.md'] })],
			extensions: ['.svelte', '.svx', '.md']
		})
	],
	resolve: mode === 'test' ? { conditions: ['browser'] } : undefined,
	test: {
		expect: { requireAssertions: true },
		environment: 'jsdom',
		include: ['src/**/*.test.ts'],
		setupFiles: ['./test/setup.ts']
	}
}));
