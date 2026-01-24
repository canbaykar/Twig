<script lang="ts">
	import { cn } from '$lib/utils/shadcn';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		caption?: string;
		outerClass?: string;
		children?: Snippet;
		[key: string]: any;
	}

	const { class: class_, outerClass, children, ...restProps }: Props = $props();
</script>

<figure class='prose prose-invert m-0! w-40'>
	<div
		class={cn('flex h-20 w-40 items-center justify-center rounded border', outerClass)}
		{...restProps}
	>
		<div class={cn('flex h-13 w-13 items-center justify-center rounded border', class_)}>
			Aa
		</div>
	</div>
	<figcaption class="m-1!">
		<p class="my-1! prose prose-invert">
			{@render children?.()}
		</p>
		{#if children}
			<div class="w-full border-t my-1"></div>
		{/if}
		{class_}
	</figcaption>
</figure>
