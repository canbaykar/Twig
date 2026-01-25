<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		children?: Snippet;
	}

	const { children }: Props = $props();
</script>

<div class="w-full flex flex-wrap gap-5 p-5">
	{@render children?.()}
</div>