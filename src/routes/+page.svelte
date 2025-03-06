<script lang="ts">
	import './global.css';
	import Viewport from "$lib/components/viewport/viewport.svelte";
	import viewport from "$lib/state/viewport.svelte";

	// import grammar from "$lib/state/logic/grammar";
	// console.clear();
	// const parsed = grammar.parse(' (A∧B)→[0] ');
	// console.log(parsed + '');
	// console.log(JSON.stringify(parsed, null, 2));
</script>

<Viewport {viewport} />