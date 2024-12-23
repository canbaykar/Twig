<script lang="ts">
	import type { ViewportState } from "$lib/state/viewport.svelte";
    
    interface Props {
        viewport: ViewportState;
    }
    
    let { viewport }: Props = $props();
    
</script>
