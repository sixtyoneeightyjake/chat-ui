import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/core/providers/google";
import GitHub from "@auth/core/providers/github";
import { env } from "$env/dynamic/private";
import { Redis } from "@upstash/redis";
import type { Adapter } from "@auth/core/adapters";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";

// Initialize Redis client for Vercel KV
const redis = new Redis({
	url: env.KV_REST_API_URL || "",
	token: env.KV_REST_API_TOKEN || "",
});

// Create custom adapter for Vercel KV
const adapter: Adapter = UpstashRedisAdapter(redis);

export const { handle, signIn, signOut } = SvelteKitAuth({
	adapter,
	providers: [
		Google({
			clientId: env.AUTH_GOOGLE_ID || "",
			clientSecret: env.AUTH_GOOGLE_SECRET || "",
		}),
		GitHub({
			clientId: env.AUTH_GITHUB_ID || "",
			clientSecret: env.AUTH_GITHUB_SECRET || "",
		}),
	],
	secret: env.AUTH_SECRET,
	trustHost: true,
	session: {
		strategy: "database",
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	callbacks: {
		async session({ session, user }) {
			// Attach user ID to session
			if (session.user) {
				session.user.id = user.id;
			}
			return session;
		},
	},
	pages: {
		signIn: "/auth/signin",
	},
});
