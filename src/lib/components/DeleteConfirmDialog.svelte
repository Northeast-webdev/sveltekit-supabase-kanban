<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let title: string;
	export let message: string;
	export let isOpen: boolean;

	const dispatch = createEventDispatcher();
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<div class="mx-4 w-full max-w-md rounded-lg bg-white p-6">
			<h3 class="mb-2 text-lg font-semibold">{title}</h3>
			<p class="mb-6 text-gray-600">{message}</p>
			<div class="flex justify-end gap-3">
				<button
					class="px-4 py-2 text-gray-600 hover:text-gray-800"
					on:click={() => dispatch('cancel')}
				>
					Cancel
				</button>
				<button
					class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
					on:click={() => dispatch('confirm')}
				>
					Delete
				</button>
			</div>
		</div>
	</div>
{/if}
