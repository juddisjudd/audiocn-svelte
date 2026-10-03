import { extract, type MaybeGetter } from "runed";

export type SystemAudioStatus =
	"idle" | "prompting" | "active" | "no-audio" | "denied" | "ended" | "unsupported";

export interface UseSystemAudioOptions {
	/** Ask for the whole system's audio, not only a tab. Default true. */
	systemAudio?: boolean;
	/** Offer the current tab in the picker. Default false. */
	preferCurrentTab?: boolean;
}

export interface UseSystemAudioResult {
	/** The browser can capture display media at all. */
	readonly isSupported: boolean;
	readonly stream: MediaStream | null;
	readonly status: SystemAudioStatus;
	readonly error: Error | null;
	start: () => Promise<void>;
	stop: () => void;
}

interface DisplayMediaOptions extends DisplayMediaStreamOptions {
	systemAudio?: "include" | "exclude";
	preferCurrentTab?: boolean;
	selfBrowserSurface?: "include" | "exclude";
}

const isDisplayMediaSupported = () =>
	typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getDisplayMedia === "function";

const stopStream = (stream: MediaStream | null) => {
	if (!stream) {
		return;
	}
	for (const track of stream.getTracks()) {
		track.stop();
	}
};

/**
 * Captures system or tab audio through the browser's screen-share picker.
 * The user must tick "share audio"; browsers differ in what they allow.
 * Call it during component setup.
 */
export const useSystemAudio = (
	options: MaybeGetter<UseSystemAudioOptions> = {}
): UseSystemAudioResult => {
	let stream = $state.raw<MediaStream | null>(null);
	let captureStatus = $state<SystemAudioStatus>("idle");
	let failure = $state.raw<Error | null>(null);
	let streamNow: MediaStream | null = null;
	// The picker in flight, so stop() or a newer start() can drop its result.
	let attempt: { cancelled: boolean } | null = null;

	const stop = () => {
		if (attempt) {
			attempt.cancelled = true;
			attempt = null;
		}
		stopStream(streamNow);
		streamNow = null;
		stream = null;
		captureStatus = "idle";
	};

	const start = async () => {
		if (!isDisplayMediaSupported()) {
			captureStatus = "unsupported";
			return;
		}
		const { systemAudio = true, preferCurrentTab = false } = extract(options);
		if (attempt) {
			attempt.cancelled = true;
		}
		const current = { cancelled: false };
		attempt = current;
		stopStream(streamNow);
		streamNow = null;
		stream = null;
		captureStatus = "prompting";
		failure = null;

		const displayOptions: DisplayMediaOptions = {
			audio: {
				autoGainControl: false,
				echoCancellation: false,
				noiseSuppression: false,
			},
			preferCurrentTab,
			selfBrowserSurface: "exclude",
			systemAudio: systemAudio ? "include" : "exclude",
			video: true,
		};

		try {
			const display = await navigator.mediaDevices.getDisplayMedia(displayOptions);
			if (current.cancelled) {
				stopStream(display);
				return;
			}
			attempt = null;
			for (const track of display.getVideoTracks()) {
				track.stop();
			}
			const audioTracks = display.getAudioTracks();
			if (audioTracks.length === 0) {
				captureStatus = "no-audio";
				return;
			}
			const audio = new MediaStream(audioTracks);
			for (const track of audioTracks) {
				track.addEventListener(
					"ended",
					() => {
						if (streamNow === audio) {
							streamNow = null;
							stream = null;
							captureStatus = "ended";
						}
					},
					{ once: true }
				);
			}
			streamNow = audio;
			stream = audio;
			captureStatus = "active";
		} catch (error) {
			if (current.cancelled) {
				return;
			}
			attempt = null;
			const denied = error instanceof DOMException && error.name === "NotAllowedError";
			captureStatus = denied ? "denied" : "idle";
			failure = error instanceof Error ? error : new Error(String(error));
		}
	};

	// Capture needs a user gesture, so unmounting ends it for good.
	$effect(() => stop);

	return {
		get error() {
			return failure;
		},
		get isSupported() {
			return isDisplayMediaSupported();
		},
		start,
		get status() {
			return isDisplayMediaSupported() ? captureStatus : "unsupported";
		},
		stop,
		get stream() {
			return stream;
		},
	};
};
