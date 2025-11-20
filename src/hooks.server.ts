import { config, ready } from "$lib/server/config";
import type { Handle, HandleServerError, ServerInit, HandleFetch } from "@sveltejs/kit";
import { collections } from "$lib/server/database";
import { base } from "$app/paths";
import { handle as authHandle } from "$lib/server/authjs";
import { ERROR_MESSAGES } from "$lib/stores/errors";
import { checkAndRunMigrations } from "$lib/migrations/migrations";
import { building, dev } from "$app/environment";
import { logger } from "$lib/server/logger";
import { AbortedGenerations } from "$lib/server/abortedGenerations";
import { initExitHandler } from "$lib/server/exitHandler";
import { refreshConversationStats } from "$lib/jobs/refresh-conversation-stats";
import { adminTokenManager } from "$lib/server/adminToken";
import { isHostLocalhost } from "$lib/server/isURLLocal";
import { MetricsServer } from "$lib/server/metrics";
import { loadMcpServersOnStartup } from "$lib/server/mcp/registry";
import { sequence } from "@sveltejs/kit/hooks";
import { redirect } from "@sveltejs/kit";
import { ObjectId } from "mongodb";

export const init: ServerInit = async () => {
	// Wait for config to be fully loaded
	await ready;

	// TODO: move this code on a started server hook, instead of using a "building" flag
	if (!building) {
		// Ensure legacy env expected by some libs: map OPENAI_API_KEY -> HF_TOKEN if absent
		const canonicalToken = config.OPENAI_API_KEY || config.HF_TOKEN;
		if (canonicalToken) {
			process.env.HF_TOKEN ??= canonicalToken;
		}

		// Warn if legacy-only var is used
		if (!config.OPENAI_API_KEY && config.HF_TOKEN) {
			logger.warn(
				"HF_TOKEN is deprecated in favor of OPENAI_API_KEY. Please migrate to OPENAI_API_KEY."
			);
		}

		logger.info("Starting server...");
		initExitHandler();

		if (config.METRICS_ENABLED === "true") {
			MetricsServer.getInstance();
		}

		checkAndRunMigrations();
		refreshConversationStats();

		// Load MCP servers at startup
		loadMcpServersOnStartup();

		// Init AbortedGenerations refresh process
		AbortedGenerations.getInstance();

		adminTokenManager.displayToken();

		if (config.EXPOSE_API) {
			logger.warn(
				"The EXPOSE_API flag has been deprecated. The API is now required for chat-ui to work."
			);
		}
	}
};

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	// handle 404

	if (building) {
		throw error;
	}

	if (event.route.id === null) {
		return {
			message: `Page ${event.url.pathname} not found`,
		};
	}

	const errorId = crypto.randomUUID();

	logger.error({
		locals: event.locals,
		url: event.request.url,
		params: event.params,
		request: event.request,
		message,
		error,
		errorId,
		status,
		stack: error instanceof Error ? error.stack : undefined,
	});

	return {
		message: "An error occurred",
		errorId,
	};
};

