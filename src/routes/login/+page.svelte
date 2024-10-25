<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';

	let email = '';
	let password = '';
	let errorMessage = '';
	let loading = false;

	async function handleLogin() {
		loading = true;
		errorMessage = '';

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			errorMessage = error.message;
		} else {
			goto('/');
		}

		loading = false;
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
	<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
		<h1 class="mb-8 text-center text-2xl font-bold">Login to Kanban</h1>

		<form on:submit|preventDefault={handleLogin} class="space-y-4">
			<div>
				<label class="block text-sm font-medium text-gray-700" for="email"> Email </label>
				<input
					type="email"
					id="email"
					bind:value={email}
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					required
				/>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700" for="password"> Password </label>
				<input
					type="password"
					id="password"
					bind:value={password}
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					required
				/>
			</div>

			{#if errorMessage}
				<p class="text-sm text-red-500">{errorMessage}</p>
			{/if}

			<button
				type="submit"
				class="flex w-full justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				disabled={loading}
			>
				{loading ? 'Logging in...' : 'Login'}
			</button>

			<p class="text-center text-sm text-gray-600">
				Don't have an account?
				<a href="/signup" class="text-blue-500 hover:text-blue-600">Sign up</a>
			</p>
		</form>
	</div>
</div>
