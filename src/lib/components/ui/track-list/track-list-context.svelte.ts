import { getContext, setContext } from "svelte";

export interface TrackListItemContextValue {
	readonly active: boolean;
	readonly playing: boolean;
}

const TRACK_LIST_ITEM_KEY = Symbol("audiocn.track-list-item");
const DEFAULT_ITEM: TrackListItemContextValue = Object.freeze({ active: false, playing: false });

export const setTrackListItemContext = (
	value: TrackListItemContextValue
): TrackListItemContextValue => setContext(TRACK_LIST_ITEM_KEY, value);

export const getTrackListItemContext = (): TrackListItemContextValue =>
	getContext<TrackListItemContextValue | undefined>(TRACK_LIST_ITEM_KEY) ?? DEFAULT_ITEM;
