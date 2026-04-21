import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { buildSystemPrompt, type ChatConfig } from "@/lib/spanish-chat";

const hackclub = createOpenRouter({
	apiKey: process.env.HACK_CLUB_AI_API_KEY,
	baseURL: "https://ai.hackclub.com/proxy/v1",
});

export async function POST(req: Request) {
	const { messages, config }: { messages: UIMessage[]; config?: ChatConfig } =
		await req.json();

	const system = config
		? buildSystemPrompt(config)
		: "You are a helpful assistant. Always respond in Spanish.";

	const result = streamText({
		model: hackclub("google/gemini-3-flash-preview"),
		system,
		messages: await convertToModelMessages(messages),
	});

	return result.toUIMessageStreamResponse();
}
