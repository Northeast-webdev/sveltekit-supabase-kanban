<script lang="ts">
	import { page } from '$app/stores';
	import BulkActionBar from '$lib/components/BulkActionBar.svelte';
	import Card from '$lib/components/Card.svelte';
	import Column from '$lib/components/Column.svelte';
	import UndoNotification from '$lib/components/UndoNotification.svelte';
	import { cards, columns, currentBoard, loadBoard } from '$lib/stores/boardStore';
	import { supabase } from '$lib/supabase';
	import type { Card as CardType, Column as ColumnType } from '$lib/types';
	import { closestCorners, DndContext, DragOverlay } from '@dnd-kit/core';
	import { horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';
	import { onMount } from 'svelte';

	let activeId: string | null = null;
	let activeType: 'COLUMN' | 'CARD' | null = null;
	let clonedColumns: ColumnType[] = [];
	let clonedCards: CardType[] = [];

	onMount(async () => {
		await loadBoard($page.params.id);
		clonedColumns = $columns;
		clonedCards = $cards;
	});

	async function handleDragStart(event) {
		const { active } = event;
		activeId = active.id;
		activeType = active.data.current?.type;

		if (activeType === 'COLUMN') {
			clonedColumns = [...$columns];
		} else if (activeType === 'CARD') {
			clonedCards = [...$cards];
		}
	}

	async function handleDragOver(event) {
		const { active, over } = event;
		if (!over) return;

		const activeCard = $cards.find((card) => card.id === active.id);
		const overCard = $cards.find((card) => card.id === over.id);

		if (!activeCard || !overCard) return;

		if (activeCard.column_id !== overCard.column_id) {
			const newCards = $cards.map((card) => {
				if (card.id === activeCard.id) {
					return { ...card, column_id: overCard.column_id };
				}
				return card;
			});
			cards.set(newCards);
		}
	}

	async function handleDragEnd(event) {
		const { active, over } = event;

		if (!over) {
			activeId = null;
			activeType = null;
			return;
		}

		if (activeType === 'COLUMN' && active.id !== over.id) {
			const oldIndex = $columns.findIndex((col) => col.id === active.id);
			const newIndex = $columns.findIndex((col) => col.id === over.id);

			const newColumns = [...$columns];
			const [movedColumn] = newColumns.splice(oldIndex, 1);
			newColumns.splice(newIndex, 0, movedColumn);

			// Update order in database
			const updates = newColumns.map((col, index) => ({
				id: col.id,
				order: index
			}));

			const { error } = await supabase.from('columns').upsert(updates);

			if (!error) {
				columns.set(newColumns);
			}
		}

		if (activeType === 'CARD' && active.id !== over.id) {
			const activeCard = $cards.find((card) => card.id === active.id);
			const overCard = $cards.find((card) => card.id === over.id);

			if (!activeCard || !overCard) return;

			const oldIndex = $cards.findIndex((card) => card.id === active.id);
			const newIndex = $cards.findIndex((card) => card.id === over.id);

			const newCards = [...$cards];
			const [movedCard] = newCards.splice(oldIndex, 1);
			newCards.splice(newIndex, 0, movedCard);

			// Update order and column_id in database
			const updates = newCards.map((card, index) => ({
				id: card.id,
				order: index,
				column_id: card.column_id
			}));

			const { error } = await supabase.from('cards').upsert(updates);

			if (!error) {
				cards.set(newCards);
			}
		}

		activeId = null;
		activeType = null;
	}
</script>

{#if $currentBoard}
	<div class="p-6">
		<h1 class="mb-6 text-2xl font-bold">{$currentBoard.name}</h1>
		<DndContext
			collisionDetection={closestCorners}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
		>
			<div class="flex gap-4 overflow-x-auto">
				<SortableContext
					items={$columns.map((col) => col.id)}
					strategy={horizontalListSortingStrategy}
				>
					{#each $columns as column (column.id)}
						<Column
							{column}
							cards={$cards.filter((card) => card.column_id === column.id)}
							isOverlay={false}
						/>
					{/each}
				</SortableContext>
			</div>

			<DragOverlay>
				{#if activeId && activeType === 'COLUMN'}
					{@const column = $columns.find((col) => col.id === activeId)}
					{#if column}
						<Column
							{column}
							cards={$cards.filter((card) => card.column_id === column.id)}
							isOverlay={true}
						/>
					{/if}
				{/if}
				{#if activeId && activeType === 'CARD'}
					{@const card = $cards.find((c) => c.id === activeId)}
					{#if card}
						<Card {card} isOverlay={true} />
					{/if}
				{/if}
			</DragOverlay>
		</DndContext>
		<BulkActionBar />
		<UndoNotification />
	</div>
{/if}
