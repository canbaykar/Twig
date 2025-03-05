<script lang="ts">
	import './global.css';
	import Viewport from "$lib/components/viewport/viewport.svelte";
	import viewport from "$lib/state/viewport.svelte";
</script>

<Viewport {viewport} />