<script lang="ts">
	import { cards, selectedCards, undoHistory } from '$lib/stores/boardStore';
	import { supabase } from '$lib/supabase';
	import { slide } from 'svelte/transition';

	$: isVisible = $selectedCards.size > 0;

	async function handleBulkComplete(complete: boolean) {
		const cardsToUpdate = [...$selectedCards];
		const previousState = $cards.filter((c) => cardsToUpdate.includes(c.id));

		const { error } = await supabase
			.from('cards')
			.update({ is_complete: complete })
			.in('id', cardsToUpdate);

		if (!error) {
			cards.update((currentCards) =>
				currentCards.map((card) =>
					cardsToUpdate.includes(card.id) ? { ...card, is_complete: complete } : card
				)
			);

			undoHistory.update((history) => [
				{
					action: complete ? 'completed' : 'uncompleted',
					timestamp: Date.now(),
					cards: previousState,
					restore: async () => {
						await supabase.from('cards').update(
							previousState.map((card) => ({
								id: card.id,
								is_complete: card.is_complete
							}))
						);
						cards.update((current) =>
							current.map((c) =>
								cardsToUpdate.includes(c.id)
									? { ...previousState.find((p) => p.id === c.id)!, is_complete: !complete }
									: c
							)
						);
					}
				},
				...history
			]);
		}
		selectedCards.set(new Set());
	}

	async function handleBulkArchive() {
		const cardsToArchive = [...$selectedCards];
		const previousState = $cards.filter((c) => cardsToArchive.includes(c.id));

		const { error } = await supabase
			.from('cards')
			.update({
				archived: true,
				archived_at: new Date().toISOString()
			})
			.in('id', cardsToArchive);

		if (!error) {
			cards.update((currentCards) =>
				currentCards.map((card) =>
					cardsToArchive.includes(card.id)
						? { ...card, archived: true, archived_at: new Date().toISOString() }
						: card
				)
			);

			undoHistory.update((history) => [
				{
					action: 'archived',
					timestamp: Date.now(),
					cards: previousState,
					restore: async () => {
						await supabase.from('cards').update(
							previousState.map((card) => ({
								id: card.id,
								archived: false,
								archived_at: null
							}))
						);
						cards.update((current) =>
							current.map((c) =>
								cardsToArchive.includes(c.id) ? { ...c, archived: false, archived_at: null } : c
							)
						);
					}
				},
				...history
			]);
		}
		selectedCards.set(new Set());
	}
</script>

{#if isVisible}
	<div
		class="fixed bottom-4 left-1/2 flex -translate-x-1/2 transform items-center gap-4 rounded-lg bg-white px-6 py-4 shadow-lg"
		transition:slide
	>
		<span class="font-medium">{$selectedCards.size} items selected</span>
		<div class="flex gap-2">
			<button
				class="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
				on:click={() => handleBulkComplete(true)}
			>
				Mark Complete
			</button>
			<button
				class="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
				on:click={() => handleBulkComplete(false)}
			>
				Mark Incomplete
			</button>
			<button
				class="rounded bg-gray-500 px-3 py-1 text-white hover:bg-gray-600"
				on:click={handleBulkArchive}
			>
				Archive
			</button>
		</div>
	</div>
{/if}
