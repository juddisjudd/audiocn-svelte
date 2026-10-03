import { getContext, setContext } from "svelte";

import type { Taper } from "#lib/audio/types.js";

import type { KnobChangeDetails, KnobDragDirection } from "./knob-utils.js";

export interface KnobContext {
	/** The current value; event handlers read it as the latest one. */
	readonly value: number;
	readonly position: number;
	readonly originPosition: number;
	readonly arc: number;
	readonly labelId: string;
	readonly disabled: boolean;
	readonly format: (value: number) => string;
	readonly parse: (text: string) => number | null;
	/** Characters in the widest value, for a steady value label. */
	readonly valueWidth: number;
	/** A typed value is being entered in KnobValue. */
	readonly editing: boolean;
	setEditing: (editing: boolean) => void;
	change: (value: number, details: KnobChangeDetails) => void;
	commit: (value: number) => void;
	readonly dragDirection: KnobDragDirection;
	readonly fineStep: number;
	readonly largeStep: number;
	readonly max: number;
	readonly min: number;
	quantize: (value: number, increment: number) => number;
	readonly resetValue: number;
	readonly sensitivity: number;
	readonly step: number;
	readonly taper: Taper;
	readonly allowWheel: boolean;
	/** KnobScale reports its long ticks, so the click sound lands on them. */
	setDetents: (positions: readonly number[] | null) => void;
}

const KNOB_KEY = Symbol("audiocn.knob");

export const setKnob = (context: KnobContext): KnobContext => setContext(KNOB_KEY, context);

export const useKnob = (part: string): KnobContext => {
	const context = getContext<KnobContext | undefined>(KNOB_KEY);
	if (!context) {
		throw new Error(`${part} must be used inside Knob.`);
	}
	return context;
};
