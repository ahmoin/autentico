"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowLeftIcon } from "lucide-react";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	Conversation,
	ConversationContent,
	ConversationEmptyState,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
	Message,
	MessageContent,
	MessageResponse,
} from "@/components/ai-elements/message";
import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	type PromptInputMessage,
	PromptInputSubmit,
	PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { type ChatConfig, extractScore } from "@/lib/spanish-chat";
import { cn } from "@/lib/utils";

export function ChatContent({
	config,
	onBack,
}: {
	config: ChatConfig;
	onBack: () => void;
}) {
	const [completion, setCompletion] = useState(0);
	const scoredMessages = useRef(new Set<string>());
	const started = useRef(false);

	const transport = useMemo(
		() => new DefaultChatTransport({ api: "/api/chat", body: { config } }),
		[],
	);

	const { messages, status, stop, sendMessage } = useChat({ transport });
	const isGenerating = status === "submitted" || status === "streaming";

	useEffect(() => {
		if (config.aiStarts && !started.current) {
			started.current = true;
			sendMessage({ text: "INICIAR_CONVERSACION" });
		}
	}, []);

	useEffect(() => {
		if (status !== "ready") return;
		const last = messages.at(-1);
		if (!last || last.role !== "assistant") return;
		if (scoredMessages.current.has(last.id)) return;
		scoredMessages.current.add(last.id);
		const text = last.parts
			.filter((p) => p.type === "text")
			.map((p) => p.text)
			.join("");
		const { score } = extractScore(text);
		setCompletion((prev) => Math.min(100, Math.max(0, prev + score)));
	}, [status, messages]);

	const handleSubmit = useCallback(
		async (msg: PromptInputMessage, _e: FormEvent<HTMLFormElement>) => {
			if (!msg.text.trim()) return;
			await sendMessage({ text: msg.text });
		},
		[sendMessage],
	);

	const visibleMessages = messages.filter((m) => {
		const text = m.parts
			.filter((p) => p.type === "text")
			.map((p) => p.text)
			.join("");
		return text !== "INICIAR_CONVERSACION";
	});

	const lastIsUser = messages.at(-1)?.role === "user";

	const completionColor =
		completion >= 75
			? "text-green-500"
			: completion >= 40
				? "text-yellow-500"
				: "text-muted-foreground";

	return (
		<div className="flex h-full flex-col">
			<div className="border-b px-6 py-2.5">
				<div className="mb-2 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Button variant="ghost" size="icon-sm" onClick={onBack}>
							<ArrowLeftIcon className="size-4" />
						</Button>
						<span className="text-sm font-medium">
							{config.scenario.icon} {config.scenario.name}
						</span>
						<span className="text-xs text-muted-foreground">
							· You: {config.userRole} · AI: {config.aiRole}
						</span>
					</div>
					<span
						className={cn("text-xs font-medium tabular-nums", completionColor)}
					>
						{completion}%
					</span>
				</div>
				<div className="space-y-1">
					<p className="text-[11px] text-muted-foreground">Completion level</p>
					<Progress value={completion} className="h-1" />
				</div>
			</div>

			<Conversation className="flex-1">
				<ConversationContent className="mx-auto w-full max-w-2xl">
					{visibleMessages.length === 0 && !isGenerating ? (
						<ConversationEmptyState
							title={`${config.scenario.icon} ${config.scenario.name}`}
							description={
								config.aiStarts
									? "The AI is starting the conversation..."
									: `Start the conversation as ${config.userRole}`
							}
						/>
					) : (
						visibleMessages.map((message) => {
							const rawText = message.parts
								.filter((p) => p.type === "text")
								.map((p) => p.text)
								.join("");
							const { cleanText } = extractScore(rawText);
							return (
								<Message key={message.id} from={message.role}>
									<MessageContent
										className={
											message.role === "assistant"
												? "rounded-lg bg-muted px-4 py-3"
												: "group-[.is-user]:bg-blue-600 group-[.is-user]:text-white"
										}
									>
										{message.role === "assistant" ? (
											<MessageResponse>{cleanText}</MessageResponse>
										) : (
											cleanText
										)}
									</MessageContent>
								</Message>
							);
						})
					)}
					{isGenerating && lastIsUser && (
						<Message from="assistant">
							<MessageContent className="rounded-lg bg-muted px-4 py-3">
								<Shimmer>Responding...</Shimmer>
							</MessageContent>
						</Message>
					)}
				</ConversationContent>
				<ConversationScrollButton />
			</Conversation>

			<div className="border-t p-4">
				<div className="mx-auto w-full max-w-2xl">
					<PromptInput onSubmit={handleSubmit}>
						<PromptInputBody>
							<PromptInputTextarea
								placeholder={`Reply as ${config.userRole}...`}
							/>
						</PromptInputBody>
						<PromptInputFooter>
							<PromptInputSubmit onStop={stop} status={status} />
						</PromptInputFooter>
					</PromptInput>
				</div>
			</div>
		</div>
	);
}
