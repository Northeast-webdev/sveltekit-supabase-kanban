<script lang="ts">
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/authStore';
	import { supabase } from '$lib/supabase';
	import { onMount } from 'svelte';

	let boards: any[] = [];

	onMount(async () => {
		if (!$user) {
			goto('/login');
			return;
		}

		const { data, error } = await supabase
			.from('boards')
			.select('*')
			.eq('user_id', $user.id)
			.order('created_at', { ascending: false });

		if (data) boards = data;
	});

	async function createBoard() {
		const { data, error } = await supabase
			.from('boards')
			.insert([{ name: 'New Board', user_id: $user?.id }])
			.select()
			.single();
		console.log(error);
		if (data) {
			goto(`/boards/${data.id}`);
		}
	}
</script>

<div class="mx-auto max-w-4xl p-6">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold">My Boards</h1>
		<button
			class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
			on:click={createBoard}
		>
			Create New Board
		</button>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each boards as board}
			<a
				href="/boards/{board.id}"
				class="block rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
			>
				<h2 class="mb-2 text-xl font-semibold">{board.name}</h2>
				<p class="text-sm text-gray-500">
					Created {new Date(board.created_at).toLocaleDateString()}
				</p>
			</a>
		{/each}
	</div>
</div>
