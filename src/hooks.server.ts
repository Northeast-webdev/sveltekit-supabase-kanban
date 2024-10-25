import { supabase } from '$lib/supabase';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Protect all routes that start with /boards
	if (event.url.pathname.startsWith('/boards')) {
		const {
			data: { session }
		} = await supabase.auth.getSession();

		if (!session) {
			throw redirect(303, '/login');
		}
	}

	return resolve(event);
};
