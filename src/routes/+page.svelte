<script lang="ts">
	import './global.css';
	import ViewportC from "$lib/components/viewport/viewportC.svelte";
	import { browser } from '$app/environment';
	import Menubar from '$lib/components/menubar/menubar.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
    import viewport from '$lib/state/viewport.svelte';

	const title = $derived("Twig" + (!viewport.givenName ? "" : " | " + viewport.givenName));
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<Toaster position="bottom-center" />

{#if browser}
	<ViewportC />
{/if}

<Menubar />