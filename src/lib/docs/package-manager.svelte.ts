export const PACKAGE_MANAGERS = ["pnpm", "npm", "yarn", "bun"] as const;

export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

const STORAGE_KEY = "packageManager";

const isPackageManager = (value: unknown): value is PackageManager =>
	PACKAGE_MANAGERS.includes(value as PackageManager);

/** The package manager every install command shows, remembered across visits. */
class PackageManagerStore {
	#current = $state<PackageManager>("pnpm");

	get current() {
		return this.#current;
	}

	set current(value: PackageManager) {
		this.#current = value;
		try {
			window.localStorage.setItem(STORAGE_KEY, value);
		} catch {
			// Not persisted; the choice still applies for this visit.
		}
	}

	/** Reads the saved choice. Call once in the browser. */
	sync() {
		try {
			const stored = window.localStorage.getItem(STORAGE_KEY);
			if (isPackageManager(stored)) {
				this.#current = stored;
			}
		} catch {
			// Storage is unavailable; keep the default.
		}
	}
}

export const packageManager = new PackageManagerStore();

export type PackageManagerCommands = Record<PackageManager, string>;

/**
 * Converts an npm or npx command into the equivalent for each package manager.
 * Unrecognised commands are returned as-is for all of them.
 */
export const convertNpmCommand = (command: string): PackageManagerCommands => {
	if (command.startsWith("npm install")) {
		return {
			pnpm: command.replaceAll("npm install", "pnpm add"),
			npm: command,
			yarn: command.replaceAll("npm install", "yarn add"),
			bun: command.replaceAll("npm install", "bun add"),
		};
	}
	if (command.startsWith("npx create-")) {
		return {
			pnpm: command.replace("npx create-", "pnpm create "),
			npm: command,
			yarn: command.replace("npx create-", "yarn create "),
			bun: command.replace("npx", "bunx --bun"),
		};
	}
	if (command.startsWith("npm create")) {
		return {
			pnpm: command.replace("npm create", "pnpm create"),
			npm: command,
			yarn: command.replace("npm create", "yarn create"),
			bun: command.replace("npm create", "bun create"),
		};
	}
	if (command.startsWith("npx")) {
		return {
			pnpm: command.replace("npx", "pnpm dlx"),
			npm: command,
			yarn: command.replace("npx", "yarn dlx"),
			bun: command.replace("npx", "bunx --bun"),
		};
	}
	if (command.startsWith("npm run")) {
		return {
			pnpm: command.replace("npm run", "pnpm"),
			npm: command,
			yarn: command.replace("npm run", "yarn"),
			bun: command.replace("npm run", "bun"),
		};
	}
	return { pnpm: command, npm: command, yarn: command, bun: command };
};
