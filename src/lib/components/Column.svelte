<script lang="ts">
	import { columns, selectedCards } from '$lib/stores/boardStore';
	import { supabase } from '$lib/supabase';
	import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
	import { CSS } from '@dnd-kit/utilities';
	import type { Card as CardType, Column } from '../types';
	import Card from './Card.svelte';
	import ColumnStats from './ColumnStats.svelte';
	import DeleteConfirmDialog from './DeleteConfirmDialog.svelte';

	export let column: Column;
	export let cards: CardType[];
	export let isOverlay = false;

	let showDeleteDialog = false;

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: column.id,
		data: {
			type: 'COLUMN',
			column
		}
	});

	$: style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1
	};

	async function deleteColumn() {
		const { error } = await supabase.from('columns').delete().eq('id', column.id);

		if (!error) {
			// Remove column and its cards from stores
			columns.update((cols) => cols.filter((c) => c.id !== column.id));
			cards.update((currentCards) => currentCards.filter((card) => card.column_id !== column.id));
		}
		showDeleteDialog = false;
	}
	function handleCardSelect(cardId: string, selected: boolean) {
		selectedCards.update((current) => {
			const newSet = new Set(current);
			if (selected) {
				newSet.add(cardId);
			} else {
				newSet.delete(cardId);
			}
			return newSet;
		});
	}
</script>

<DeleteConfirmDialog
	title="Delete Column"
	message="Are you sure you want to delete this column and all its tasks? This action cannot be undone."
	isOpen={showDeleteDialog}
	on:confirm={deleteColumn}
	on:cancel={() => (showDeleteDialog = false)}
/>

<div
	class="w-80 rounded bg-gray-100 p-4"
	class:shadow-2xl={isOverlay}
	use:setNodeRef
	{style}
	{...attributes}
>
	<div class="mb-4 flex items-center justify-between">
		<h3 class="cursor-move font-semibold" {...listeners}>{column.name}</h3>

		<ColumnStats columnId={column.id} />
		<button
			class="text-gray-500 hover:text-red-500"
			on:click={() => (showDeleteDialog = true)}
			aria-label="Open Dialog"
		>
			<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
				<path
					fill-rule="evenodd"
					d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
	</div>

	<div class="space-y-2">
		<SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
			{#each cards.filter((card) => !card.archived) as card (card.id)}
				<div class="group relative">
					<input
						type="checkbox"
						class="absolute left-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
						checked={$selectedCards.has(card.id)}
						on:change={(e) => handleCardSelect(card.id, e.currentTarget.checked)}
					/>
					<Card {card} {isOverlay} />
				</div>
			{/each}
		</SortableContext>
	</div>

	<button class="mt-4 w-full text-left text-gray-600 hover:text-gray-900"> + Add a card </button>
</div>
