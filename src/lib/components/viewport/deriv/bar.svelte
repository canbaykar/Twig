<script module lang="ts">
	import { type BgType } from "./bg.svelte";
	export { barBg };
</script>

<script lang="ts">
	import type Deriv from "$lib/state/deriv.svelte";
	import { DT } from "../../../../DT";
	import DerivRenderState from "./renderState.svelte";

    interface Props {
        deriv: Deriv;
        // Temporary
        label: string,
        rule: string,
    }
    
    let {
        deriv,
        label,
        rule,
    }: Props = $props();
    
    const render = deriv.render;
    
    let labelElement: HTMLElement | null = $state(null);
    let ruleElement:  HTMLElement | null = $state(null);
    DerivRenderState.maintainWidth(
        () => label,
        () => render.labelWidth = labelElement ? labelElement.offsetWidth : 0
    );
    DerivRenderState.maintainWidth(
        () => rule,
        () => render.ruleWidth = ruleElement ? ruleElement.offsetWidth : 0
    );
</script>

<div
    class="{render.inferred ? "bg-fg" : "bg-fg/25"} h-1 translate-x-[-50%] rounded-full select-none cursor-all-scroll"
	style:translate="{deriv.render.xBar - deriv.render.barWidth / 2}px {deriv.render.yBar}px"
    style:width="{render.barWidth}px"
    class:bg-transparent={deriv.render.barHidden}
	class:z-1={deriv.render.inDragged}
	data-uid={deriv.uid}
	data-part="bar_"
>
	<!-- Hitbox -->
	<div class="hitbox"></div>
    <!-- Label -->
    {#if deriv.render.hasLabel}
        <div
            class="right-(--DERIV-LABEL-RIGHT) labelBase"
            bind:this={labelElement}
        >
            {label}
        </div>
    {/if}
    <!-- Rule -->
	<div
		class="{render.ruleHidden ? "text-fg/25" : "text-fg"} left-(--DERIV-LABEL-RIGHT) {deriv.render.discharged ? 'labelBase' : 'ruleBase'}"
    	class:text-transparent={deriv.render.barHidden}
		bind:this={ruleElement}
	>
		{deriv.render.discharged ? rule : '(' + rule + ')'}
	</div>
</div>

<style>
	.hitbox {
		width: 100%;
		top: calc(-1 * var(--DERIV-BG-PADDING));
		height: var(--DERIV-BAR-BG-HEIGHT);
	}

    .labelBase {
        font-size: var(--DERIV-LABEL-SIZE);
        bottom: var(--DERIV-LABEL-BOTTOM);
        line-height: var(--DERIV-LABEL-LH);
        min-width: var(--DERIV-LABEL-HEIGHT);
        border: solid var(--UNITPX);
        padding: 0 calc(2.5 * var(--UNITPX));

        border-color: var(--color-fg);
        border-radius: calc(infinity * 1px);
        text-align: center;
    }

    .ruleBase {
        left: var(--DERIV-RULE-LEFT);
        font-size: var(--DERIV-RULE-SIZE);
        bottom: var(--DERIV-RULE-BOTTOM);
        line-height: var(--DERIV-RULE-LH);
    }
</style>

<!-- Bg -->
{#snippet barBg(deriv: Deriv, type: BgType)}
	{@const pad2 = 2 * DT.derivBgPaddingN}

	{@const labelOffX = -DT.derivBarGapN - DT.derivBgPaddingN}
	{@const labelOffY = DT.derivLabelBottomN - DT.derivBgPaddingN}
	{@const labelBgHeight = DT.derivLabelHeightN + pad2}
	{@const labelRx = DT.derivLabelHeightN / 2 + DT.derivBgPaddingN}

	{@const ruleLabelOffX = DT.derivBarGapN - DT.derivBgPaddingN}

	{@const ruleOffX = DT.derivRuleLeftN + DT.derivRuleParanthesisGapN - DT.derivBgPaddingN}
	{@const ruleOffY = DT.derivRuleBottomN + (DT.derivRuleHeightN - DT.derivLabelHeightN) / 2 - DT.derivBgPaddingN}
	{@const rulePad = 2 * (DT.derivBgPaddingN - DT.derivRuleParanthesisGapN)}

	<g fill={type.barFill(deriv)} data-uid={deriv.uid} data-part="bar_">
		<rect
			x={deriv.render.xBar - deriv.render.barWidth / 2 - DT.derivBgPaddingN}
			y={deriv.render.yBar - DT.derivBgPaddingN}
			width={deriv.render.barWidth + pad2}
			height={DT.UNIT + pad2}
			rx={(DT.UNIT + pad2) / 2}
		/>
	
		<!-- For label -->
		{#if deriv.render.hasLabel}
			<rect
				x={deriv.render.xBar - deriv.render.barWidth / 2 - deriv.render.labelWidth + labelOffX}
				y={deriv.render.yBar + labelOffY}
				width={deriv.render.labelWidth + pad2}
				height={labelBgHeight}
				rx={labelRx}
			/>
		{/if}
	
		<!-- For Rule -->
		{#if deriv.render.discharged}
			<rect
				x={deriv.render.xBar + deriv.render.barWidth / 2 + ruleLabelOffX}
				y={deriv.render.yBar + labelOffY}
				width={deriv.render.ruleWidth + pad2}
				height={labelBgHeight}
				rx={labelRx}
			/>
		{:else}
			<rect
				x={deriv.render.xBar + deriv.render.barWidth / 2 + ruleOffX}
				y={deriv.render.yBar + ruleOffY}
				width={deriv.render.ruleWidth + rulePad}
				height={labelBgHeight}
				rx={labelRx}
			/>
		{/if}
	</g>
{/snippet}