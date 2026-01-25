<script lang="ts">
	import { cn } from '$lib/utils/shadcn';
	import type { Snippet } from 'svelte';
	import PreviewInner from './previewInner.svelte';

	interface Props {
		title?: string;
		class?: string;
		outerClass?: string;
		full?: boolean;
		showClass?: boolean;
		children?: Snippet;
		[key: string]: any;
	}

	const {
		title,
		class: class_,
		outerClass,
		full,
		showClass = false,
		children,
		...restProps
	}: Props = $props();
</script>

<figure class="prose prose-invert m-0! flex flex-col {full ? 'w-full' : 'w-min'}">
	<div
		class={cn('flex items-center justify-center rounded border px-12 py-3 bg-bg', outerClass)}
		title={outerClass}
	>
		<PreviewInner class={class_} {...restProps}>
			{@render children?.()}
		</PreviewInner>
	</div>
	<figcaption class="m-1!">
		{#if title}
			<p class="prose prose-invert my-0! text-center">
				{title}
			</p>
			{#if showClass}
				<div class="my-1 w-auto border-t"></div>
			{/if}
		{/if}
		{#if showClass}
			{class_}
		{/if}
	</figcaption>
</figure>
