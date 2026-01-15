<script lang="ts">
	import * as Menubar from '$lib/components/ui/menubar';
	import viewport from '$lib/state/viewport.svelte';
	import Icon from '@iconify/svelte';
	import MenubarInput from './menubarInput.svelte';
	import { browser } from '$app/environment';

	const placeholder = "Untitled Project";
	let nameInput = $state("");
	let name = $derived((nameInput || placeholder) + ".json");

	function newFile() {
		viewport.reset();
	}

	const getContent = () => JSON.stringify(viewport.serialize());
	const pickerOpt = {
		id: "project",
		excludeAcceptAllOption: true,
		types: [{
			description: "JSON Files",
			accept: { "application/json": [".json"] },
		}],
		accept: "application/json", // For fallback mode file input
	};

	// File System Access API may not be supported, see MDN.
	// (browser check is bc window gives error on server.)
	// @ts-expect-error
	const fallbackMode = browser && !(window.showOpenFilePicker && window.showSaveFilePicker);
	let handle: FileSystemFileHandle | null = null;

	async function open() {
		if (fallbackMode) {
			const input = document.createElement("input");
			input.type = "file";
			input.id = pickerOpt.id;
			input.accept = pickerOpt.accept;
			input.onchange = async e => {
				const file = input.files![0];
				viewport.deserialize(JSON.parse(await file.text()));
			};
			input.click();
			return;
		}
		// @ts-expect-error
		[handle] = await window.showOpenFilePicker(pickerOpt);
		const file = await handle!.getFile();
		viewport.deserialize(JSON.parse(await file.text()));
	}
	
	async function saveAs() {
		// @ts-expect-error
		handle = await window.showSaveFilePicker({ ...pickerOpt, suggestedName: name });
		const stream = await handle!.createWritable();
		await stream.write(getContent());
		await stream.close();
	}

	async function save() {
		if (!handle || handle.name !== name) return saveAs();
		const stream = await handle.createWritable();
		await stream.write(getContent());
		await stream.close();
	}

	function download() {
		const blob = new Blob([getContent()], { type: "application/json" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = name;
		link.click();
		URL.revokeObjectURL(link.href); // Clean-up
	}
</script>

<Menubar.Root class="absolute border-t-0 border-l-0 rounded-none rounded-br-md">
	<Menubar.Menu>
		<Menubar.Trigger>File</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.IconItem onclick={newFile}>
				{#snippet icon()}
					<Icon icon="lucide:file" />
				{/snippet}
				New File
			</Menubar.IconItem>
			<Menubar.IconItem onclick={open}>
				{#snippet icon()}
					<Icon icon="lucide:folder" />
				{/snippet}
				Open
			</Menubar.IconItem>
			<Menubar.Separator />
			<div title={fallbackMode ? "Not supperted by this browser" : ""}>
				<Menubar.IconItem onclick={save} disabled={fallbackMode}>
					{#snippet icon()}
						<Icon icon="lucide:save" />
					{/snippet}
					Save
				</Menubar.IconItem>
				<Menubar.IconItem onclick={saveAs} disabled={fallbackMode}>
					Save As…
				</Menubar.IconItem>
			</div>
			<Menubar.IconItem onclick={download}>
				{#snippet icon()}
					<Icon icon="lucide:download" />
				{/snippet}
				Save to Downloads
			</Menubar.IconItem>
		</Menubar.Content>
	</Menubar.Menu>
	<Menubar.Menu>
		<Menubar.Trigger>Edit</Menubar.Trigger>
		<Menubar.Content>
			<div title="Work in progress">
				<Menubar.IconItem disabled>
					{#snippet icon()}
						<Icon icon="lucide:undo" />
					{/snippet}
					Undo
				</Menubar.IconItem>
				<Menubar.IconItem disabled>
					{#snippet icon()}
						<Icon icon="lucide:redo" />
					{/snippet}
					Redo
				</Menubar.IconItem>
				<Menubar.Separator />
				<Menubar.IconItem disabled>
					{#snippet icon()}
						<Icon icon="lucide:search" />
					{/snippet}
					Find
				</Menubar.IconItem>
			</div>
			<Menubar.Separator />
			<Menubar.IconItem>
				{#snippet icon()}
					<Icon icon="lucide:scissors" />
				{/snippet}
				Cut
			</Menubar.IconItem>
			<Menubar.IconItem>
				{#snippet icon()}
					<Icon icon="lucide:clipboard-copy" />
				{/snippet}
				Copy
			</Menubar.IconItem>
			<Menubar.IconItem>
				{#snippet icon()}
					<Icon icon="lucide:clipboard-paste" />
				{/snippet}
				Paste
			</Menubar.IconItem>
		</Menubar.Content>
	</Menubar.Menu>
	<Menubar.Menu>
		<Menubar.Trigger>Help</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.IconItem>
				{#snippet icon()}
					<Icon icon="lucide:github" />
				{/snippet}
				GitHub
			</Menubar.IconItem>
		</Menubar.Content>
	</Menubar.Menu>

	<!-- Separator -->
	<div class="bg-border w-px h-9"></div>

	<!-- File name -->
	<MenubarInput bind:value={nameInput} {placeholder} />
</Menubar.Root>