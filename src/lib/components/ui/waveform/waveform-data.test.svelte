<script lang="ts">
	import { untrack } from "svelte";

	interface Props {
		/** Runs the hook under test during setup. */
		setup: () => void;
	}

	let props: Props = $props();

	untrack(() => {
		props.setup();
	});
</script>
