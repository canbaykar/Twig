<script module lang="ts">
    import Bg from './bg.svelte';
	import Deriv from '$lib/state/deriv.svelte';

    // Don't use the Bg component directly!
    // Instead render bgDependency at lteast once on the page and
    // Render bgRoot only on root nodes.
    export { bgDependency, bgRoot };

	const saturate = 1.5;
	const lighten = 0.05;
    const lighten_ = 1 - lighten;

    const matrix = `
    ${(0.213 + 0.787 * saturate) * lighten_} ${(0.715 - 0.715 * saturate) * lighten_} ${(0.072 - 0.072 * saturate) * lighten_} 0 ${lighten}
    ${(0.213 - 0.213 * saturate) * lighten_} ${(0.715 + 0.285 * saturate) * lighten_} ${(0.072 - 0.072 * saturate) * lighten_} 0 ${lighten}
    ${(0.213 - 0.213 * saturate) * lighten_} ${(0.715 - 0.715 * saturate) * lighten_} ${(0.072 + 0.928 * saturate) * lighten_} 0 ${lighten}
    0 0 0 1 0`;
    
    const color = "var(--color-bg)";
    const padding = 3 * DT.UNIT;
    const rad = padding + 5 * DT.UNIT;
</script>

{#snippet bgDependency()}
    <svg class=" absolute invisible">
		<filter id="outlineFilter" color-interpolation-filters="sRGB">
            <feColorMatrix
            in="SourceGraphic"
            result="lightened"
            type="matrix"
            values={matrix} />
			<feMorphology operator="dilate" in="lightened" result="morphed" radius={1.1 * DT.UNIT / viewport.render.scale}/>
            <feComposite in="SourceGraphic" />
		</filter>
	</svg>
{/snippet}

{#snippet bgRoot(data: Deriv)}
    <svg class="pointer-events-none h-[1px] w-[1px] overflow-visible opacity-100" viewBox="0 0 1 1">
        <g id="g" filter="url(#outlineFilter)" fill={color}>
			<Bg {data} />
		</g>
    </svg>
{/snippet}

<script lang="ts">
	import { DT } from '../../../../DT';
	import viewport from '$lib/state/viewport.svelte';

	interface Props {
		data: Deriv;
	}

	let { data }: Props = $props();
</script>

<!-- For formula -->
<rect
    x={data.render.x - data.render.width / 2 - padding}
    y={data.render.y - DT.derivLineHeightN - padding}
    width={data.render.width + 2 * padding}
    height={DT.derivLineHeightN + 2 * padding}
    rx={Math.min(rad / viewport.render.scale, (DT.derivLineHeightN + 2 * padding) / 2)}
/>

<!-- Recursion for children -->
{#each data.children as child (child)}
    <Bg data={child} />
{/each}

<!-- For bar -->
{#if data.render.hasBar}
    <rect
        x={data.render.x - data.render.barWidth / 2 - padding}
        y={data.render.y - DT.derivBarBottomN - padding - DT.UNIT}
        width={data.render.barWidth + 2 * padding}
        height={DT.UNIT + 2 * padding}
        rx={(DT.UNIT + 2 * padding) / 2}
    />
    
    <!-- For label -->
    {#if data.render.hasLabel}
        <rect
            x={data.render.x - DT.derivBarGapN - data.render.barWidth / 2 - data.render.labelWidth - padding}
            y={data.render.y - DT.derivBarBottomN + DT.derivLabelBottomN - DT.UNIT - padding}
            width={data.render.labelWidth + 2 * padding}
            height={DT.derivLabelHeightN + 2 * padding}
            rx={DT.derivLabelHeightN / 2 + padding}
        />
    {/if}

    
    <!-- For label -->
    {#if data.render.hasRule}
        {#if data.render.discharged}
            <rect
                x={data.render.x + DT.derivBarGapN + data.render.barWidth / 2 - padding}
                y={data.render.y - DT.derivBarBottomN + DT.derivLabelBottomN - DT.UNIT - padding}
                width={data.render.ruleWidth + 2 * padding}
                height={DT.derivLabelHeightN + 2 * padding}
                rx={DT.derivLabelHeightN / 2 + padding}
            />
        {:else}
            <rect
                x={data.render.x + DT.derivRuleLeftN + data.render.barWidth / 2 + DT.derivRuleParanthesisGapN - padding}
                y={data.render.y - DT.derivBarBottomN + DT.derivRuleBottomN + (DT.derivRuleHeightN - DT.derivLabelHeightN) / 2 - DT.UNIT - padding}
                width={data.render.ruleWidth + 2 * (padding - DT.derivRuleParanthesisGapN)}
                height={DT.derivLabelHeightN + 2 * padding}
                rx={DT.derivLabelHeightN / 2 + padding}
            />
        {/if}
    {/if}
{/if}