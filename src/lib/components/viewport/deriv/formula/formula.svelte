<script module lang="ts">
	import type Deriv from '$lib/state/deriv.svelte';
	import { DT } from '../../../../../DT';
	import viewport from '$lib/state/viewport.svelte';
	import DerivRenderState from '../renderState.svelte';
	// Prosemirror
	import { Schema } from 'prosemirror-model';
	import { EditorState, TextSelection } from 'prosemirror-state';
	import { EditorView } from 'prosemirror-view';
	import 'prosemirror-view/style/prosemirror.css';
	// Bg
	import { type BgType } from '../bg.svelte';
	import { fullyEmpty, multiSelectionPlugin } from './multiSelection';
	import { tick } from 'svelte';
	export { formulaBg };

	const textSchema = new Schema({
		nodes: {
			text: {},
			doc: { content: 'text*' },
		}
	});

	/** rafBefore: Await requestAnimationFrame before doing anything */
	export async function focusEditor(d: Deriv, rafBefore = true) {
		if (rafBefore) await tick();
		const r = d.render;
		if (r.editorFocused) return;
		viewport.render.selectOnly(d);

		let inner = r.editorView;
		if (!inner) {
			await tick();
			inner = r.editorView;
			if (!inner) return;
		}
		if (!inner) return;

		inner.focus();
		inner.dispatch(inner.state.tr.setSelection(TextSelection.create(inner.state.doc, 0, 0)));
	}
</script>

<script lang="ts">
	interface Props {
		deriv: Deriv;
	}

	let { deriv: deriv }: Props = $props();

	let element: HTMLElement;
	DerivRenderState.maintainWidth(
		() => deriv.conc,
		() => deriv.render.baseWidth = element.offsetWidth
	);

	let editorElement: HTMLDivElement;
	const editorAwake = $derived(deriv.render.bodyAwake);

	const r = deriv.render;
	$effect(() => {
		if (editorAwake) {
			// Setup Prosemirror
			if (r.editorView) return;
			const doc = textSchema.node('doc', null, deriv.conc ? textSchema.text(deriv.conc) : undefined);
			r.editorView = new EditorView(editorElement, {
				state: EditorState.create({ 
					doc,
					plugins: [
						multiSelectionPlugin,
					],
				}),

				// Hook to sync with deriv.conc
				dispatchTransaction(tr) {
					(this as any as EditorView).updateState(this.state.apply(tr));
					deriv.conc = this.state.doc.textContent;
					r.editorFocused = !fullyEmpty(this.state.selection);
				},
			});
		} else {
			// Destroy Prosemirror
			if (!r.editorView) return;
			r.editorView.destroy();
			r.editorView = null;
		}
	});
</script>

<!-- Draggable button, grabbed when clicked -->
<div
	class="wrapper bottom-0 translate-x-[-50%] h-(--DERIV-LINE-HEIGHT) leading-(--DERIV-LINE-HEIGHT) whitespace-nowrap cursor-auto overflow-hidden"
	bind:this={element}
	tabindex="-1"
>
	<!-- Prosemirror element -->
	<div 
		bind:this={editorElement}
		class="relative! **:relative! caret-transparent selection:bg-transparent"
		class:opacity-25={deriv.render.bodyMuted}
		data-part="body_formula"
	>
		{#if !editorAwake}
			<div class="ProseMirror">{deriv.conc}</div>
		{/if}
	</div>
	{#if editorAwake}
		<div
			class="top-0 left-0 origin-top-left pointer-events-none outline-1 outline-fg -outline-offset-1 outline-dashed rounded-[calc(var(--DERIV-BG-PADDING)/16)]"
			class:opacity-0={!r.editorFocused}
			style="
			height: {DT.derivLineHeightN / DT.UNIT * viewport.render.scale}px;
				width: {deriv.render.baseWidth / DT.UNIT * viewport.render.scale}px;
				font-size: {DT.derivSizeN / DT.UNIT * viewport.render.scale}px;
				scale: {DT.UNIT / viewport.render.scale};
        	"
		></div>
	{/if}
</div>

<style>
	* :global(.ProseMirror) {
		padding-inline: var(--DERIV-X-PADDING);
		outline: none;
		white-space: nowrap;
	}
</style>

<!-- BG -->
{#snippet formulaBg(deriv: Deriv, type: BgType)}
	{@const pad2 = 2 * DT.derivBgPaddingN}
	{@const offY = -DT.derivLineHeightN - DT.derivBgPaddingN}
	{@const minRx = (DT.derivLineHeightN + pad2) / 2}
	<!-- The whole handle section should be as thick as bar bg -->
	<!-- This padding covers what need to be added on top of the regular padding (bgPadding) -->
	{@const handlePad = DT.UNIT + DT.derivBgPaddingN}
	{@const handlePad2 = handlePad * 2}

	<rect
		x={deriv.render.x - deriv.render.width / 2 - DT.derivBgPaddingN - (+type.extended(deriv)) * handlePad}
		y={deriv.render.y + offY}
		width={deriv.render.width + pad2 + (+type.extended(deriv)) * handlePad2}
		height={DT.derivLineHeightN + pad2}
		rx={Math.min((DT.derivBgPaddingN * 4) / viewport.render.scale, minRx)}
		fill={type.formulaFill(deriv)}
		data-uid={deriv.uid}
		data-part="body_"
	/>
{/snippet}