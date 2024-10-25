<script lang="ts">
	import { undoHistory } from '$lib/stores/boardStore';
	import { fly } from 'svelte/transition';

	const NOTIFICATION_DURATION = 5000; // 5 seconds

	$: lastAction = $undoHistory[0];

	let timeoutId: any;

	$: if (lastAction) {
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			undoHistory.update((history) => history.slice(1));
		}, NOTIFICATION_DURATION);
	}

	function handleUndo() {
		if (lastAction) {
			lastAction.restore();
			undoHistory.update((history) => history.slice(1));
		}
	}
</script>

{#if lastAction}
	<div
		class="fixed bottom-4 right-4 flex items-center gap-4 rounded-lg bg-gray-800 px-4 py-3 text-white shadow-lg"
		transition:fly={{ y: 50, duration: 300 }}
	>
		<span>
			{lastAction.cards.length} cards {lastAction.action}
		</span>
		<button class="font-medium text-blue-300 hover:text-blue-400" on:click={handleUndo}>
			Undo
		</button>
	</div>
{/if}
