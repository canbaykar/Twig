<script lang="ts">
	import './global.css';
	import ViewportC from "$lib/components/viewport/viewportC.svelte";
	import viewport from "$lib/state/viewport.svelte";
</script>

<ViewportC {viewport} />