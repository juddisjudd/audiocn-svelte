import { readdirSync } from "node:fs";
import path from "node:path";

const collectPages = (dir: string, prefix = "/docs"): string[] =>
	readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		if (entry.isDirectory()) {
			return collectPages(path.join(dir, entry.name), `${prefix}/${entry.name}`);
		}
		if (!/\.(md|svx)$/u.test(entry.name)) {
			return [];
		}
		const slug = entry.name.replace(/\.(md|svx)$/u, "");
		return [slug === "index" ? prefix : `${prefix}/${slug}`];
	});

/** Every svocs content page, plus `/docs`, which renders the introduction. */
export const docsPages = ["/docs", ...collectPages(path.join(process.cwd(), "content"))].toSorted();
export const publicPages = ["/", ...docsPages];
