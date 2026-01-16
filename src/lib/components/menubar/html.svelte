<script lang="ts">
	// This component is for rendering styled text with svelte-sonner.
	const { content = '' }: { content?: string | (() => string) } = $props();
</script>

{@html typeof content === 'function' ? content() : content}