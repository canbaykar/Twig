<script lang="ts">
	interface Props {
		class?: string;
		content?: string
	}

	const { class: class_, content, ...restProps }: Props = $props();
</script>

<span
	class={class_}
	title={class_}
	{...restProps}
>
	{content ?? class_?.replace(/^text-/, '')}
</span>