// src/lib/stores/authStore.ts
import { supabase } from '$lib/supabase';
import type { User } from '@supabase/supabase-js';
import { writable } from 'svelte/store';

export const user = writable<User | null>(null);

export async function initializeAuth() {
	const {
		data: { session }
	} = await supabase.auth.getSession();
	user.set(session?.user ?? null);

	supabase.auth.onAuthStateChange((_event, session) => {
		user.set(session?.user ?? null);
	});
}
