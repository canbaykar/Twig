<script module lang="ts">
	// Prosemirror
	import { Schema } from 'prosemirror-model';
	import { EditorState, TextSelection } from 'prosemirror-state';
	import { EditorView } from 'prosemirror-view';
	import { forceFocus, fullyEmpty, multiSelectionPlugin } from './multiSelection';
	import { symbolInputPlugin } from './symbolInput';
	import 'prosemirror-view/style/prosemirror.css';
	// Bg
	import { type BgType } from '../bg.svelte';
	export { formulaBg };
	// Other
	import type Deriv from '$lib/state/deriv.svelte';
	import { DT } from '../../../../../DT';
	import viewport from '$lib/state/viewport.svelte';
	import DerivRenderState from '../renderState.svelte';
	import { tick } from 'svelte';
	import { paste } from '$lib/components/menubar/menubar.svelte';
	import { safeParseJSON } from '$lib/utils';
	import { customCaretsPlugin } from './customCarets';

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
						customCaretsPlugin,
						symbolInputPlugin,
					],
				}),

				// Hook to sync with deriv.conc
				dispatchTransaction(tr) {
					(this as any as EditorView).updateState(this.state.apply(tr));
					deriv.conc = this.state.doc.textContent;
					r.editorFocused = !fullyEmpty(this.state.selection);
				},

				// If pasting JSON, try to paste as deriv
				transformPastedText(text, plain, view) {
					if (text.includes('{')) {
						try { 
							safeParseJSON(text);
							paste();
							return "";
						}
						catch (e) {}
					}
					return text;
				},

				handleKeyDown(view, e) {
					if (e.key === "Escape")
						// This element has multiSelection-prevent-blur to prevent text 
						// selections being lost while navigating. So we have to manually 
						// focus it with a function from multiSelection.
						// Also if I do it without r.A.F., Escape keydown event is passed
						// to viewport.
						requestAnimationFrame(() => forceFocus(viewport.render.element));
				},
			});
		} else {
			// Destroy Prosemirror
			if (r.editorView) {
				r.editorView.destroy();
				r.editorView = null;
				r.editorFocused = false;
			}
			// If there was a focused element in the if clause that's removed, focus goes
			// to body, without firing focus event on body. Pass it on to viewport instead.
			if (document.activeElement === document.body)
				viewport.render.element?.focus?.();
		}
	});
</script>

<!-- Draggable button, grabbed when clicked -->
<div
	class="wrapper bottom-0 translate-x-[-50%] h-(--DERIV-LINE-HEIGHT) leading-(--DERIV-LINE-HEIGHT) whitespace-nowrap cursor-auto"
	bind:this={element}
	tabindex="-1"
>
	<!-- Prosemirror element -->
	<div 
		bind:this={editorElement}
		class="relative! **:relative! caret-transparent selection:bg-transparent overflow-hidden"
		class:text-fg-disabled={deriv.render.bodyMuted}
		data-part="body_formula"
	>
		{#if !editorAwake}
			<div class="ProseMirror">{deriv.conc}</div>
		{/if}
	</div>

	<!-- Outline element -->
	<div
		class:focused={r.editorFocused}
		class="top-0 left-0 origin-top-left pointer-events-none transition-[color,box-shadow] [.focused]:border-2 [.focused]:border-focus-outline! [.focused]:ring-focus-outline/50 [.focused]:ring-[3px] rounded-[calc(var(--DERIV-BG-PADDING)/16)]"
		style="
		height: {DT.derivLineHeightN / DT.UNIT * viewport.render.scale}px;
			width: {deriv.render.baseWidth / DT.UNIT * viewport.render.scale}px;
			font-size: {DT.derivSizeN / DT.UNIT * viewport.render.scale}px;
			scale: {DT.UNIT / viewport.render.scale};
		"
	></div>
</div>

<style>
	* :global(.ProseMirror) {
		padding-inline: var(--DERIV-X-PADDING);
		outline: none;
		white-space: nowrap;
		
		/* For customCarets.ts */
		:global(.caret-left)::after,
		:global(.caret-right)::before {
			content: '';
			outline: 10px solid currentColor;
			/* Firefox sometimes leaves a gap between outlines and backgound dowsn't fix it */
			box-shadow: 0px 0px 0 5px currentColor;
			pointer-events: none;
		}
		&:global(.caret-off .caret-left)::after,
		&:global(.caret-off .caret-right)::before {
			opacity: 0;
		}
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
		fill={type.bodyFill(deriv)} stroke={type.bodyStroke(deriv)}
		data-uid={deriv.uid}
		data-part="body_"
	/>
{/snippet}