import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Plugin } from "vite";

const execFileAsync = promisify(execFile);

let datesPromise: Promise<Record<string, string>> | undefined;

/**
 * Maps each `content/` file to the date of its last commit (YYYY-MM-DD), for
 * the svocs "Last updated" line. Git history, not mtimes: mtimes reset on
 * every clone. Without history the map is empty and pages show no date.
 */
async function resolveContentDates(): Promise<Record<string, string>> {
	const dates: Record<string, string> = {};
	try {
		const { stdout: root } = await execFileAsync("git", ["rev-parse", "--show-toplevel"], {
			encoding: "utf8",
		});
		const { stdout: log } = await execFileAsync(
			"git",
			["log", "--format=%x00%cI", "--name-only", "--relative", "--", "content"],
			{ cwd: root.trim(), encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
		);
		let commitDate = "";
		for (const line of log.split("\n")) {
			if (line.startsWith("\0")) {
				commitDate = line.slice(1, 11);
			} else if (line.startsWith("content/") && commitDate && !(line in dates)) {
				// The log is newest first, so the first sighting wins.
				dates[line] = commitDate;
			}
		}
	} catch {
		// Not a git repository, or git is unavailable.
	}
	return dates;
}

/** Provides `virtual:svocs-content-dates`, read by `#lib/server/content`. */
export function contentDatesPlugin(): Plugin {
	const virtualId = "virtual:svocs-content-dates";
	const resolvedId = `\0${virtualId}`;
	return {
		name: "svocs-content-dates",
		resolveId: (id) => (id === virtualId ? resolvedId : undefined),
		async load(id) {
			if (id !== resolvedId) {
				return undefined;
			}
			datesPromise ??= resolveContentDates();
			return `export default ${JSON.stringify(await datesPromise)};`;
		},
	};
}
