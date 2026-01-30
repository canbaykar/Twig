<script lang="ts">
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils/shadcn.js";

	type InputType = Exclude<HTMLInputTypeAttribute, "file">;

	type Props = WithElementRef<
		Omit<HTMLInputAttributes, "type"> &
			({ type: "file"; files?: FileList } | { type?: InputType; files?: undefined })
	>;

	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		files = $bindable(),
		class: className,
		"data-slot": dataSlot = "input",
		...restProps
	}: Props = $props();
</script>

{#if type === "file"}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			"border-b-control-border ring-offset-bg placeholder:text-control-fg-muted flex h-9 w-full min-w-0 rounded-md border bg-control-bg px-3 pt-1.5 text-sm font-medium shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50",
			"focus-visible:border-focus-outline focus-visible:ring-focus-outline/50 focus-visible:ring-[3px]",
			"aria-invalid:ring-border-danger-emphasis/20 aria-invalid:border-border-danger-emphasis",
			className
		)}
		type="file"
		bind:files
		bind:value
		{...restProps}
	/>
{:else}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			"border-b-control-border bg-control-bg ring-offset-bg placeholder:text-control-fg-muted flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
			"focus-visible:border-focus-outline focus-visible:ring-focus-outline/50 focus-visible:ring-[3px]",
			"aria-invalid:ring-border-danger-emphasis/20 aria-invalid:border-border-danger-emphasis",
			className
		)}
		{type}
		bind:value
		{...restProps}
	/>
{/if}
