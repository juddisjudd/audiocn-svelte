<script lang="ts">
	import { DbScale } from "#lib/components/ui/db-scale/index.js";
</script>

<div class="grid w-full max-w-md gap-8">
	<DbScale />
	<DbScale maxDb={6} minDb={-48} taper="audio" />
</div>
