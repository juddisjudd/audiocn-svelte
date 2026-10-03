import { extract, type MaybeGetter } from "runed";

import { useAudioContext } from "#lib/hooks/use-audio-context.svelte.js";

const DEFAULT_TIME_CONSTANT = 0.01;

export interface UseGainNodeOptions {
	/**
	 * What feeds the node: a `MediaStream` (wrapped in a source node for you)
	 * or any `AudioNode`.
	 */
	input?: MediaStream | AudioNode | null;
	/** Linear gain, ramped so changes never click. Default 1. */
	gain?: number;
	/**
	 * Where the node plays. Leave it out for the speakers, pass `null` to
	 * route it yourself, or pass a node such as a mixer input.
	 */
	destination?: AudioNode | null;
	/** Ramp time constant, in seconds. Default 0.01. */
	timeConstant?: number;
}

const disconnectFrom = (node: AudioNode, target: AudioNode) => {
	try {
		node.disconnect(target);
	} catch {
		// Already disconnected, for example by the node's owner.
	}
};

/**
 * A gain node on the shared AudioContext, wired from `input` to
 * `destination`. Null on the server and without Web Audio. Call it during
 * component setup; the node stays the same for the life of the component.
 */
export const useGainNode = (options: MaybeGetter<UseGainNodeOptions> = {}): GainNode | null => {
	const { context } = useAudioContext();
	const node = context?.createGain() ?? null;
	const gain = $derived(extract(options).gain ?? 1);
	const timeConstant = $derived(extract(options).timeConstant ?? DEFAULT_TIME_CONSTANT);
	const input = $derived(extract(options).input);
	const destination = $derived(extract(options).destination);
	// The first gain is set, not ramped, so a muted node is never heard at
	// unity while it starts.
	let started = false;

	$effect(() => {
		if (!(context && node)) {
			return;
		}
		if (started) {
			node.gain.setTargetAtTime(gain, context.currentTime, timeConstant);
		} else {
			started = true;
			node.gain.setValueAtTime(gain, context.currentTime);
		}
	});

	$effect(() => {
		const current = input;
		if (!(context && node && current)) {
			return;
		}
		const owned = current instanceof MediaStream;
		const source = owned ? context.createMediaStreamSource(current) : current;
		source.connect(node);
		return () => {
			if (owned) {
				source.disconnect();
			} else {
				disconnectFrom(source, node);
			}
		};
	});

	$effect(() => {
		if (!(context && node)) {
			return;
		}
		const target = destination === undefined ? context.destination : destination;
		if (!target) {
			return;
		}
		node.connect(target);
		return () => {
			disconnectFrom(node, target);
		};
	});

	return node;
};
