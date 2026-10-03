import { untrack } from "svelte";
import { extract, type MaybeGetter } from "runed";

export type MicrophoneStatus = "idle" | "acquiring" | "active" | "denied" | "unavailable" | "error";

export interface UseMicrophoneOptions {
	/** The device to open. Omit for the system default. */
	deviceId?: string | null;
	/** Open the microphone as soon as possible. Default false. */
	enabled?: boolean;
	/** Browser echo cancellation. Default false, so meters show the real signal. */
	echoCancellation?: boolean;
	/** Browser noise suppression. Default false. */
	noiseSuppression?: boolean;
	/** Browser automatic gain control. Default false. */
	autoGainControl?: boolean;
	/** Requested channel count. */
	channelCount?: number;
}

export interface UseMicrophoneResult {
	readonly stream: MediaStream | null;
	readonly status: MicrophoneStatus;
	readonly error: Error | null;
	start: () => Promise<void>;
	stop: () => void;
}

interface MicrophoneResult {
	key: string;
	stream: MediaStream | null;
	status: MicrophoneStatus;
	failure: Error | null;
}

const stopStream = (stream: MediaStream | null) => {
	if (!stream) {
		return;
	}
	for (const track of stream.getTracks()) {
		track.stop();
	}
};

const statusForError = (caught: unknown): MicrophoneStatus => {
	if (!(caught instanceof DOMException)) {
		return "error";
	}
	if (caught.name === "NotAllowedError" || caught.name === "SecurityError") {
		return "denied";
	}
	if (caught.name === "NotFoundError" || caught.name === "OverconstrainedError") {
		return "unavailable";
	}
	return "error";
};

const canOpenMicrophone = () =>
	typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);

const buildConstraints = (
	options: Required<
		Pick<UseMicrophoneOptions, "autoGainControl" | "echoCancellation" | "noiseSuppression">
	> &
		Pick<UseMicrophoneOptions, "channelCount" | "deviceId">
): MediaTrackConstraints => {
	const constraints: MediaTrackConstraints = {
		autoGainControl: options.autoGainControl,
		echoCancellation: options.echoCancellation,
		noiseSuppression: options.noiseSuppression,
	};
	if (options.deviceId) {
		constraints.deviceId = { exact: options.deviceId };
	}
	if (options.channelCount) {
		constraints.channelCount = options.channelCount;
	}
	return constraints;
};

/**
 * Opens a microphone as a `MediaStream`, with browser processing off by
 * default. Call it during component setup. `start()` and `stop()` override
 * `enabled` until it changes.
 */
export const useMicrophone = (
	options: MaybeGetter<UseMicrophoneOptions> = {}
): UseMicrophoneResult => {
	const enabled = $derived(extract(options).enabled ?? false);
	// Reset to null whenever `enabled` changes.
	let manual = $derived.by<boolean | null>(() => {
		void enabled;
		return null;
	});
	const wanted = $derived(manual ?? enabled);
	let result = $state.raw<MicrophoneResult | null>(null);

	const key = $derived.by(() => {
		const {
			autoGainControl = false,
			channelCount,
			deviceId,
			echoCancellation = false,
			noiseSuppression = false,
		} = extract(options);
		return JSON.stringify(
			buildConstraints({
				autoGainControl,
				channelCount,
				deviceId,
				echoCancellation,
				noiseSuppression,
			})
		);
	});

	$effect(() => {
		const currentKey = key;
		if (!(wanted && canOpenMicrophone())) {
			return;
		}
		let cancelled = false;
		const listeners = new AbortController();
		let acquired: MediaStream | null = null;

		const open = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: JSON.parse(currentKey) as MediaTrackConstraints,
				});
				if (cancelled) {
					stopStream(stream);
					return;
				}
				acquired = stream;
				const handleEnded = () => {
					result = {
						failure: null,
						key: currentKey,
						status: "unavailable",
						stream: null,
					};
				};
				for (const track of stream.getAudioTracks()) {
					track.addEventListener("ended", handleEnded, {
						signal: listeners.signal,
					});
				}
				result = { failure: null, key: currentKey, status: "active", stream };
			} catch (error) {
				if (!cancelled) {
					result = {
						failure: error instanceof Error ? error : new Error(String(error)),
						key: currentKey,
						status: statusForError(error),
						stream: null,
					};
				}
			}
		};
		open();

		return () => {
			cancelled = true;
			listeners.abort();
			stopStream(acquired);
			// The stream is dead now; don't hand it out on the next start.
			if (untrack(() => result?.key) === currentKey) {
				result = null;
			}
		};
	});

	const current = $derived.by((): Omit<UseMicrophoneResult, "start" | "stop"> => {
		if (!wanted) {
			return { error: null, status: "idle", stream: null };
		}
		if (!canOpenMicrophone()) {
			return {
				error: new Error("This browser cannot open a microphone."),
				status: "unavailable",
				stream: null,
			};
		}
		if (result?.key !== key) {
			return { error: null, status: "acquiring", stream: null };
		}
		return { error: result.failure, status: result.status, stream: result.stream };
	});

	return {
		get error() {
			return current.error;
		},
		start: async () => {
			manual = true;
			await Promise.resolve();
		},
		get status() {
			return current.status;
		},
		stop: () => {
			manual = false;
		},
		get stream() {
			return current.stream;
		},
	};
};
