import Root from "./track-list.svelte";
import Item from "./track-list-item.svelte";
import ItemActions from "./track-list-item-actions.svelte";
import ItemArtwork from "./track-list-item-artwork.svelte";
import ItemContent from "./track-list-item-content.svelte";
import ItemDescription from "./track-list-item-description.svelte";
import ItemDuration from "./track-list-item-duration.svelte";
import ItemIndex from "./track-list-item-index.svelte";
import ItemTitle from "./track-list-item-title.svelte";

export {
	trackListVariants,
	type TrackListProps,
	type TrackListSize,
	type TrackListVariant,
} from "./track-list.svelte";
export { type TrackListItemProps } from "./track-list-item.svelte";

export {
	Root,
	Item,
	ItemIndex,
	ItemArtwork,
	ItemContent,
	ItemTitle,
	ItemDescription,
	ItemDuration,
	ItemActions,
	//
	Root as TrackList,
	Item as TrackListItem,
	ItemIndex as TrackListItemIndex,
	ItemArtwork as TrackListItemArtwork,
	ItemContent as TrackListItemContent,
	ItemTitle as TrackListItemTitle,
	ItemDescription as TrackListItemDescription,
	ItemDuration as TrackListItemDuration,
	ItemActions as TrackListItemActions,
};
