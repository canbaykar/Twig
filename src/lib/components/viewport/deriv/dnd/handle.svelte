<script lang="ts">
	import Deriv from '$lib/state/deriv.svelte';
	import GripVertical from '~icons/lucide/grip-vertical';
	import type { DraggableOptions } from '$lib/utils/interact/draggable.svelte';
	import draggable from '$lib/utils/interact/draggable.svelte';
	import viewport from '$lib/state/viewport.svelte';
	import { DT } from '../../../../../DT';
	import { IndicatorPopup } from './indicatorPopup.svelte';
	import { zoneTypes, type ZoneData } from './zoneData';
	import { zoneDataFromPoint } from './dropzones.svelte';

	interface Props {
		data: Deriv;
		[key: string]: any;
	}

	let { data, ...restProps }: Props = $props();

	const opt: DraggableOptions = {
		cursor: 'all-scroll',
		start(e) {
			data.render.dragged = true;
			viewport.render.dragLog(true);

			// null: free, else: bound (assumes parent can't be null while dragging!)
			const free = () => data.parent === viewport;
			let zd: ZoneData | null = free() ? null : new zoneTypes.initial(data);

			// Rectangle popup that indicates current binding zone rect
			const indicator = new IndicatorPopup();

			// if (free()) shrinkTree();

			function updateZD() {
				const x = data.render.x;
				const y = data.render.y;

                const tr = getTransition(x, y);
                if (tr) {
                    tr[0]?.exit(data);
                    tr[1]?.enter(data);

                    zd = tr[1];

                    data.render.moveTo(x, y);

					// If entering caused an exit, move viewport to prevent it
					if (zd) inBoundingRectFix(data, x, y);
                }

				// if (free()) shrinkTree();

				indicateBoundingRect(data, zd, indicator);
			}

            function getTransition(x: number, y: number): false | [ZoneData | null, ZoneData | null] {
                const oldZ = zd;
                let   newZ = zd;

                // Did we exit a zone?
                if (newZ && !inBoundingRect(data, x, y)) newZ = null;
                // Did we enter a zone?
                if (!newZ) newZ = zoneDataFromPoint(x, y);

                return oldZ === newZ ? false : [oldZ, newZ];
            }

			return {
				move(e) {
					const cl2wrld = viewport.render.cl2wrld;
					data.render.xTransform += cl2wrld.scale(e.dx);
					data.render.yTransform += cl2wrld.scale(e.dy);

					updateZD();
				},

				end(e) {
					data.render.dragged = false;
					viewport.render.dragLog(false);

					updateZD();
					if (zd) zd.drop(data);

					// Reset stuff used for DND
					if (data.parent !== viewport) data.render.xTransform = data.render.yTransform = 0;
					data.render.treeOverwrite = null;

					indicator.detach();
					// data.render.treeOverwrite = null;
				}
			};
		}
	};

	function getBindingRect(d: Deriv) {
		const padding = DT.derivDropZonePaddingN;
		// Half width
		const w2 = d.render.width / 2 + padding;
		// TODO: Change DerivRenderData so as to remove these two
		const xBase = d.render.x - d.render.xTransform;
		const yBase = d.render.y - d.render.yTransform;
		let left = xBase - w2;
		let right = xBase + w2;

		// Stretch rect to neighbouring siblings' centers or to ends
		// of the parent's child zone
		if (d.parent instanceof Deriv) {
			const zoneRect = zoneTypes['child'].getElementRect(d.parent);
			zoneRect.left += d.parent.render.x;

			const prevSib = d.parent.children[d.childIndex - 1];
			left = Math.min(left, prevSib ? prevSib.render.x : zoneRect.left - padding);

			const nextSib = d.parent.children[d.childIndex + 1];
			right = Math.max(
				right,
				nextSib ? nextSib.render.x : zoneRect.left + zoneRect.width + padding
			);
		}

		return {
			left,
			top: yBase - DT.derivBarBottomN - padding,
			width: right - left,
			height: DT.derivRowOffsetN + padding * 2
		};
	}

	function inBoundingRect(data: Deriv, x: number, y: number, r = getBindingRect(data)) {
		return y >= r.top && y - r.top <= r.height && x >= r.left && x - r.left <= r.width;
	}

	/** Displacement to make inBoundingRect true (+ margin stuff) */
	// Takes in the possibility width or height < 2 * margin
	function inBoundingRectFix(data: Deriv, x: number, y: number) {
		const r = getBindingRect(data);
		if (inBoundingRect(data, x, y, r)) return; // No fix needed

		// Calculate margins to shrink rect by
		const m = DT.derivDropZonePaddingN;
		const mx = Math.min(m, r.width / 2);
		const my = Math.min(m, r.height / 2);

		// Calculate displaced coords
		let x_ = x;
		let y_ = y;
		y_ = Math.max(y_, r.top + my);
		y_ = Math.min(y_, r.top + r.height - my);
		x_ = Math.max(x_, r.left + mx);
		x_ = Math.min(x_, r.left + r.width - mx);

		// Apply displacement
		viewport.render.x -= (x_ - x) / DT.UNIT;
		viewport.render.y -= (y_ - y) / DT.UNIT;
		data.render.moveTo(x_, y_);
	}

	function indicateBoundingRect(dragged: Deriv, zd: ZoneData | null, ind: IndicatorPopup) {
		if (zd) {
			const r = getBindingRect(dragged);
			ind.left = r.left;
			ind.top = r.top;
			ind.width = r.width;
			ind.height = r.height;
			ind.opacity = 1;
		} else {
			// If zd is null, make ind invisible but keep it on dragged deriv for animation
			ind.opacity = 0;
			ind.left = data.render.x - data.render.width / 2;
			ind.top = data.render.y - DT.derivBarBottomN;
			ind.width = data.render.width;
			ind.height = DT.derivRowOffsetN;
		}
	}

	// function shrinkTree() {
	//     const tree = data.render.tree;
	//     data.render.treeOverwrite = {
	//         ...tree,
	//         collider: {
	//             l: tree.collider.l.slice(0,1),
	//             r: tree.collider.r.slice(0,1),
	//         },
	//     };
	// }
</script>

<!-- TODO: Remove "relative!" -->
<div
	{...restProps}
	use:draggable={opt}
	class="handle inset-y-0 flex cursor-all-scroll items-center {restProps?.class ?? ''}"
>
	<GripVertical width="0.75em" height="0.75em" class="relative!" />
</div>

<style>
	:global(.deriv) .handle {
		opacity: 0;
	}
	:global(.deriv.dragged) .handle,
	:global(.deriv:hover) .handle {
		opacity: 1;
	}
</style>
