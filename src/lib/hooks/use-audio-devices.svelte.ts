import { extract, type MaybeGetter } from "runed";

export type AudioDeviceKind = "audioinput" | "audiooutput";

export type AudioPermission = "granted" | "prompt" | "denied" | "unsupported";

export interface AudioDeviceInfo {
	id: string;
	label: string;
	kind: AudioDeviceKind;
	groupId: string;
	isDefault: boolean;
}

export interface UseAudioDevicesOptions {
	/** Which devices to list. Default `audioinput`. */
	kind?: AudioDeviceKind;
}

export interface UseAudioDevicesResult {
	readonly devices: AudioDeviceInfo[];
	readonly permission: AudioPermission;
	readonly isLoading: boolean;
	readonly error: Error | null;
	refresh: () => Promise<void>;
	/** Asks for microphone access so device labels become readable. */
	requestPermission: () => Promise<boolean>;
}

const DEFAULT_DEVICE_ID = "default";

const fallbackLabel = (kind: AudioDeviceKind, index: number) =>
	`${kind === "audioinput" ? "Microphone" : "Speaker"} ${index + 1}`;

const hasMediaDevices = () =>
	typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.enumerateDevices);

const toError = (caught: unknown) => (caught instanceof Error ? caught : new Error(String(caught)));

const listDevices = async (kind: AudioDeviceKind) => {
	const all = await navigator.mediaDevices.enumerateDevices();
	const matching = all.filter((device) => device.kind === kind);
	return {
		devices: matching.map((device, index) => ({
			groupId: device.groupId,
			id: device.deviceId,
			isDefault: device.deviceId === DEFAULT_DEVICE_ID,
			kind,
			label: device.label || fallbackLabel(kind, index),
		})),
		labelled: matching.some((device) => device.label !== ""),
	};
};

const queryMicrophonePermission = async (): Promise<PermissionStatus | null> => {
	try {
		return (
			(await navigator.permissions?.query({
				name: "microphone" as PermissionName,
			})) ?? null
		);
	} catch {
		// Some browsers cannot query microphone permission; labels tell us instead.
		return null;
	}
};

/**
 * Lists audio devices and keeps the list current as devices come and go.
 * Call it during component setup.
 */
export const useAudioDevices = (
	options: MaybeGetter<UseAudioDevicesOptions> = {}
): UseAudioDevicesResult => {
	const kind = $derived(extract(options).kind ?? "audioinput");
	let devices = $state.raw<AudioDeviceInfo[]>([]);
	let permissionState = $state<AudioPermission>("prompt");
	let loaded = $state(false);
	let failure = $state.raw<Error | null>(null);

	const listKind = async (current: AudioDeviceKind) => {
		if (!hasMediaDevices()) {
			return;
		}
		try {
			const result = await listDevices(current);
			if (result.labelled) {
				permissionState = "granted";
			}
			devices = result.devices;
			failure = null;
		} catch (error) {
			failure = toError(error);
		}
		loaded = true;
	};

	const refresh = () => listKind(kind);

	const requestPermission = async () => {
		if (!hasMediaDevices()) {
			return false;
		}
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			for (const track of stream.getTracks()) {
				track.stop();
			}
			permissionState = "granted";
			await refresh();
			return true;
		} catch (error) {
			const denied = error instanceof DOMException && error.name === "NotAllowedError";
			permissionState = denied ? "denied" : "prompt";
			failure = toError(error);
			return false;
		}
	};

	$effect(() => {
		const current = kind;
		if (!hasMediaDevices()) {
			return;
		}
		let disposed = false;
		const listeners = new AbortController();
		const watch = async () => {
			await listKind(current);
			const status = await queryMicrophonePermission();
			if (!status || disposed) {
				return;
			}
			permissionState = status.state;
			status.addEventListener(
				"change",
				() => {
					permissionState = status.state;
					listKind(current);
				},
				{ signal: listeners.signal }
			);
		};
		navigator.mediaDevices.addEventListener(
			"devicechange",
			() => {
				listKind(current);
			},
			{ signal: listeners.signal }
		);
		watch();

		return () => {
			disposed = true;
			listeners.abort();
		};
	});

	return {
		get devices() {
			return devices;
		},
		get error() {
			return failure;
		},
		get isLoading() {
			return hasMediaDevices() && !loaded;
		},
		get permission() {
			return hasMediaDevices() ? permissionState : "unsupported";
		},
		refresh,
		requestPermission,
	};
};
