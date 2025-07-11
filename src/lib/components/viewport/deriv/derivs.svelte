<script lang="ts">
	import { onDestroy } from "svelte";
	import Node from "./node.svelte";
	import DerivRenderData from "./renderData.svelte";

    onDestroy(() => DerivRenderData.onDestroy());
</script>

{#each DerivRenderData.displayed as data (data)}
    <Node {data}></Node>
{/each}