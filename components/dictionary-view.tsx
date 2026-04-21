"use client";

import { ArrowLeftIcon, CheckIcon, TrashIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	type DictionaryEntry,
	getEntries,
	MASTERY_THRESHOLD,
	recordResult,
	removeEntry,
} from "@/lib/dictionary";
import { cn } from "@/lib/utils";

type View = "list" | "quiz";

function MasteryDots({ correct }: { correct: number }) {
	return (
		<div className="flex gap-0.5">
			{Array.from({ length: MASTERY_THRESHOLD }).map((_, i) => (
				<div
					key={i}
					className={cn(
						"size-1.5 rounded-full",
						i < correct ? "bg-green-500" : "bg-muted-foreground/20",
					)}
				/>
			))}
		</div>
	);
}

export function DictionaryView({
	onBack,
	refreshKey,
}: {
	onBack: () => void;
	refreshKey?: number;
}) {
	const [entries, setEntries] = useState<DictionaryEntry[]>([]);
	const [view, setView] = useState<View>("list");
	const [quizIndex, setQuizIndex] = useState(0);
	const [revealed, setRevealed] = useState(false);

	const reload = useCallback(() => setEntries(getEntries()), []);
	useEffect(() => {
		reload();
	}, [reload, refreshKey]);

	const unmastered = entries.filter((e) => e.correct < MASTERY_THRESHOLD);
	const current = unmastered[quizIndex % Math.max(1, unmastered.length)];

	const handleQuizResult = (correct: boolean) => {
		recordResult(current.id, correct);
		reload();
		setRevealed(false);
		setQuizIndex((i) => i + 1);
	};

	if (view === "quiz") {
		if (unmastered.length === 0) {
			return (
				<div className="flex flex-col gap-4 p-4">
					<Button
						variant="ghost"
						size="sm"
						className="w-fit gap-1"
						onClick={() => setView("list")}
					>
						<ArrowLeftIcon className="size-4" />
						Back
					</Button>
					<div className="space-y-1 py-8 text-center">
						<p className="text-sm font-medium">All words mastered!</p>
						<p className="text-xs text-muted-foreground">
							Add more words by highlighting text in a conversation.
						</p>
					</div>
				</div>
			);
		}

		return (
			<div className="flex flex-col gap-4 p-4">
				<div className="flex items-center justify-between">
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() => {
							setView("list");
							setQuizIndex(0);
							setRevealed(false);
						}}
					>
						<ArrowLeftIcon className="size-4" />
					</Button>
					<span className="text-xs text-muted-foreground">
						{(quizIndex % unmastered.length) + 1} / {unmastered.length}
					</span>
				</div>

				<div className="flex min-h-[120px] flex-col items-center justify-center space-y-3 rounded-xl border bg-muted/30 p-6 text-center">
					<p className="text-2xl font-medium">{current?.word}</p>
					{revealed && current?.context && (
						<p className="max-w-full text-xs italic text-muted-foreground">
							&ldquo;{current.context.slice(0, 140)}&rdquo;
						</p>
					)}
				</div>

				<div className="flex justify-center">
					<MasteryDots correct={current?.correct ?? 0} />
				</div>

				{!revealed ? (
					<Button variant="outline" onClick={() => setRevealed(true)}>
						Show in context
					</Button>
				) : (
					<div className="flex gap-2">
						<Button
							className="flex-1 gap-1 bg-red-600 text-white hover:bg-red-700"
							onClick={() => handleQuizResult(false)}
						>
							<XIcon className="size-4" />
							Didn&apos;t know
						</Button>
						<Button
							className="flex-1 gap-1 bg-green-600 text-white hover:bg-green-700"
							onClick={() => handleQuizResult(true)}
						>
							<CheckIcon className="size-4" />
							Knew it
						</Button>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 overflow-hidden">
			<div className="flex items-center justify-between px-4 pt-4">
				<div className="flex items-center gap-2">
					<Button variant="ghost" size="icon-sm" onClick={onBack}>
						<ArrowLeftIcon className="size-4" />
					</Button>
					<span className="text-sm font-medium">Dictionary</span>
					{entries.length > 0 && (
						<span className="text-xs text-muted-foreground">
							({entries.length})
						</span>
					)}
				</div>
				{unmastered.length > 0 && (
					<Button
						size="xs"
						onClick={() => {
							setQuizIndex(0);
							setRevealed(false);
							setView("quiz");
						}}
					>
						Quiz me
					</Button>
				)}
			</div>

			<Separator />

			<div className="flex-1 overflow-y-auto px-4 pb-4">
				{entries.length === 0 ? (
					<p className="text-xs leading-relaxed text-muted-foreground">
						No words saved yet. Highlight any text in a conversation to save it
						here.
					</p>
				) : (
					<div className="space-y-1">
						{entries.map((entry) => {
							const mastered = entry.correct >= MASTERY_THRESHOLD;
							return (
								<div
									key={entry.id}
									className="group flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted/50"
								>
									<div className="flex min-w-0 items-center gap-2">
										<MasteryDots correct={entry.correct} />
										<span
											className={cn(
												"truncate text-sm",
												mastered && "text-green-500",
											)}
										>
											{entry.word}
										</span>
										{mastered && (
											<span className="shrink-0 text-[10px] text-green-500">
												mastered
											</span>
										)}
									</div>
									<Button
										size="icon-sm"
										variant="ghost"
										className="shrink-0 opacity-0 group-hover:opacity-100"
										onClick={() => {
											removeEntry(entry.id);
											reload();
										}}
									>
										<TrashIcon className="size-3" />
									</Button>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
