<script lang="ts">
	import './global.css';
	import ViewportC from "$lib/components/viewport/viewportC.svelte";
	import { browser } from '$app/environment';
	import Menubar from '$lib/components/menubar/menubar.svelte';
</script>

{#if browser}
	<ViewportC />
{/if}

<Menubar />