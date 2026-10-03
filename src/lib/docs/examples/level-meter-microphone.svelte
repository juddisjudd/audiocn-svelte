<script lang="ts">
	import MicrophoneIcon from "phosphor-svelte/lib/MicrophoneIcon";
	import MicrophoneSlashIcon from "phosphor-svelte/lib/MicrophoneSlashIcon";
	import { Button } from "#lib/components/ui/button/index.js";
	import {
		LevelMeter,
		LevelMeterBar,
		LevelMeterChannel,
		LevelMeterChannels,
		LevelMeterClip,
		LevelMeterHold,
		LevelMeterTrack,
		LevelMeterValue,
	} from "#lib/components/ui/level-meter/index.js";
	import { useAudioAnalyser } from "#lib/hooks/use-audio-analyser.svelte.js";
	import { useMicrophone } from "#lib/hooks/use-microphone.svelte.js";

	const microphone = useMicrophone();
	const analyser = useAudioAnalyser(() => microphone.stream);
	const listening = $derived(microphone.status === "active");
</script>

<div class="flex w-full max-w-md flex-col gap-4">
	<LevelMeter aria-label="Microphone level" source={analyser.meter}>
		<LevelMeterChannels>
			<LevelMeterChannel>
				<LevelMeterTrack>
					<LevelMeterBar />
					<LevelMeterHold />
				</LevelMeterTrack>
			</LevelMeterChannel>
		</LevelMeterChannels>
		<LevelMeterValue />
		<LevelMeterClip />
	</LevelMeter>
	<Button
		class="self-start"
		onclick={() => (listening ? microphone.stop() : microphone.start())}
		size="sm"
		variant="outline"
	>
		{#if listening}
			<MicrophoneSlashIcon data-icon="inline-start" />
			Stop microphone
		{:else}
			<MicrophoneIcon data-icon="inline-start" />
			Use my microphone
		{/if}
	</Button>
</div>
