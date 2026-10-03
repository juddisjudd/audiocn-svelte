import { getContext, setContext } from "svelte";
import { createSubscriber } from "svelte/reactivity";

export type AudioContextStatus = AudioContextState | "unsupported";

const AUDIO_CONTEXT_KEY = Symbol("audiocn.audio-context");

let sharedContext: AudioContext | null = null;

/** The page-wide `AudioContext`, created on first use. Null on the server. */
export const getSharedAudioContext = (): AudioContext | null => {
	if (typeof window === "undefined" || typeof AudioContext === "undefined") {
		return null;
	}
	if (!sharedContext || sharedContext.state === "closed") {
		sharedContext = new AudioContext({ latencyHint: "interactive" });
	}
	return sharedContext;
};

/**
 * Makes every audiocn hook inside the calling component use `context` instead
 * of the shared one. Call it during component setup.
 */
export const setAudioContext = (context: AudioContext): void => {
	setContext(AUDIO_CONTEXT_KEY, context);
};

const GESTURE_EVENTS = ["pointerdown", "keydown", "touchend"] as const;

export interface UseAudioContextResult {
	readonly context: AudioContext | null;
	readonly status: AudioContextStatus;
	/** Resumes a suspended context. Call it from a user gesture. */
	resume: () => Promise<void>;
}

/**
 * The shared (or provided) `AudioContext`. It resumes automatically on the
 * first click or key press, which browsers require before audio can start.
 * Call it during component setup.
 */
export const useAudioContext = (): UseAudioContextResult => {
	const context =
		getContext<AudioContext | undefined>(AUDIO_CONTEXT_KEY) ?? getSharedAudioContext();

	const subscribeStatus = createSubscriber((update) => {
		if (!context) {
			return;
		}
		context.addEventListener("statechange", update);
		return () => {
			context.removeEventListener("statechange", update);
		};
	});

	$effect(() => {
		if (!context) {
			return;
		}
		const resumeOnGesture = async () => {
			if (context.state !== "suspended") {
				return;
			}
			try {
				await context.resume();
			} catch {
				// The browser can still refuse; the next gesture tries again.
			}
		};
		for (const event of GESTURE_EVENTS) {
			document.addEventListener(event, resumeOnGesture, { passive: true });
		}
		return () => {
			for (const event of GESTURE_EVENTS) {
				document.removeEventListener(event, resumeOnGesture);
			}
		};
	});

	return {
		context,
		get status(): AudioContextStatus {
			if (typeof window === "undefined") {
				return "suspended";
			}
			subscribeStatus();
			return context?.state ?? "unsupported";
		},
		resume: async () => {
			if (context && context.state === "suspended") {
				await context.resume();
			}
		},
	};
};
