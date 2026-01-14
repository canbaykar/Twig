<script lang="ts">
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils/shadcn.js";

	let {
		ref = $bindable(null),
		class: className,
		inset = undefined,
		variant = "default",
		...restProps
	}: MenubarPrimitive.ItemProps & {
		inset?: boolean;
		variant?: "default" | "destructive";
	} = $props();
</script>

<MenubarPrimitive.Item
	bind:ref
	data-slot="menubar-item"
	data-inset={inset}
	data-variant={variant}
	class={cn(
		"focus:bg-control-bg-hover focus:text-control-fg-hover data-[variant=destructive]:text-fg-danger data-[variant=destructive]:focus:bg-bg-danger-emphasis data-[variant=destructive]:focus:text-fg-onEmphasis data-[variant=destructive]:*:[svg]:!text-fg-danger [&_svg:not([class*='text-'])]:text-control-fg-muted relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:text-control-fg-disabled data-[inset]:ps-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		className
	)}
	{...restProps}
/>
