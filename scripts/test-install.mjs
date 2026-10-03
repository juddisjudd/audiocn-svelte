// Installs every registry item into fresh SvelteKit apps and type-checks them.
// Run `pnpm registry:build` first.
//
// Two fixtures:
// - kit3: SvelteKit 3, with `#lib` aliases.
// - kit2: SvelteKit 2, with `$lib` aliases, the setup most shadcn-svelte apps have.
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createReadStream, existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const registryDir = path.join(root, "static/r");
const port = 4999;
// shadcn-svelte preset code for the rhea style, stone colours and Phosphor icons.
const preset = "b27Z5c38";
const shadcnSvelte = `shadcn-svelte@${
	JSON.parse(readFileSync(path.join(root, "package.json"), "utf-8")).devDependencies[
		"shadcn-svelte"
	].replace(/^\^/, "")
}`;

if (!existsSync(path.join(registryDir, "index.json"))) {
	console.error("Run `pnpm registry:build` first.");
	process.exit(1);
}

const { items } = JSON.parse(readFileSync(path.join(root, "registry.json"), "utf-8"));
const urls = items.map((item) => `http://localhost:${port}/${item.name}.json`);

const server = createServer((request, response) => {
	const file = path.join(registryDir, path.basename(request.url ?? ""));
	if (!existsSync(file)) {
		response.writeHead(404).end();
		return;
	}
	response.writeHead(200, { "Content-Type": "application/json" });
	createReadStream(file).pipe(response);
});
server.listen(port);
await once(server, "listening");

// Async on purpose: the registry server shares this process, so a blocking
// spawn would stop it from answering the CLI. `confirm` answers every prompt
// with Enter, for `shadcn-svelte init`, which has no --yes flag.
const run = async (command, args, cwd, { confirm = false } = {}) => {
	console.log(`$ ${command} ${args.join(" ")}`);
	const child = spawn(command, args, {
		cwd,
		shell: process.platform === "win32",
		stdio: [confirm ? "pipe" : "inherit", "inherit", "inherit"],
	});
	const timer = confirm ? setInterval(() => child.stdin.write("\r"), 3000) : null;
	const [code] = await once(child, "close");
	clearInterval(timer);
	if (code !== 0) {
		throw new Error(`${command} ${args.join(" ")} failed with ${code}`);
	}
};

const allowEsbuild = (app) => {
	writeFileSync(path.join(app, "pnpm-workspace.yaml"), "allowBuilds:\n  esbuild: true\n");
};

const addTailwindToKit2 = async (app) => {
	await run("pnpm", ["add", "-D", "tailwindcss", "@tailwindcss/vite"], app);
	writeFileSync(
		path.join(app, "vite.config.ts"),
		`import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({ plugins: [tailwindcss(), sveltekit()] });
`
	);
	writeFileSync(path.join(app, "src/app.css"), '@import "tailwindcss";\n');
	writeFileSync(
		path.join(app, "src/routes/+layout.svelte"),
		`<script lang="ts">
	import "../app.css";
	let { children } = $props();
</script>

{@render children()}
`
	);
};

const fixtures = [
	{
		name: "kit3",
		sv: "sv@1",
		addOns: ["--add", "tailwindcss=plugins:none"],
		alias: "#lib",
		css: "src/routes/layout.css",
		setup: async () => {},
	},
	{
		name: "kit2",
		sv: "sv@0.9",
		addOns: ["--no-add-ons"],
		alias: "$lib",
		css: "src/app.css",
		setup: addTailwindToKit2,
	},
];

const installFixture = async (fixture) => {
	const workspace = mkdtempSync(
		path.join(process.env.AUDIOCN_FIXTURE_DIR ?? tmpdir(), `audiocn-svelte-${fixture.name}-`)
	);
	const app = path.join(workspace, "fixture");
	const { alias } = fixture;

	await run(
		"pnpm",
		[
			"dlx",
			fixture.sv,
			"create",
			"fixture",
			"--template",
			"minimal",
			"--types",
			"ts",
			...fixture.addOns,
			"--no-install",
		],
		workspace
	);
	allowEsbuild(app);
	await run("pnpm", ["install"], app);
	await fixture.setup(app);

	await run(
		"pnpm",
		[
			"dlx",
			shadcnSvelte,
			"init",
			"--preset",
			preset,
			"--base-color",
			"stone",
			"--css",
			fixture.css,
			"--components-alias",
			`${alias}/components`,
			"--lib-alias",
			alias,
			"--utils-alias",
			`${alias}/utils`,
			"--hooks-alias",
			`${alias}/hooks`,
			"--ui-alias",
			`${alias}/components/ui`,
		],
		app,
		{ confirm: true }
	);
	await run("pnpm", ["dlx", shadcnSvelte, "add", ...urls, "--yes", "--overwrite"], app);
	await run("pnpm", ["check"], app);
	console.log(`\n[${fixture.name}] installed and type-checked ${urls.length} items in ${app}`);
};

const only = process.env.AUDIOCN_FIXTURE;
try {
	for (const fixture of fixtures.filter((candidate) => !only || only === candidate.name)) {
		await installFixture(fixture);
	}
} finally {
	server.close();
}
