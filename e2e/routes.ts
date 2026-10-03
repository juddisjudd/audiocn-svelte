import { readdirSync } from "node:fs";
import path from "node:path";

const collectPages = (dir: string, prefix = "/docs"): string[] =>
	readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		if (entry.isDirectory()) {
			return collectPages(path.join(dir, entry.name), `${prefix}/${entry.name}`);
		}
		if (!entry.name.endsWith(".md")) {
			return [];
		}
		const slug = entry.name.replace(/\.md$/u, "");
		return [slug === "index" ? prefix : `${prefix}/${slug}`];
	});

export const docsPages = collectPages(path.join(process.cwd(), "src/content/docs")).toSorted();
export const publicPages = ["/", ...docsPages];
