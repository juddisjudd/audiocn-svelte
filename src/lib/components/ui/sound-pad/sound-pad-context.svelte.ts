import { getContext, setContext } from "svelte";

export interface PadHandlers {
	press: () => void;
	release: () => void;
}

export interface SoundPadGridContextValue {
	readonly hotkeys: boolean;
	register: (hotkey: string, handlers: PadHandlers) => () => void;
}

export interface SoundPadContextValue {
	readonly hotkey?: string;
	readonly playing: boolean;
}

const SOUND_PAD_GRID_KEY = Symbol("audiocn.sound-pad-grid");
const SOUND_PAD_KEY = Symbol("audiocn.sound-pad");
const DEFAULT_PAD: SoundPadContextValue = Object.freeze({ playing: false });

export const setSoundPadGridContext = (value: SoundPadGridContextValue): SoundPadGridContextValue =>
	setContext(SOUND_PAD_GRID_KEY, value);

export const getSoundPadGridContext = (): SoundPadGridContextValue | null =>
	getContext<SoundPadGridContextValue | undefined>(SOUND_PAD_GRID_KEY) ?? null;

export const setSoundPadContext = (value: SoundPadContextValue): SoundPadContextValue =>
	setContext(SOUND_PAD_KEY, value);

export const getSoundPadContext = (): SoundPadContextValue =>
	getContext<SoundPadContextValue | undefined>(SOUND_PAD_KEY) ?? DEFAULT_PAD;
