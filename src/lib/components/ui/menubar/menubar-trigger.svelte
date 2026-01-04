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
		"focus:bg-bg-muted focus:text-fg data-[state=open]:bg-bg-muted data-[state=open]:text-fg flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none",
		className
	)}
	{...restProps}
/>
