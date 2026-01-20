<script lang="ts" module>
	import * as Menubar from '$lib/components/ui/menubar';
	import * as Kbd from "$lib/components/ui/kbd/index.js";
	import viewport from '$lib/state/viewport.svelte';
	import Icon from '@iconify/svelte';
	import MenubarInput from './menubarInput.svelte';
	import { browser } from '$app/environment';
	import { toast } from 'svelte-sonner';
	import Html from './html.svelte';
	import { safeParseJSON } from '$lib/utils';
	import { keyboardListeners } from '../viewport/listeners';

	const placeholder = "Untitled Project";
	let nameInput = $state("");
	let firstName = $derived(nameInput || placeholder);
	let fullName = $derived(firstName + ".json");

	export function newProject() {
		viewport.reset();
		toast("New project created.");
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
	// I guess I won't die if these checks aren't thorough
	const isFirefox = browser && /Firefox/i.test(navigator.userAgent);
	const isMobile = browser && /Android|webOS|iPhone|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	const isMac = browser && /Mac/i.test(navigator.userAgent);
	const CtrlCommand = isMac ? "⌘" : "Ctrl";

	let handle: FileSystemFileHandle | null = null;
	// Utility for sonner
	const html = (f: string | (() => string)) => ({ componentProps: { content: f } });

	export function open() {
		let content = $state(`Opening…`);
		toast.promise(_open, {
			loading: `Opening…`,
			success: () => {
				content = `Opened <span class="font-normal italic">${firstName}</span>.`;
				return Html
			},
			error: (err: any) => err?.name === 'AbortError' ? `Aborted open.` : `Failed to open file.`,
			...html(() => content),
		});
	}
	async function _open() {
		if (fallbackMode) {
			const input = document.createElement("input");
			input.type = "file";
			input.id = pickerOpt.id;
			input.accept = pickerOpt.accept;
			let res, rej;
			const promise = new Promise((resolve, reject) => {
				res = resolve;
				rej = reject;
			});
			input.onchange = async e => {
				try {
					const file = input.files![0];
					nameInput = file.name.replace(/\.json$/, '');
					viewport.deserialize(safeParseJSON(await file.text()));
					res!();
				} catch (err) { rej!(err) }
			}
			input.oncancel = () => {
				rej!({ name: 'AbortError' });
			};
			input.click();
			return promise;
		}
		// @ts-expect-error
		[handle] = await window.showOpenFilePicker(pickerOpt);
		const file = await handle!.getFile();
		nameInput = file.name.replace(/\.json$/, '');
		viewport.deserialize(safeParseJSON(await file.text()));
	}

	function saveWith<T>(f: () => Promise<T>) {
		let content = $state(`Saving <span class="font-normal italic">${firstName}</span>…`);
		toast.promise(f, {
			loading: () => Html,
			success: () => {
				content = `Saved <span class="font-normal italic">${firstName}</span> successfully.`;
				return Html
			},
			error: (err: any) => { 
				if (err?.name === 'AbortError') return `Aborted save.`;
				content = `Failed to save <span class="font-normal italic">${firstName}</span>.`;
				return Html
			},
			...html(() => content),
		});
	}
	async function _saveAs() {
		// @ts-expect-error
		handle = await window.showSaveFilePicker({ ...pickerOpt, suggestedName: fullName });
		nameInput = handle!.name.replace(/\.json$/, '');
		const stream = await handle!.createWritable();
		await stream.write(getContent());
		await stream.close();
	}
	async function _save() {
		if (!handle || handle.name !== fullName) return _saveAs();
		const stream = await handle.createWritable();
		await stream.write(getContent());
		await stream.close();
	}
	export async function saveAs() { return saveWith(_saveAs); }
	export async function save() { return saveWith(_save); }

	export function download() {
		toast.info(Html, html(`Downloading <span class="font-normal italic">${firstName}</span>…`));
		const blob = new Blob([getContent()], { type: "application/json" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = fullName;
		link.click();
		URL.revokeObjectURL(link.href); // Clean-up
	}

	const selectionEmpty = $derived(!viewport.render.selection.length);
	// These clipboard events only care about text data
	function cut(e: Event) {
		copy(e, "cut");
	}
	// newEventType is to reuse code for cut()
	function copy(_: Event, newEventType = "copy") {
		const clipboardData = new DataTransfer();
		const e = new ClipboardEvent(newEventType);
		// @ts-expect-error
		keyboardListeners[newEventType]?.(e, clipboardData);
		const copied = clipboardData.getData('text/plain');
		if (copied) navigator.clipboard.writeText(copied);
	}
	export async function paste() {
		const clipboardData = new DataTransfer();
		const copied = await navigator.clipboard.readText();
		clipboardData.setData("text/plain", copied);
		// @ts-expect-error
		keyboardListeners.paste?.(new ClipboardEvent("paste"), clipboardData);
	}

	function onkeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
			e.preventDefault();
			isFirefox ? download() : save();
		}
	}
</script>

<svelte:document {onkeydown} />

<Menubar.Root class="absolute border-t-0 border-l-0 rounded-none rounded-br-md">
	<Menubar.Menu>
		<Menubar.Trigger>File</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.IconItem onclick={newProject}>
				{#snippet icon()}
					<Icon icon="lucide:file" />
				{/snippet}
				New Project
			</Menubar.IconItem>
			<Menubar.IconItem onclick={open}>
				{#snippet icon()}
					<Icon icon="lucide:folder" />
				{/snippet}
				Open
			</Menubar.IconItem>
			<Menubar.Separator />
			<div title={fallbackMode ? "Not supperted by this browser" : ""}>
				<Menubar.IconItem onclick={() => save} disabled={fallbackMode}>
					{#snippet icon()}
						<Icon icon="lucide:save" />
					{/snippet}
					Save
					{#if !isFirefox}
						<Menubar.Shortcut>
							<Kbd.Group hidden={isMobile}>
								<Kbd.Root>{CtrlCommand}</Kbd.Root>
								<Kbd.Root>S</Kbd.Root>
							</Kbd.Group>
						</Menubar.Shortcut>
					{/if}
				</Menubar.IconItem>
			</div>
			<div title={fallbackMode ? "Not supperted by this browser" : ""}>
				<Menubar.IconItem onclick={() => saveAs} disabled={fallbackMode}>
					Save As…
				</Menubar.IconItem>
			</div>
			<Menubar.IconItem onclick={download}>
				{#snippet icon()}
					<Icon icon="lucide:download" />
				{/snippet}
				Save to Downloads
					{#if isFirefox}
						<Menubar.Shortcut>
							<Kbd.Group hidden={isMobile}>
								<Kbd.Root>{CtrlCommand}</Kbd.Root>
								<Kbd.Root>S</Kbd.Root>
							</Kbd.Group>
						</Menubar.Shortcut>
					{/if}
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
			</div>
			<div title="Work in progress">
				<Menubar.IconItem disabled>
					{#snippet icon()}
						<Icon icon="lucide:redo" />
					{/snippet}
					Redo
				</Menubar.IconItem>
				<Menubar.Separator />
			</div>
			<div title="Work in progress">
				<Menubar.IconItem disabled>
					{#snippet icon()}
						<Icon icon="lucide:search" />
					{/snippet}
					Find
				</Menubar.IconItem>
			</div>
			<Menubar.Separator />
			<div title={selectionEmpty ? "Selection empty" : ""}>
				<Menubar.IconItem onclick={cut} disabled={selectionEmpty}>
					{#snippet icon()}
						<Icon icon="lucide:scissors" />
					{/snippet}
					Cut
					<Menubar.Shortcut>
						<Kbd.Group hidden={isMobile}>
							<Kbd.Root>{CtrlCommand}</Kbd.Root>
							<Kbd.Root>X</Kbd.Root>
						</Kbd.Group>
					</Menubar.Shortcut>
				</Menubar.IconItem>
			</div>
			<div title={selectionEmpty ? "Selection empty" : ""}>
				<Menubar.IconItem onclick={copy} disabled={selectionEmpty}>
					{#snippet icon()}
						<Icon icon="lucide:clipboard-copy" />
					{/snippet}
					Copy
					<Menubar.Shortcut>
						<Kbd.Group hidden={isMobile}>
							<Kbd.Root>{CtrlCommand}</Kbd.Root>
							<Kbd.Root>C</Kbd.Root>
						</Kbd.Group>
					</Menubar.Shortcut>
				</Menubar.IconItem>
			</div>
			<Menubar.IconItem onclick={paste} title={isFirefox ? "May be buggy in this browser" : ""}>
				{#snippet icon()}
					<Icon icon="lucide:clipboard-paste" />
				{/snippet}
				Paste
				{#if isFirefox}
					<Icon icon="lucide:circle-alert" />
				{/if}
				<Menubar.Shortcut>
					<Kbd.Group hidden={isMobile}>
						<Kbd.Root>{CtrlCommand}</Kbd.Root>
						<Kbd.Root>V</Kbd.Root>
					</Kbd.Group>
				</Menubar.Shortcut>
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