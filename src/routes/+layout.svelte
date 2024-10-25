<script lang="ts">
	import { user } from '$lib/stores/authStore';
	import { supabase } from '$lib/supabase';
	import { onMount } from 'svelte';

	onMount(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			user.set(session?.user ?? null);
		});

		supabase.auth.onAuthStateChange((_event, session) => {
			user.set(session?.user ?? null);
		});
	});
</script>

<div class="min-h-screen bg-gray-100">
	<nav class="bg-white shadow">
		<!-- Add navigation components -->
	</nav>
	<main>
		<slot />
	</main>
</div>
