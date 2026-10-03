import { untrack } from "svelte";
import { extract, type MaybeGetter } from "runed";

import { clamp } from "#lib/audio/decibels.js";

export interface MixerChannelState {
	id: string;
	/** Channel gain in dB. */
	gainDb: number;
	muted: boolean;
	solo: boolean;
	/** −1 (left) to 1 (right). */
	pan: number;
	/** Send the channel to the speakers. */
	monitor: boolean;
}

export interface MixerMasterState {
	gainDb: number;
	muted: boolean;
}

export interface MixerState {
	channels: MixerChannelState[];
	master: MixerMasterState;
}

export type MixerChannelInit = Partial<MixerChannelState> & { id: string };

export interface UseMixerOptions {
	/** Initial channels. Missing fields get defaults. */
	channels?: MixerChannelInit[];
	/** Initial master settings. */
	master?: Partial<MixerMasterState>;
	/** Controlled state. */
	state?: MixerState;
	onStateChange?: (state: MixerState) => void;
	/** Save state to `localStorage` under this key. */
	persistKey?: string;
}

export type MixerAction =
	| { type: "replace"; state: MixerState }
	| {
			type: "channel";
			id: string;
			patch: Partial<Omit<MixerChannelState, "id">>;
	  }
	| { type: "solo"; id: string; solo: boolean; exclusive: boolean }
	| { type: "master"; patch: Partial<MixerMasterState> }
	| { type: "add"; channel: MixerChannelInit }
	| { type: "remove"; id: string };

const DEFAULT_MASTER: MixerMasterState = { gainDb: 0, muted: false };

const createChannel = (init: MixerChannelInit): MixerChannelState => ({
	gainDb: 0,
	monitor: false,
	muted: false,
	pan: 0,
	solo: false,
	...init,
});

const createState = (
	channels: MixerChannelInit[] = [],
	master: Partial<MixerMasterState> = {}
): MixerState => ({
	channels: channels.map(createChannel),
	master: { ...DEFAULT_MASTER, ...master },
});

/** The pure mixer reducer, exported for use outside Svelte. */
export const mixerReducer = (state: MixerState, action: MixerAction): MixerState => {
	switch (action.type) {
		case "replace": {
			return action.state;
		}
		case "channel": {
			return {
				...state,
				channels: state.channels.map((channel) => {
					if (channel.id !== action.id) {
						return channel;
					}
					const next = { ...channel, ...action.patch };
					return { ...next, pan: clamp(next.pan, -1, 1) };
				}),
			};
		}
		case "solo": {
			return {
				...state,
				channels: state.channels.map((channel) => {
					if (channel.id === action.id) {
						return { ...channel, solo: action.solo };
					}
					if (action.exclusive && action.solo) {
						return { ...channel, solo: false };
					}
					return channel;
				}),
			};
		}
		case "master": {
			return { ...state, master: { ...state.master, ...action.patch } };
		}
		case "add": {
			if (state.channels.some((channel) => channel.id === action.channel.id)) {
				return state;
			}
			return {
				...state,
				channels: [...state.channels, createChannel(action.channel)],
			};
		}
		case "remove": {
			return {
				...state,
				channels: state.channels.filter((channel) => channel.id !== action.id),
			};
		}
		default: {
			return state;
		}
	}
};

/** Whether a channel is heard: not muted, and soloed if anything is soloed. */
export const isChannelAudible = (state: MixerState, id: string): boolean => {
	const channel = state.channels.find((item) => item.id === id);
	if (!channel || channel.muted) {
		return false;
	}
	const anySolo = state.channels.some((item) => item.solo);
	return !anySolo || channel.solo;
};

const readPersisted = (key: string): MixerState | null => {
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) {
			return null;
		}
		const parsed = JSON.parse(raw) as MixerState;
		return Array.isArray(parsed.channels) && parsed.master ? parsed : null;
	} catch {
		return null;
	}
};

