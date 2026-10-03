import Root from "./sound-pad.svelte";
import Grid from "./sound-pad-grid.svelte";
import Icon from "./sound-pad-icon.svelte";
import Label from "./sound-pad-label.svelte";
import Progress from "./sound-pad-progress.svelte";
import Shortcut from "./sound-pad-shortcut.svelte";

export {
	soundPadVariants,
	type SoundPadMode,
	type SoundPadProps,
	type SoundPadSize,
	type SoundPadVariant,
} from "./sound-pad.svelte";
export { type SoundPadGridProps } from "./sound-pad-grid.svelte";
export { type SoundPadProgressProps } from "./sound-pad-progress.svelte";

export {
	Root,
	Grid,
	Icon,
	Label,
	Shortcut,
	Progress,
	//
	Root as SoundPad,
	Grid as SoundPadGrid,
	Icon as SoundPadIcon,
	Label as SoundPadLabel,
	Shortcut as SoundPadShortcut,
	Progress as SoundPadProgress,
};
