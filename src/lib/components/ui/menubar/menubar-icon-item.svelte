<script lang="ts">
	import { Menubar as MenubarPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/shadcn.js';
	import type { Snippet } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		variant = 'default',
		icon,
		children: childrenProp,
		...restProps
	}: MenubarPrimitive.ItemProps & {
		/** Snippet with icon preferably from @lucide/svelte/icons/ */
		icon?: Snippet;
		children?: Snippet;
		variant?: 'default' | 'destructive';
	} = $props();
</script>

<MenubarPrimitive.Item
	bind:ref
	data-slot="menubar-item"
	data-variant={variant}
	class={cn(
		"focus:bg-control-bg-hover focus:text-control-fg-hover data-[variant=destructive]:text-fg-danger data-[variant=destructive]:focus:bg-bg-danger-emphasis data-[variant=destructive]:focus:text-fg-onEmphasis data-[variant=destructive]:*:[svg]:!text-fg-danger [&_svg:not([class*='text-'])]:text-control-fg-disabled data-[disabled]:text-control-fg-disabled relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 ps-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		className
	)}
	{...restProps}
>
	<span class="pointer-events-none absolute start-2 flex size-3.5 items-center justify-center">
		{@render icon?.()}
	</span>
	{@render childrenProp?.()}
</MenubarPrimitive.Item>
