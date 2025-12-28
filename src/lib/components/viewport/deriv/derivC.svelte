<script module lang="ts">
	import Bar from './bar.svelte';
	import Deriv from '$lib/state/deriv.svelte';
	import Formula from './formula/formula.svelte';
	import Dropzones from './dnd/dropzones.svelte';
	import viewport from '$lib/state/viewport.svelte';
	import { bgRoot } from './bg.svelte';
	import { dndOptions } from './dnd/dndOptions';
	import type { PartListeners } from '../viewportC.svelte';
	import Grip from './dnd/grip.svelte';
	import { DT } from '../../../../DT';
	import draggable from '$lib/utils/interact/draggable.svelte';
	import Adders from './adders.svelte';
	import { tick } from 'svelte';
	import { forceFocus } from './formula/multiSelection';

	// When there are more listeners to be sent to viewport,
	// they are going to be merged here.
	export const partListeners: PartListeners = {
		layout: {
			mousedown(e, l) {
				e.deriv.render.goToTop();
				if (e.section === 'adder') e.updateSelecetion = false;
				l(e);
			},
			mouseup(e, l) {
				if (e.section === 'adder') e.updateSelecetion = false;
				l(e);
			},
		},
		body_: {
			mousedown(e) {
				e.deriv.render.bodyMuted = false;
				draggable.once(dndOptions(e.deriv, false));
			},
			mouseup(e) { 
				// Panzoom element that normally recieves focus on mousedown has multiSelection-prevent-blur
				// to prevent text selections being lost while navigating. So we have to manually focus it
				// with a function from multiSelection.
				forceFocus(viewport.render.panzoomElement);
			}
		},
		bar_: {
			mousedown(e) {
				draggable.once(dndOptions(e.deriv, true));
			},
		},
		body_formula: {
			mousedown(e) {
				e.deriv.render.bodyMuted = false;
			},
		},
		adder_top: {
			mouseup(e) {
				const d = new Deriv();
				e.deriv.attachChild(d);
				d.render.focusEditor();
			}
		},
		adder_bottom: {
			mouseup(e) {
				const [x, y] = e.deriv.render.xy;
				const d = new Deriv();
				viewport.attachChild(d);
				d.attachChild(e.deriv);
				e.deriv.render.resetTranslate();
				d.render.moveTo(x, y + DT.derivRowOffsetN);
				d.render.focusEditor();
			}
		},
		adder_left: {
			mouseup(e) {
				addSibling(e.deriv);
			}
		},
		adder_right: {
			mouseup(e) {
				addSibling(e.deriv, 1);
			}
		},
	};

	// Helper for side adders (between adders are actually right adders)
	function addSibling(d: Deriv, right = 0) {
		// To store old x positions of nearby derivs
		const fixer: [Deriv, number][] = [];
		const addToFixer = (d?: Deriv) => d && fixer.push([d, d.render.x]);

		let p = d.derivParent;
		if (p) {
			addToFixer(p.children[d.childIndex]);
			addToFixer(p.children[d.childIndex + (right * 2 - 1)]);
		}
		else {
			addToFixer(d);
			p = new Deriv();
			p.render.bodyMuted = true;
			p.attachChild(d);
			p.attach(viewport);
			p.render.moveTo(d.render.x, d.render.y + 2 * DT.derivRowOffsetN);
			d.render.resetTranslate();
		}

		const s = new Deriv();
		p.attachChild(s, d.childIndex + right);
		s.render.focusEditor();

		// Apply fixer
		tick().then(() => {
			let offset = 0;
			for (const [d, x] of fixer)
				offset += x - d.render.x;
			offset /= fixer.length || 1;
			d.root.render.moveBy(offset, 0);
		});
	}
</script>

<script lang="ts">
	interface Props {
		deriv: Deriv;
	}

	let { deriv }: Props = $props();

	const gripX = $derived((deriv.render.width + DT.UNIT) / 2 + DT.derivBgPaddingN);
</script>

<!-- Background -->
{#if deriv.root === deriv || deriv.render.dragged}
    {@render bgRoot(deriv)}
{/if}

<!-- See DerivRenderState.lookup for data-part -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="deriv"
	bind:this={deriv.render.element}
	class:pointer-events-none={deriv.render.inDragged}
	style:translate="{deriv.render.x}px {deriv.render.y}px"
	class:z-1={deriv.render.inDragged}
	data-uid={deriv.uid}
	data-part="body_"
>
	<Formula {deriv} />

	{#if deriv.render.hoveredSection === 'body'}
		<Grip x="{ gripX}px" y="{-DT.derivLineHeightN / 2}px"/>
		<Grip x="{-gripX}px" y="{-DT.derivLineHeightN / 2}px"/>
	{/if}

	<!-- TODO: Place dropzones in front of Bar -->
	{#if viewport.render.dragging && !deriv.render.inDragged}
		<Dropzones {deriv} />
	{/if}
</div>

<Adders {deriv} />

<Bar {deriv} rule={deriv.logic.ruleText} label={deriv.logic.labelText} />