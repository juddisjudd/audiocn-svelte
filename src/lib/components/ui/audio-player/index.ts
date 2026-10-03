import Root from "./audio-player.svelte";
import Artwork from "./audio-player-artwork.svelte";
import Controls from "./audio-player-controls.svelte";
import Description from "./audio-player-description.svelte";
import Loop from "./audio-player-loop.svelte";
import Next from "./audio-player-next.svelte";
import Play from "./audio-player-play.svelte";
import Previous from "./audio-player-previous.svelte";
import Rate from "./audio-player-rate.svelte";
import Seek from "./audio-player-seek.svelte";
import SkipBack from "./audio-player-skip-back.svelte";
import SkipForward from "./audio-player-skip-forward.svelte";
import Time from "./audio-player-time.svelte";
import Title from "./audio-player-title.svelte";
import Volume from "./audio-player-volume.svelte";

export { type AudioPlayerProps } from "./audio-player.svelte";
export { type AudioPlayerArtworkProps } from "./audio-player-artwork.svelte";
export { type AudioPlayerButtonProps } from "./audio-player-button.svelte";
export { type AudioPlayerControlsProps } from "./audio-player-controls.svelte";
export { type AudioPlayerDescriptionProps } from "./audio-player-description.svelte";
export { type AudioPlayerLoopProps } from "./audio-player-loop.svelte";
export { type AudioPlayerNextProps } from "./audio-player-next.svelte";
export { type AudioPlayerPlayProps } from "./audio-player-play.svelte";
export { type AudioPlayerPreviousProps } from "./audio-player-previous.svelte";
export { type AudioPlayerRateProps } from "./audio-player-rate.svelte";
export { type AudioPlayerSeekProps } from "./audio-player-seek.svelte";
export { type AudioPlayerSkipProps } from "./audio-player-skip-back.svelte";
export { type AudioPlayerTimeProps, type AudioPlayerTimeType } from "./audio-player-time.svelte";
export { type AudioPlayerTitleProps } from "./audio-player-title.svelte";
export { type AudioPlayerVolumeProps } from "./audio-player-volume.svelte";
export { useAudioPlayerContext } from "./audio-player-context.svelte.js";

export {
	Root,
	Artwork,
	Title,
	Description,
	Controls,
	Play,
	Previous,
	Next,
	SkipBack,
	SkipForward,
	Seek,
	Time,
	Volume,
	Rate,
	Loop,
	//
	Root as AudioPlayer,
	Artwork as AudioPlayerArtwork,
	Title as AudioPlayerTitle,
	Description as AudioPlayerDescription,
	Controls as AudioPlayerControls,
	Play as AudioPlayerPlay,
	Previous as AudioPlayerPrevious,
	Next as AudioPlayerNext,
	SkipBack as AudioPlayerSkipBack,
	SkipForward as AudioPlayerSkipForward,
	Seek as AudioPlayerSeek,
	Time as AudioPlayerTime,
	Volume as AudioPlayerVolume,
	Rate as AudioPlayerRate,
	Loop as AudioPlayerLoop,
};
