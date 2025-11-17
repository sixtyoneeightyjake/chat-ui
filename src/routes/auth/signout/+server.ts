import { signOut } from "$lib/server/authjs";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
	// Sign out using Auth.js
	await signOut(event);

	// Redirect to sign-in page
	throw redirect(303, "/auth/signin");
};
