import Root from "./db-scale.svelte";
import Tick from "./db-scale-tick.svelte";

export { type DbScaleProps } from "./db-scale.svelte";
export { type DbScaleTickProps } from "./db-scale-tick.svelte";
export { thinDbScaleLabels } from "./db-scale-utils.js";

export {
	Root,
	Tick,
	//
	Root as DbScale,
	Tick as DbScaleTick,
};
