<script lang="ts">
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils/shadcn.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: MenubarPrimitive.TriggerProps = $props();
</script>

<MenubarPrimitive.Trigger
	bind:ref
	data-slot="menubar-trigger"
	class={cn(
		"focus:bg-control-bg-hover focus:text-control-fg-hover data-[state=open]:bg-control-bg-hover data-[state=open]:text-control-fg-hover flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none",
		className
	)}
	{...restProps}
/>
