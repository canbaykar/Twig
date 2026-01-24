<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
	import Preview from './preview.svelte';

  const { Story } = defineMeta({
    title: 'Colors', // Changed to match the story name directly
  });
</script>

<Story name={"Colors"}>

	<article class="prose prose-invert lg:prose-xl text-fg">
		<h1>Functional</h1>
		<h2>Neutral</h2>
		<h3>Background</h3>
		<div class="w-full flex flex-wrap gap-5">
			<Preview class="bg-bg">
				bg
			</Preview>
			<Preview class="bg-bg-muted border-border-muted">
				bg-muted
			</Preview>
		</div>
	</article>
</Story>