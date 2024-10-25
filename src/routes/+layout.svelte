<script lang="ts">
	import '../app.css'; // Assuming you're using TailwindCSS
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { initializeAuth, user } from '$lib/stores/authStore';
	import { supabase } from '$lib/supabase';
	import { onMount } from 'svelte';

	onMount(() => {
		initializeAuth();
	});

	async function handleSignOut() {
		await supabase.auth.signOut();
		goto('/login');
	}
</script>

<div class="min-h-screen bg-gray-50">
	{#if !$page.url.pathname.startsWith('/login') && !$page.url.pathname.startsWith('/signup')}
		<nav class="bg-white shadow">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div class="flex h-16 justify-between">
					<div class="flex">
						<div class="flex flex-shrink-0 items-center">
							<a href="/" class="text-xl font-bold text-blue-600"> Kanban </a>
						</div>
					</div>

					{#if $user}
						<div class="flex items-center">
							<span class="mr-4 text-gray-700">{$user.email}</span>
							<button on:click={handleSignOut} class="text-gray-500 hover:text-gray-700">
								Sign Out
							</button>
						</div>
					{/if}
				</div>
			</div>
		</nav>
	{/if}

	<main>
		<slot />
	</main>
</div>
