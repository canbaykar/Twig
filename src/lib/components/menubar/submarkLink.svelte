<script>
    import Submark from "$lib/branding/submark.svelte";
</script>
<a
	class="relative ml-1 shrink-0 cursor-pointer w-6 h-6"
	href="https://github.com/canbaykar/Twig"
	target="_blank" rel="noopener noreferrer"
>
	<span class="sr-only">View Twig on GitHub</span>
	<Submark class="submark absolute top-0" aria-hidden="true" />
	<div class="submark-hovered" aria-hidden="true">
		<div class="shadow absolute inset-x-1 inset-y-0.5"></div>
		<Submark class="absolute top-0" colored />
	</div>
</a>

<style>
	a {
		/* outline: none; */
		outline-offset: 4px;
		border-radius: 4px;
		&:focus-visible {
			outline: 2px solid;
			animation: focused 2s forwards;
		}
	}

	@keyframes focused {
		from {
			outline-color: var(--color-focus-outline);
		}
		to {
			outline-color: transparent;
		}
	}

	.shadow {
		box-shadow: 
		0 4px 20px -1px var(--color-accent-200), 
		0 2px 5px -2px var(--color-fg),
		0 0px 3px var(--color-fg);
	}
	a :global(.submark),
	a :global(.submark-hovered) {
		transition: opacity 1.5s;
	}
	a :global(.submark-hovered) {
		opacity: 0;
	}

	/* a, */
	a:hover,
	a:focus {
		:global(.submark) {
			opacity: 0;
		}
		:global(.submark-hovered) {
			opacity: 1;
		}
		.shadow {
			opacity: 1;
		}
	}
</style>