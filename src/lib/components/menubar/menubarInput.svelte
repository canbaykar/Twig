<script lang="ts">
	import Input from "../ui/input/input.svelte";

	// Auto growing input for use as file title in menubar.
	// See https://css-tricks.com/auto-growing-inputs-textareas/
	// and https://stackoverflow.com/questions/79253266/how-to-make-text-input-grow-automatically

	interface Props {
		placeholder?: string;
		/** ($bindable) */
		value?: string;
	}

	let {
		placeholder = "",
		value = $bindable(""),
	}: Props = $props();

	let label: HTMLLabelElement | null = $state(null);
	$effect(() => { label && (label.dataset.value = value || placeholder) });
</script>

<label
	class="inline-grid font-medium text-sm" 
	data-value={placeholder} 
	data-placeholder={placeholder}
	bind:this={label}
>
	<Input 
		class="bg-transparent border-transparent h-7 inline-grid text-sm" 
		{placeholder}
		style="grid-area: 1 / 3" size={1}
		bind:value
	/>
</label>

<style>
	label::before, label::after {
		content: attr(data-placeholder) ' ';
		visibility: hidden;
		white-space: pre-wrap;
		padding-inline: calc(var(--spacing) * 3);
		grid-area: 1 / 3;
	}
	label::after {
		content: attr(data-value) ' ';
	}
</style>