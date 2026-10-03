import { getContext, setContext } from "svelte";

export type AudioDeviceStatus = "available" | "unavailable" | "permission-required";

export type AudioDevicePermission = "granted" | "prompt" | "denied";

export interface AudioDevice {
	id: string;
	label: string;
	isDefault?: boolean;
	status?: AudioDeviceStatus;
	description?: string;
}

export interface DeviceItem {
	value: string;
	label: string;
	device?: AudioDevice;
	missing?: boolean;
	none?: boolean;
}

export interface AudioDeviceSelectContext {
	readonly items: DeviceItem[];
	readonly loading: boolean;
	readonly permission: AudioDevicePermission;
	readonly missing: boolean;
	readonly onRequestPermission?: () => void;
}

const AUDIO_DEVICE_SELECT_KEY = Symbol("audiocn.audio-device-select");

export const setAudioDeviceSelect = (context: AudioDeviceSelectContext): AudioDeviceSelectContext =>
	setContext(AUDIO_DEVICE_SELECT_KEY, context);

export const useAudioDeviceSelect = (part: string): AudioDeviceSelectContext => {
	const context = getContext<AudioDeviceSelectContext | undefined>(AUDIO_DEVICE_SELECT_KEY);
	if (!context) {
		throw new Error(`${part} must be used inside AudioDeviceSelect.`);
	}
	return context;
};
