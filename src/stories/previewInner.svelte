<script lang="ts">
	import { cn } from '$lib/utils/shadcn';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children?: Snippet;
		[key: string]: any;
	}

	const { class: class_, children, ...restProps }: Props = $props();
</script>

<div
	class={cn('flex min-h-13 min-w-13 px-4 py-2 items-center justify-center rounded border border-transparent', class_)}
	title={class_}
	{...restProps}
>
	{@render children?.()}
</div>