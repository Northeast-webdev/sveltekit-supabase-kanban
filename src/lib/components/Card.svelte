<script lang="ts">
	import { cards } from '$lib/stores/boardStore';
	import { supabase } from '$lib/supabase';
	import { useSortable } from '@dnd-kit/sortable';
	import { CSS } from '@dnd-kit/utilities';
	import { fade } from 'svelte/transition';
	import type { Card } from '../types';
	import DeleteConfirmDialog from './DeleteConfirmDialog.svelte';

	export let card: Card;
	export let isOverlay = false;

	let showDeleteDialog = false;
	let isUpdating = false;

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: card.id,
		data: {
			type: 'CARD',
			card
		}
	});

	$: style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1
	};

	async function toggleComplete() {
		isUpdating = true;
		const { error } = await supabase
			.from('cards')
			.update({ is_complete: !card.is_complete })
			.eq('id', card.id);

		if (!error) {
			cards.update((currentCards) =>
				currentCards.map((c) => (c.id === card.id ? { ...c, is_complete: !c.is_complete } : c))
			);
		}
		isUpdating = false;
	}

	async function deleteCard() {
		const { error } = await supabase.from('cards').delete().eq('id', card.id);

		if (!error) {
			cards.update((currentCards) => currentCards.filter((c) => c.id !== card.id));
		}
		showDeleteDialog = false;
	}
</script>

<DeleteConfirmDialog
	title="Delete Task"
	message="Are you sure you want to delete this task? This action cannot be undone."
	isOpen={showDeleteDialog}
	on:confirm={deleteCard}
	on:cancel={() => (showDeleteDialog = false)}
/>

<div
	class="group relative cursor-move rounded bg-white p-3 shadow"
	class:shadow-2xl={isOverlay}
	class:opacity-75={card.is_complete}
	use:setNodeRef
	{style}
	{...attributes}
	{...listeners}
	transition:fade
>
	<div class="flex items-start justify-between gap-2">
		<div class="flex flex-1 items-start gap-2">
			<button class="mt-1 flex-shrink-0" on:click={toggleComplete} disabled={isUpdating}>
				<div
					class="flex h-4 w-4 items-center justify-center rounded border-2
                    {card.is_complete ? 'border-green-500 bg-green-500' : 'border-gray-300'}"
				>
					{#if card.is_complete}
						<svg class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
							<path
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
							/>
						</svg>
					{/if}
				</div>
			</button>
			<div class={card.is_complete ? 'text-gray-500 line-through' : ''}>
				<h4 class="font-medium">{card.title}</h4>
				{#if card.description}
					<p class="mt-1 text-sm text-gray-600">{card.description}</p>
				{/if}
			</div>
		</div>
		<button
			class="text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
			aria-label="Open Dialog"
			on:click={() => (showDeleteDialog = true)}
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

	{#if card.due_date}
		<div class="mt-2 text-xs text-gray-500">
			Due: {new Date(card.due_date).toLocaleDateString()}
		</div>
	{/if}
	{#if card.assigned_to}
		<div class="mt-2 flex items-center gap-2">
			<div
				class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs text-white"
			>
				{card.assigned_to[0].toUpperCase()}
			</div>
		</div>
	{/if}
</div>
