<script lang="ts">
	import './global.css';
	import ViewportC from "$lib/components/viewport/viewportC.svelte";
	import { browser } from '$app/environment';
	import Menubar from '$lib/components/menubar/menubar.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
</script>

<Toaster position="bottom-center" />

{#if browser}
	<ViewportC />
{/if}

<Menubar />