const writePersisted = (key: string, state: MixerState) => {
	try {
		window.localStorage.setItem(key, JSON.stringify(state));
	} catch {
		// Storage can be full or blocked; the mixer keeps working without it.
	}
};

export interface Mixer {
	readonly state: MixerState;
	readonly channels: MixerChannelState[];
	readonly master: MixerMasterState;
	channel: (id: string) => MixerChannelState | undefined;
	setGain: (id: string, gainDb: number) => void;
	setMuted: (id: string, muted: boolean) => void;
	setSolo: (id: string, solo: boolean, options?: { exclusive?: boolean }) => void;
	setPan: (id: string, pan: number) => void;
	setMonitor: (id: string, monitor: boolean) => void;
	setMasterGain: (gainDb: number) => void;
	setMasterMuted: (muted: boolean) => void;
	/** False when muted, or when another channel is soloed. */
	isAudible: (id: string) => boolean;
	/** True when a channel is silenced only because another is soloed. */
	isDimmed: (id: string) => boolean;
	addChannel: (channel: MixerChannelInit) => void;
	removeChannel: (id: string) => void;
	reset: () => void;
}

/**
 * State for a mixer: gain, mute, solo, pan and monitor per channel, plus a
 * master. Call it during component setup. `channels` and `master` set the
 * initial state only; `state`, `onStateChange` and `persistKey` stay live.
 */
export const useMixer = (options: MaybeGetter<UseMixerOptions> = {}): Mixer => {
	const initialOptions = untrack(() => extract(options));
	const initial = createState(initialOptions.channels, initialOptions.master);
	let internal = $state.raw(initial);
	const controlledState = $derived(extract(options).state);
	const controlled = $derived(controlledState !== undefined);
	const persistKey = $derived(extract(options).persistKey);
	const state = $derived(controlledState ?? internal);
	const anySolo = $derived(state.channels.some((channel) => channel.solo));

	const commit = (next: MixerState) =>
		untrack(() => {
			if (next === state) {
				return;
			}
			if (!controlled) {
				internal = next;
				// Saved on change, not from an effect: an effect would also write the
				// defaults on mount, over what the restore below is about to load.
				if (persistKey) {
					writePersisted(persistKey, next);
				}
			}
			extract(options).onStateChange?.(next);
		});

	const dispatch = (action: MixerAction) => {
		commit(
			mixerReducer(
				untrack(() => state),
				action
			)
		);
	};

	$effect(() => {
		if (!persistKey || controlled) {
			return;
		}
		const persisted = readPersisted(persistKey);
		if (persisted) {
			internal = persisted;
		}
	});

	const find = (id: string) => state.channels.find((channel) => channel.id === id);

	return {
		addChannel: (channel) => dispatch({ channel, type: "add" }),
		channel: find,
		get channels() {
			return state.channels;
		},
		isAudible: (id) => isChannelAudible(state, id),
		isDimmed: (id) => {
			const channel = find(id);
			return Boolean(channel && !channel.muted && anySolo && !channel.solo);
		},
		get master() {
			return state.master;
		},
		removeChannel: (id) => dispatch({ id, type: "remove" }),
		reset: () => commit(initial),
		setGain: (id, gainDb) => dispatch({ id, patch: { gainDb }, type: "channel" }),
		setMasterGain: (gainDb) => dispatch({ patch: { gainDb }, type: "master" }),
		setMasterMuted: (muted) => dispatch({ patch: { muted }, type: "master" }),
		setMonitor: (id, monitor) => dispatch({ id, patch: { monitor }, type: "channel" }),
		setMuted: (id, muted) => dispatch({ id, patch: { muted }, type: "channel" }),
		setPan: (id, pan) => dispatch({ id, patch: { pan }, type: "channel" }),
		setSolo: (id, solo, soloOptions = {}) =>
			dispatch({
				exclusive: soloOptions.exclusive ?? false,
				id,
				solo,
				type: "solo",
			}),
		get state() {
			return state;
		},
	};
};
