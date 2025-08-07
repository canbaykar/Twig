<script lang="ts">
	import './global.css';
	import ViewportC from "$lib/components/viewport/viewportC.svelte";
	import viewport from "$lib/state/viewport.svelte";

	// import grammar from "$lib/state/logic/grammar";
	// console.clear();
	// const parsed = grammar.parse(' (A∧B)→[0] ');
	// console.log(parsed + '');
	// console.log(JSON.stringify(parsed, null, 2));
</script>

<ViewportC {viewport} />