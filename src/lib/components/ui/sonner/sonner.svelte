<script lang="ts">
	import Icon from "@iconify/svelte";
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from "svelte-sonner";

	let { ...restProps }: SonnerProps = $props();
</script>

<Sonner
	toastOptions={{ unstyled: true }}
	class="toaster group"
	{...restProps}
	>{#snippet loadingIcon()}
		<Icon icon="lucide:loader-2" class="size-4 animate-spin" />
	{/snippet}
	{#snippet successIcon()}
		<Icon icon="lucide:circle-check" class="size-4" />
	{/snippet}
	{#snippet errorIcon()}
		<Icon icon="lucide:octagon-x" class="size-4" />
	{/snippet}
	{#snippet infoIcon()}
		<Icon icon="lucide:info" class="size-4" />
	{/snippet}
	{#snippet warningIcon()}
		<Icon icon="lucide:triangle-alert" class="size-4" />
	{/snippet}
</Sonner>

<!-- Style mostly copied from sonner-svelte files but colors are altered -->
<style>
	:global([data-sonner-toast]) {
		padding: 16px;
		background: var(--normal-bg);
		border: 1px solid var(--normal-border);
		color: var(--normal-text);
		border-radius: var(--border-radius);
		box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
		width: var(--width);
		font-size: 13px;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	:global([data-sonner-toast]) :global([data-description]) {
		font-weight: 400;
		line-height: 1.4;
		color: var(--color-control-fg-disabled);
	}

	:global([data-rich-colors='true'][data-sonner-toast]
		[data-description]) {
		color: inherit;
	}

	:global([data-sonner-toast]) :global([data-title]) {
		font-weight: 500;
		line-height: 1.5;
		color: inherit;
	}

	:global([data-sonner-toast]) :global([data-icon]) {
		display: flex;
		height: 16px;
		width: 16px;
		position: relative;
		justify-content: flex-start;
		align-items: center;
		flex-shrink: 0;
		margin-left: var(--toast-icon-margin-start);
		margin-right: var(--toast-icon-margin-end);
	}

	
	:global([data-sonner-toast]) :global([data-icon]) > :global(*) {
		flex-shrink: 0;
	}

	:global([data-sonner-toast]) :global([data-icon]) :global(svg) {
		margin-left: var(--toast-svg-margin-start);
		margin-right: var(--toast-svg-margin-end);
	}

	:global([data-sonner-toast]) :global([data-content]) {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	:global([data-sonner-toast]) :global([data-button]) {
		border-radius: 4px;
		padding-left: 8px;
		padding-right: 8px;
		height: 24px;
		font-size: 12px;
		color: var(--color-control-fg-inverted);
		background: var(--color-control-inverted);
		margin-left: var(--toast-button-margin-start);
		margin-right: var(--toast-button-margin-end);
		border: none;
		font-weight: 500;
		cursor: pointer;
		outline: none;
		display: flex;
		align-items: center;
		flex-shrink: 0;
		transition:
			opacity 400ms,
			box-shadow 200ms;
	}

	:global([data-sonner-toast]) :global([data-button]:focus-visible) {
		box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.4);
	}

	:global([data-sonner-toast]) :global([data-button]:first-of-type) {
		margin-left: var(--toast-button-margin-start);
		margin-right: var(--toast-button-margin-end);
	}

	:global([data-sonner-toast]) :global([data-cancel]) {
		color: var(--normal-text);
		background: var(--color-control-overlay-hover);
	}

	:global([data-sonner-toast]) :global([data-close-button]) {
		position: absolute;
		left: var(--toast-close-button-start);
		right: var(--toast-close-button-end);
		top: 0;
		height: 20px;
		width: 20px;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0;
		color: var(--normal-text);
		background: var(--normal-bg);
		border: 1px solid var(--normal-border);
		transform: var(--toast-close-button-transform);
		border-radius: 50%;
		cursor: pointer;
		z-index: 1;
		transition:
			opacity 100ms,
			background 200ms,
			border-color 200ms;
	}

	:global([data-sonner-toast]) :global([data-close-button]:focus-visible) {
		box-shadow:
			0px 4px 12px rgba(0, 0, 0, 0.1),
			0 0 0 2px rgba(0, 0, 0, 0.2);
	}

	:global([data-sonner-toast]) :global([data-disabled='true']) {
		cursor: not-allowed;
	}

	:global([data-sonner-toast]:hover) :global([data-close-button]:hover) {
		/* TODO: Make this coloring more consistent with the rest of the design */
		background: var(--color-fg) !important;
		border-color: transparent !important;
		color: var(--color-bg) !important;
	}

	:global([data-sonner-toast][data-expanded='false'][data-front='false']
		)> :global(*) {
		opacity: 0;
	}

	:global([data-sonner-toaster] *) {
		--normal-bg: var(--color-control-bg);
		--normal-bg-hover: var(--color-control-bg-hover);
		--normal-border: var(--color-control-border);
		--normal-border-hover: var(--color-control-border-hover);
		--normal-text: var(--color-control-fg);

		--success-bg: var(--color-bg-success-muted);
		--success-border: var(--color-border-success-muted);
		--success-text: var(--color-fg-success);

		--info-bg: var(--color-bg-accent-muted);
		--info-border: var(--color-border-accent-muted);
		--info-text: var(--color-fg-accent);

		--warning-bg: var(--color-bg-warning-muted);
		--warning-border: var(--color-border-warning-muted);
		--warning-text: var(--color-fg-warning);

		--error-bg: var(--color-bg-danger-muted);
		--error-border: var(--color-border-danger-muted);
		--error-text: var(--color-fg-danger);
	}
</style>