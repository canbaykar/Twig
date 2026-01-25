<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		title?: string;
		children?: Snippet;
	}

	const { title, children, ...restProps }: Props = $props();
</script>

<div
	{title}
	class="p-3 pt-0 m-3 relative border-l border-t rounded-tl-xl"
	{...restProps}
>
	{@render children?.()}
</div>