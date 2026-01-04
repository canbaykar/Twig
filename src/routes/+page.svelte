<script lang="ts">
	import './global.css';
	import ViewportC from "$lib/components/viewport/viewportC.svelte";
	import { browser } from '$app/environment';
</script>

{#if browser}
	<ViewportC />
{/if}