// Custom handle for authentication enforcement
const authCheckHandle: Handle = async ({ event, resolve }) => {
	await ready.then(() => {
		config.checkForUpdates();
	});

	logger.debug({
		locals: event.locals,
		url: event.url.pathname,
		params: event.params,
		request: event.request,
	});

	function errorResponse(status: number, message: string) {
		const sendJson =
			event.request.headers.get("accept")?.includes("application/json") ||
			event.request.headers.get("content-type")?.includes("application/json");
		return new Response(sendJson ? JSON.stringify({ error: message }) : message, {
			status,
			headers: {
				"content-type": sendJson ? "application/json" : "text/plain",
			},
		});
	}

	// Admin API protection
	if (event.url.pathname.startsWith(`${base}/admin/`) || event.url.pathname === `${base}/admin`) {
		const ADMIN_SECRET = config.ADMIN_API_SECRET || config.PARQUET_EXPORT_SECRET;

		if (!ADMIN_SECRET) {
			return errorResponse(500, "Admin API is not configured");
		}

		if (event.request.headers.get("Authorization") !== `Bearer ${ADMIN_SECRET}`) {
			return errorResponse(401, "Unauthorized");
		}
	}

	// Public routes that don't require authentication
	const publicRoutes = [
		`${base}/auth/signin`,
		`${base}/healthcheck`,
	];

	const isPublicRoute = publicRoutes.some(route => event.url.pathname.startsWith(route));

	// Check if user is authenticated via Auth.js
	const session = await event.locals.getSession();

	if (!session && !isPublicRoute) {
		// Redirect to sign-in page with callback URL
		throw redirect(303, `${base}/auth/signin?callbackUrl=${encodeURIComponent(event.url.pathname + event.url.search)}`);
	}

	// Attach user info to locals if session exists
	if (session?.user) {
		// Convert session user ID to ObjectId (or create one based on the ID)
		const userId = ObjectId.isValid(session.user.id)
			? new ObjectId(session.user.id)
			: new ObjectId();

		event.locals.user = {
			_id: userId,
			email: session.user.email || "",
			name: session.user.name || "",
			avatarUrl: session.user.image || "",
			hfUserId: session.user.id,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		event.locals.sessionId = session.user.id;
	}

	// CSRF protection
	const requestContentType = event.request.headers.get("content-type")?.split(";")[0] ?? "";
	const nativeFormContentTypes = [
		"multipart/form-data",
		"application/x-www-form-urlencoded",
		"text/plain",
	];

	if (event.request.method === "POST") {
		if (nativeFormContentTypes.includes(requestContentType)) {
			const origin = event.request.headers.get("origin");

			if (!origin) {
				return errorResponse(403, "Non-JSON form requests need to have an origin");
			}

			const validOrigins = [
				new URL(event.request.url).host,
				...(config.PUBLIC_ORIGIN ? [new URL(config.PUBLIC_ORIGIN).host] : []),
			];

			if (!validOrigins.includes(new URL(origin).host)) {
				return errorResponse(403, "Invalid referer for POST request");
			}
		}
	}

	let replaced = false;

	const response = await resolve(event, {
		transformPageChunk: (chunk) => {
			if (replaced || !chunk.html.includes("%gaId%")) {
				return chunk.html;
			}
			replaced = true;
			return chunk.html.replace("%gaId%", config.PUBLIC_GOOGLE_ANALYTICS_ID);
		},
		filterSerializedResponseHeaders: (header) => {
			return header.includes("content-type");
		},
	});

	// Add CSP header to disallow framing if ALLOW_IFRAME is not "true"
	if (config.ALLOW_IFRAME !== "true") {
		response.headers.append("Content-Security-Policy", "frame-ancestors 'none';");
	}

	// API CORS headers
	if (event.url.pathname.startsWith(`${base}/api/`)) {
		const requestOrigin = event.request.headers.get("origin");
		let allowedOrigin = config.PUBLIC_ORIGIN ? new URL(config.PUBLIC_ORIGIN).origin : undefined;

		if (
			dev ||
			!requestOrigin ||
			isHostLocalhost(new URL(requestOrigin).hostname)
		) {
			allowedOrigin = "*";
		} else if (allowedOrigin === requestOrigin) {
			allowedOrigin = requestOrigin;
		}

		if (allowedOrigin) {
			response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
			response.headers.set(
				"Access-Control-Allow-Methods",
				"GET, POST, PUT, PATCH, DELETE, OPTIONS"
			);
			response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
		}
	}

	return response;
};

// Sequence the Auth.js handle with our custom auth check
export const handle: Handle = sequence(authHandle, authCheckHandle);

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	if (isHostLocalhost(new URL(request.url).hostname)) {
		const cookieHeader = event.request.headers.get("cookie");
		if (cookieHeader) {
			const headers = new Headers(request.headers);
			headers.set("cookie", cookieHeader);

			return fetch(new Request(request, { headers }));
		}
	}

	return fetch(request);
};
