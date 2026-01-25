<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import Preview from './preview.svelte';
	import Swatch from './swatch.svelte';
	import Part from './part.svelte';

	const { Story } = defineMeta({
		title: 'Colors' // Changed to match the story name directly
	});
</script>

<Story name={'Colors'}>
	<article class="prose prose-invert lg:prose-xl text-fg w-full">
		<Part>
			<h1>Functional</h1>
			<Part>
				<h2>Neutral</h2>
				<Part>
					<h3>Background</h3>
					<Swatch>
						<Preview title="bg" class="bg-bg" />
						<Preview title="bg-muted" class="bg-bg-muted" />
						<Preview title="bg-emphasis" class="bg-bg-emphasis" />
						<Preview title="bg-inset" class="bg-bg-inset" />
						<Preview title="bg-overlay" class="bg-bg-overlay" />
					</Swatch>
				</Part>

				<Part>
					<h3>Foreground</h3>
					<Swatch>
						<Preview title="fg" class="text-fg">Aa</Preview>
						<Preview title="fg-muted" class="text-fg-muted">Aa</Preview>
						<Preview title="fg-disabled" class="text-fg-disabled">Aa</Preview>
						<Preview title="fg-onEmphasis" class="text-fg-onEmphasis bg-bg-emphasis">Aa</Preview>
						<Preview title="fg-link" class="text-fg-link font-bold underline">Aa</Preview>
					</Swatch>
				</Part>

				<Part>
					<h3>Border</h3>
					<Swatch>
						<Preview title="border" class="border-border" />
						<Preview title="border-muted" class="border-border-muted" />
						<Preview title="border-emphasis" class="border-border-emphasis" />
					</Swatch>
				</Part>
			</Part>

			<Part>
				<h2>Semantic</h2>
				<Part>
					<h3>Danger</h3>
					<Swatch>
						<Preview title="fg-danger" class="text-fg-danger">Aa</Preview>
						<Preview title="bg-danger-emphasis" class="bg-bg-danger-emphasis" />
						<Preview title="bg-danger-muted" class="bg-bg-danger-muted" />
						<Preview title="border-danger-emphasis" class="border-border-danger-emphasis" />
						<Preview title="border-danger-muted" class="border-border-danger-muted" />
					</Swatch>
				</Part>
			</Part>
		</Part>

		<Part>
			<h1>Pattern</h1>
			<Part>
				<h2>Control</h2>
				<Part>
					<h3>Background</h3>
					<Swatch>
						<Preview title="control-bg" class="bg-control-bg" />
						<Preview title="control-bg-hover" class="bg-control-bg-hover" />
						<Preview title="control-bg-active" class="bg-control-bg-active" />
						<Preview title="control-bg-disabled" class="bg-control-bg-disabled" />
					</Swatch>
				</Part>
		
				<Part>
					<h3>Border</h3>
					<Swatch>
						<Preview title="control-bg" class="bg-control-bg" />
						<Preview title="control-border" class="border-control-border" />
						<Preview title="control-border-hover" class="border-control-border-hover" />
						<Preview title="control-border-active" class="border-control-border-active" />
						<Preview title="control-border-disabled" class="border-control-border-disabled" />
					</Swatch>
				</Part>
		
				<Part>
					<h3>Foreground</h3>
					<Swatch>
						<Preview title="control-fg" class="text-control-fg bg-control-bg">Aa</Preview>
						<Preview title="control-fg-hover" class="text-control-fg-hover bg-control-bg">Aa</Preview>
						<Preview title="control-fg-muted" class="text-control-fg-muted bg-control-bg">Aa</Preview>
						<Preview title="control-fg-disabled" class="text-control-fg-disabled bg-control-bg">
							Aa
						</Preview>
					</Swatch>
				</Part>
		
				<Part>
					<h3>Overlay (Background)</h3>
					<Swatch>
						<Preview title="control-overlay" class="bg-control-overlay" />
						<Preview title="control-overlay-hover" class="bg-control-overlay-hover" />
						<Preview title="control-overlay-active" class="bg-control-overlay-active" />
						<Preview title="control-overlay-disabled" class="bg-control-overlay-disabled" />
					</Swatch>
				</Part>
			</Part>
	
			<Part>
				<h2>Control-Inverted</h2>
				<Part>
					<h3>Background</h3>
					<Swatch>
						<Preview title="control-inverted" class="bg-control-inverted" />
						<Preview title="control-inverted-hover" class="bg-control-inverted-hover" />
						<Preview title="control-inverted-active" class="bg-control-inverted-active" />
						<Preview title="control-inverted-disabled" class="bg-control-inverted-disabled" />
					</Swatch>
				</Part>
		
				<Part>
					<h3>Foreground</h3>
					<Swatch>
						<Preview 
							title="control-inverted-fg" 
							class="text-control-inverted-fg bg-control-inverted"
						>
							Aa
						</Preview>
						<Preview
							title="control-inverted-fg-hover"
							class="text-control-inverted-fg-hover bg-control-inverted"
						>
							Aa
						</Preview>
						<Preview
							title="control-inverted-fg-muted"
							class="text-control-inverted-fg-muted bg-control-inverted"
						>
							Aa
						</Preview>
						<Preview
							title="control-inverted-fg-disabled"
							class="text-control-inverted-fg-disabled bg-control-inverted"
						>
							Aa
						</Preview>
					</Swatch>
				</Part>
			</Part>
	
			<Part>
				<h2>Focus</h2>
				<Swatch>
					<Preview
						title="focus-outline"
						class="border-focus-outline ring-focus-outline/25 ring-[3px]"
						showClass
					/>
					<Preview title="selection"><span class="bg-selection">Aa</span></Preview>
				</Swatch>
			</Part>
	
			<Part>
				<h2>Deriv</h2>
				<Part>
					<h3>Neutral</h3>
					<Swatch>
						<Preview title="bg-deriv-bg-neutral-1" class="bg-deriv-bg-neutral-1/75" showClass />
						<Preview title="bg-deriv-bg-neutral-2" class="bg-deriv-bg-neutral-2/75 border-deriv-bg-neutral-3/75" showClass />
						<Preview title="bg-deriv-bg-neutral-3" class="bg-deriv-bg-neutral-3/75 border-deriv-bg-neutral-4/75" showClass />
					</Swatch>
				</Part>
				<Part>
					<h3>Danger</h3>
					<Swatch>
						<Preview title="bg-deriv-bg-danger-1" class="bg-deriv-bg-danger-1/75 border-deriv-bg-danger-2/75" showClass />
						<Preview title="bg-deriv-bg-danger-2" class="bg-deriv-bg-danger-2/75 border-deriv-bg-danger-3/75" showClass />
						<Preview title="bg-deriv-bg-danger-3" class="bg-deriv-bg-danger-3/75 border-deriv-bg-danger-4/75" showClass />
					</Swatch>
				</Part>

				<Swatch>
					<Preview title="grid" class="border-grid bg-transparent" />
				</Swatch>
			</Part>
		</Part>
	</article>
</Story>

<style>
	@import './stories.css';
</style>