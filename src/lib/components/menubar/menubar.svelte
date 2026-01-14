<script>
	import * as Menubar from '$lib/components/ui/menubar';
	import Icon from '@iconify/svelte';
</script>

<Menubar.Root class="absolute border-t-0 border-l-0 rounded-none rounded-br-md">
	<Menubar.Menu>
		<Menubar.Trigger>File</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.IconItem>
				{#snippet icon()}
					<Icon icon="lucide:file" />
				{/snippet}
				New File
			</Menubar.IconItem>
			<Menubar.IconItem>
				{#snippet icon()}
					<Icon icon="lucide:folder" />
				{/snippet}
				Open
			</Menubar.IconItem>
			<Menubar.Separator />
			<Menubar.IconItem>
				{#snippet icon()}
					<Icon icon="lucide:save" />
				{/snippet}
				Save
			</Menubar.IconItem>
			<Menubar.IconItem>
				{#snippet icon()}
					<Icon icon="lucide:save" />
				{/snippet}
				Save As…
			</Menubar.IconItem>
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
			<Menubar.IconItem disabled>
				{#snippet icon()}
					<Icon icon="lucide:undo" />
				{/snippet}
				Undo <Menubar.Shortcut>(WIP)</Menubar.Shortcut>
			</Menubar.IconItem>
			<Menubar.IconItem disabled>
				{#snippet icon()}
					<Icon icon="lucide:redo" />
				{/snippet}
				Redo <Menubar.Shortcut>(WIP)</Menubar.Shortcut>
			</Menubar.IconItem>
			<Menubar.Separator />
			<Menubar.IconItem disabled>
				{#snippet icon()}
					<Icon icon="lucide:search" />
				{/snippet}
				Find <Menubar.Shortcut>(WIP)</Menubar.Shortcut>
			</Menubar.IconItem>
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
	<MenubarInput />
</Menubar.Root>