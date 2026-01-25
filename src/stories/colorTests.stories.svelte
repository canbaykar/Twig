<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import Preview from './preview.svelte';
	import Swatch from './swatch.svelte';
	import PreviewInner from './previewInner.svelte';
	import PreviewInline from './previewInline.svelte';
	import Part from './part.svelte';

	const { Story } = defineMeta({
		title: 'Color Tests' // Changed to match the story name directly
	});
</script>

{#snippet commonTestsInline()}
	<span class="extra-word-spacing">
		<PreviewInline class="text-fg" />,
		<PreviewInline class="text-fg-muted" />,
		<PreviewInline class="text-fg-disabled" />,
		<PreviewInline class="text-fg-link font-bold underline" content="fg-link" />,
		<PreviewInline class="text-fg-danger" />
	</span>
{/snippet}

{#snippet commonTests(
	/** @type {string} */ title, 
	/** @type {string} */ class_
)}
	<Swatch>
		<Preview {title} class={class_} full showClass>
			{@render commonTestsInline()}
		</Preview>
	</Swatch>
{/snippet}

{#snippet controlTestsInline(
	/** @type {boolean} */ inverted
)}
	<span class="extra-word-spacing">
		<PreviewInline class="text-control{inverted ? "-inverted" : ""}-fg" />,
		<PreviewInline class="text-control{inverted ? "-inverted" : ""}-fg-hover" />,
		<PreviewInline class="text-control{inverted ? "-inverted" : ""}-fg-muted" />,
		<PreviewInline class="text-control{inverted ? "-inverted" : ""}-fg-disabled" />
	</span>
{/snippet}

{#snippet controlTests(
	/** @type {string} */ title, 
	/** @type {string} */ class_, 
	/** @type {boolean} */ inverted
)}
	<Swatch>
		<Preview {title} class={class_} full showClass>
			{@render controlTestsInline(inverted)}
		</Preview>
	</Swatch>
{/snippet}

{#snippet derivTests(
	/** @type {string} */ title, 
	/** @type {string} */ class_
)}
	<Swatch>
		<Preview {title} class={class_} full showClass>
			<span class="extra-word-spacing">
				<PreviewInline class="text-fg" />,
				<PreviewInline class="text-fg-muted" />,
				<PreviewInline class="text-fg-disabled" />,
			</span>
		</Preview>
	</Swatch>
{/snippet}

<Story name={'Color Tests'}>
	<article class="prose prose-invert lg:prose-xl text-fg w-full">
		<Part>
			<h2>Common</h2>
			{@render commonTests("bg", "bg-bg border-border")}
			{@render commonTests("bg-muted", "bg-bg-muted border-muted")}
			{@render commonTests("bg-inset", "bg-bg-inset border-border")}
			{@render commonTests("bg-danger-muted", "bg-bg-danger-muted border-border-danger-muted")}
			{@render commonTests("bg-overlay", "bg-bg-overlay")}
			<Swatch>
				<Preview title="bg-overlay (multiple)" class="bg-bg-overlay border-border" full showClass>
					<PreviewInner class="bg-bg-overlay border-border">
						<PreviewInner class="bg-bg-overlay border-border">
							{@render commonTestsInline()}
						</PreviewInner>
					</PreviewInner>
				</Preview>
			</Swatch>
		</Part>

		<Part>
			<h2>Emphasis</h2>
			<Swatch>
				<Preview title="bg-emphasis" class="bg-bg-emphasis border-border-emphasis" full showClass>
					<PreviewInline class="text-fg-onEmphasis" />
				</Preview>
			</Swatch>
			<Swatch>
				<Preview title="bg-danger-emphasis" class="bg-bg-danger-emphasis" full showClass>
					<PreviewInline class="text-fg-onEmphasis" />
				</Preview>
			</Swatch>
		</Part>
		
		<Part>
			<h2>Control</h2>
			{@render controlTests("control-bg", "bg-control-bg border-control-border", false)}
			{@render controlTests("control-bg-hover", "bg-control-bg-hover border-control-border-hover", false)}
			{@render controlTests("control-bg-active", "bg-control-bg-active border-control-border-active", false)}
			{@render controlTests("control-bg-disabled", "bg-control-bg-disabled border-control-border-disabled", false)}
		</Part>

		<Part>
			<h2>Control-Inverted</h2>
			<Swatch>
				{@render controlTests("control-inverted", "bg-control-inverted", true)}
				{@render controlTests("control-inverted-hover", "bg-control-inverted-hover", true)}
				{@render controlTests("control-inverted-active", "bg-control-inverted-active", true)}
				{@render controlTests("control-inverted-disabled", "bg-control-inverted-disabled", true)}
			</Swatch>
		</Part>
		
		<Part>
			<h2>Deriv</h2>
			{@render commonTests("deriv-bg-neutral-1", "bg-deriv-bg-neutral-1/75")}
			{@render commonTests("deriv-bg-neutral-1", "bg-deriv-bg-neutral-2/75 border-deriv-bg-neutral-3/75")}
			{@render commonTests("deriv-bg-neutral-1", "bg-deriv-bg-neutral-3/75 border-deriv-bg-neutral-4/75")}

			{@render commonTests("deriv-bg-danger-1", "bg-deriv-bg-danger-1/75 border-deriv-bg-danger-2/75")}
			{@render commonTests("deriv-bg-danger-1", "bg-deriv-bg-danger-2/75 border-deriv-bg-danger-3/75")}
			{@render commonTests("deriv-bg-danger-1", "bg-deriv-bg-danger-3/75 border-deriv-bg-danger-4/75")}
		</Part>
	</article>
</Story>

<style global>
	@import './stories.css';
	
	:global(.extra-word-spacing) {
		word-spacing: 1em;
	}
</style>