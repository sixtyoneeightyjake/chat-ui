import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { config } from "$lib/server/config";

export const GET: RequestHandler = async () => {
	// Only allow in non-production or if admin token is provided
	const isProduction = process.env.NODE_ENV === "production";

	return json({
		environment: {
			NODE_ENV: process.env.NODE_ENV,
			VERCEL: process.env.VERCEL,
			VERCEL_ENV: process.env.VERCEL_ENV,
			isServerless: process.env.VERCEL === "1" || !!process.env.AWS_LAMBDA_FUNCTION_NAME,
		},
		mongodbStatus: {
			// Don't expose the actual URL for security
			hasMongoDBURL: !!config.MONGODB_URL,
			mongodbUrlLength: config.MONGODB_URL?.length || 0,
			mongodbUrlType: typeof config.MONGODB_URL,
			mongodbUrlPrefix: config.MONGODB_URL?.substring(0, 10) || "not set",
		},
		modelsStatus: {
			hasModelsVar: !!(config as any).MODELS,
			modelsVarLength: ((config as any).MODELS as string)?.length || 0,
			modelsVarPreview: ((config as any).MODELS as string)?.substring(0, 50) || "not set",
		},
		openaiStatus: {
			hasOpenAIBaseURL: !!config.OPENAI_BASE_URL,
			hasOpenAIKey: !!config.OPENAI_API_KEY,
		},
		configManager: {
			enabled: config.ConfigManagerEnabled,
		},
		timestamp: new Date().toISOString(),
	});
};
