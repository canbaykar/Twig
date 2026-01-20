<script module lang="ts">
	import { DT } from "../../../../DT";
	import Deriv from "$lib/state/deriv.svelte";
	import { hitboxBgType, type BgType } from "./bg.svelte";
	import viewport from "$lib/state/viewport.svelte";
	export { addersBg };

	// -- Temp constants --
	// Width of grip section of deriv
	const gripWidth = DT.UNIT + 2 * DT.derivBgPaddingN;
	// This is hardcoded as tailwind classes below for now
	const adderRadius = DT.UNIT;
	const adderDiameter = 2 * adderRadius;
	// For Hitbox
	// (These constants are here to possibly be better for performance)
	const hitboxHeight = adderDiameter + 2 * DT.derivBgPaddingN;
	const hitboxTop = -(DT.derivLineHeightN + hitboxHeight) / 2;
	const defaultHitboxWidth = hitboxHeight;
	const hitboxRx = hitboxHeight / 2;
	function getRightNeighborLeft(deriv: Deriv) {
		if (!deriv.derivParent) return -Infinity;
		const neighbor = deriv.derivParent.children[deriv.childIndex + 1];
		if (!neighbor) return -Infinity;
		return neighbor.render.x - neighbor.render.width / 2 - gripWidth;
	}
	function getRightHitboxWidth(deriv: Deriv, rightX: number) {
		return Math.max(defaultHitboxWidth, getRightNeighborLeft(deriv) - rightX - deriv.render.x);
	}
	const hitboxFill = (deriv: Deriv, part: string) => 
		deriv.render.hoveredPart === part ? 'var(--color-bg-muted)' : 'transparent';
	// For adder visuals
	// (There aren't much hee because these aren't rendered all the time anyway)
	const sideAdderTop = -DT.derivLineHeightN / 2 - adderRadius;
	const opacityCondition = (deriv: Deriv, part: string) =>
		!deriv.render.bodyAwake && !deriv.render.barAwake && deriv.render.hoveredSection === "adder" && deriv.render.hoveredPart !== part;
</script>

<script lang="ts">

	interface Props {
		deriv: Deriv;
	}

	let { deriv }: Props = $props();
</script>

{#if deriv.render.awake}
	<!-- Left -->
	<div
		class:opacity-0={opacityCondition(deriv, "adder_left")}
		class="w-2 h-2 bg-fg rounded-full pointer-events-none"
		style:translate="{deriv.render.x - deriv.render.width / 2 - gripWidth - DT.derivBgPaddingN - adderDiameter}px {deriv.render.y + sideAdderTop}px"
	></div>

	<!-- Right -->
	{@const rightX = deriv.render.x + deriv.render.width / 2 + gripWidth + DT.derivBgPaddingN}
	<div
		class:opacity-0={opacityCondition(deriv, "adder_right")}
		class="w-2 h-2 bg-fg rounded-full pointer-events-none"
		style:translate="{rightX}px {deriv.render.y + sideAdderTop}px"
	></div>

	<!-- Right Extension (when hovered and has right neighbor) -->
	{#if deriv.render.hoveredPart === "adder_right" && deriv.derivParent && deriv.childIndex < deriv.derivParent.children.length - 1}
		{@const rnl = getRightNeighborLeft(deriv)}
		<!-- Right neighbor's point -->
		<div
			class="w-2 h-2 bg-fg rounded-full pointer-events-none"
			style:translate="{rnl - DT.derivBgPaddingN - adderDiameter}px {deriv.render.y + sideAdderTop}px"
		></div>
		<!-- Connecting line -->
		<div
			class="pointer-events-none origin-top-left"
			style:translate="{rightX + adderRadius}px {deriv.render.y - (DT.derivLineHeightN + DT.UNIT) / 2 - 0.5}px"
			style:width="{rnl - DT.derivBgPaddingN - adderDiameter - rightX}px"
			style="border-top: var(--UNITPX) dashed"
		></div>
	{/if}

	<!-- Bottom (when dragging, this moves in the position of ConnectionPopup) -->
	{#if !deriv.derivParent || deriv.render.bodyDragged}
		{@const d = +deriv.render.bodyDragged}
		<div
			class:opacity-0={opacityCondition(deriv, "adder_bottom")}
			class="w-2 h-2 bg-fg rounded-full pointer-events-none"
			style:translate="{deriv.render.x - adderDiameter / 2 }px {deriv.render.y + 2 * DT.derivBgPaddingN * (1 - d) - d * adderDiameter / 2}px"
		></div>
	{/if}

	<!-- Top -->
	{#if !deriv.children.length}
		<div
			class:opacity-0={opacityCondition(deriv, "adder_top")}
			class="w-2 h-2 bg-fg rounded-full pointer-events-none"
			style:translate="{deriv.render.xBar - adderDiameter / 2}px {deriv.render.yBar - 2 * DT.derivBgPaddingN - adderDiameter}px"
		></div>
	{/if}
{/if}

{#snippet addersBg(deriv: Deriv, type: BgType)}
	{@const rightX = deriv.render.width / 2 + gripWidth}
	{@const rightWidth = getRightHitboxWidth(deriv, rightX)}
	{@const rx = (type === hitboxBgType) ? 0 : hitboxRx}

	<g class="cursor-pointer">
		<!-- Left -->
		{#if !deriv.derivParent || !deriv.childIndex}
			<rect
				x={deriv.render.x - rightX - defaultHitboxWidth}
				y={deriv.render.y + hitboxTop}
				width={defaultHitboxWidth}
				height={defaultHitboxWidth}
				{rx}
				data-uid={deriv.uid}
				data-part="adder_left"
				fill={hitboxFill(deriv, "adder_left")}
			/>
		{/if}
		<!-- Right -->
		<rect
			x={deriv.render.x + rightX}
			y={deriv.render.y + hitboxTop}
			width={rightWidth}
			height={defaultHitboxWidth}
			{rx}
			data-uid={deriv.uid}
			data-part="adder_right"
			fill={hitboxFill(deriv, "adder_right")}
		/>
		<!-- Bottom -->
		{#if !deriv.derivParent}
			<rect
				x={deriv.render.x - defaultHitboxWidth / 2}
				y={deriv.render.y + DT.derivBgPaddingN}
				width={defaultHitboxWidth}
				height={defaultHitboxWidth}
				{rx}
				data-uid={deriv.uid}
				data-part="adder_bottom"
				fill={hitboxFill(deriv, "adder_bottom")}
			/>
		{/if}
		<!-- Top -->
		{#if !deriv.children.length}
			<rect
				x={deriv.render.xBar - defaultHitboxWidth / 2}
				y={deriv.render.yBar - DT.derivBgPaddingN - defaultHitboxWidth}
				width={defaultHitboxWidth}
				height={defaultHitboxWidth}
				{rx}
				data-uid={deriv.uid}
				data-part="adder_top"
				fill={hitboxFill(deriv, "adder_top")}
			/>
		{/if}
	</g>
{/snippet}