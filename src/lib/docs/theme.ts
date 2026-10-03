import { setTheme, theme } from "mode-watcher";
import { DEFAULT_THEME, isTheme, type ThemeName } from "./site-themes.js";

/**
 * The colour theme, shared by the navbar picker and the home page swatches.
 * mode-watcher stores it and sets `data-theme` on `<html>` before first paint;
 * the default theme is stored as an empty value, so no theme selector matches.
 */
export const siteTheme = {
	get current(): ThemeName {
		const value = theme.current;
		return isTheme(value) ? value : DEFAULT_THEME;
	},
	set current(next: ThemeName) {
		setTheme(next === DEFAULT_THEME ? "" : next);
	},
};
