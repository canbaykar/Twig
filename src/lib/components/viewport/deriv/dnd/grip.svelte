<script lang="ts">
	interface Props {
		x?: string;
		y?: string;
		[key: string]: any;
	}

	let { x = "0", y = "0", ...restProps }: Props = $props();
</script>

<svg viewBox="6 2 12 20" style="top: {y}; left: {x}" height="0.5em" {...restProps}>
	<g id="GripVertical" fill="currentColor">
		<circle cx="9" cy="12" r="2"></circle>
		<circle cx="9" cy="5" r="2"></circle>
		<circle cx="9" cy="19" r="2"></circle>
		<circle cx="15" cy="12" r="2"></circle>
		<circle cx="15" cy="5" r="2"></circle>
		<circle cx="15" cy="19" r="2"></circle>
	</g>
</svg>

<style>
	svg {
		translate: -50% -50%;
		cursor: all-scroll;
	}
</style>