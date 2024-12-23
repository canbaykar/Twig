<script lang="ts">
	import Viewport from "$lib/components/viewport/viewport.svelte";
	import viewport from "$lib/state/viewport.svelte";
</script>

<Viewport {viewport} />

<style global>
	@import './global.css';
</style>