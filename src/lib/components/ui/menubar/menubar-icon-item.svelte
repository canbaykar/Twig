<script lang="ts">
	import { Menubar as MenubarPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/shadcn.js';
	import type { Snippet } from 'svelte';

	/**
	This component is supposed to be menubar-item (from shadcn, which itself is a 
	wrapper of Bits UI's Menu-item) but handling icons by taking an icon snippet
	and rendering it before children appropriately. But it's also trying to
	support an equivalent of the child snippet prop of Menu-item. So that you can
	avoid wrapping IconItem in another element (e.g. 'a') when doing something like:

	<Menubar.IconItem>
		{#snippet child({ props })}
			<a 
				href="https://github.com"
				target="_blank" rel="noopener noreferrer"
				{...props}
			>
				{@render (props.childrenProp as any)?.()}
			</a>
		{/snippet}
		{#snippet icon()}
			<Icon icon="lucide:github" />
		{/snippet}
		GitHub
	</Menubar.IconItem>
	**/

	let {
		ref = $bindable(null),
		class: className,
		variant = 'default',
		icon,
		children: childrenProp_,
		...restProps
	}: MenubarPrimitive.ItemProps & {
		/** Snippet with icon like @example <Icon icon="lucide:minus" class="size-4" /> (from iconify/svelte) */
		icon?: Snippet;
		children?: Snippet;
		/** 
		 * Like the child snippet in Bits UI items but has to render childrenProp: Snippet<[]> inside it. 
		 * (keyword 'children' was unavailable. Has to render it because that's where the icon is.
		 * You can provide both children and child snippets.)
		 */
		child?: Snippet<[{ props: { childrenProp?: Snippet<[]>; [key: string]: unknown }; }]>;
		variant?: 'default' | 'destructive';
	} = $props();
</script>

{#snippet children()}
	<span class="pointer-events-none absolute start-2 flex size-3.5 items-center justify-center">
		{@render icon?.()}
	</span>
	{@render childrenProp_?.()}
{/snippet}

<MenubarPrimitive.Item
	bind:ref
	data-slot="menubar-item"
	data-variant={variant}
	class={cn(
		"focus:bg-control-bg-hover focus:text-control-fg-hover data-[variant=destructive]:text-fg-danger data-[variant=destructive]:focus:bg-bg-danger-emphasis data-[variant=destructive]:focus:text-fg-onEmphasis data-[variant=destructive]:*:[svg]:!text-fg-danger data-[disabled]:text-control-fg-disabled relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 ps-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		className
	)}
	{...{ children, childrenProp: children, ...restProps }}
/>
