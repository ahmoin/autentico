"use client";

import { BookOpenIcon, RotateCcwIcon } from "lucide-react";
import { LabeledSlider } from "@/components/labeled-slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	type ChatConfig,
	DETAIL_LABELS,
	DIFFICULTY_META,
	type Difficulty,
	ERROR_LABELS,
	GUIDANCE_LABELS,
	type SettingsState,
	settingsFromPreset,
	VOCAB_LABELS,
} from "@/lib/spanish-chat";
import { cn } from "@/lib/utils";

export function SettingsSidebar({
	settings,
	chatConfig,
	onUpdate,
	onRoleSwap,
	onReset,
	onOpenDictionary,
	dictionaryCount,
}: {
	settings: SettingsState;
	chatConfig: ChatConfig | null;
	onUpdate: (patch: Partial<SettingsState>) => void;
	onRoleSwap: () => void;
	onReset: () => void;
	onOpenDictionary: () => void;
	dictionaryCount: number;
}) {
	const applyPreset = (d: Difficulty) =>
		onUpdate(settingsFromPreset(d, settings.aiStarts));

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between">
				<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Settings
				</p>
				<Button
					size="xs"
					variant="ghost"
					className="gap-1 text-xs"
					onClick={onOpenDictionary}
				>
					<BookOpenIcon className="size-3" />
					Dictionary
					{dictionaryCount > 0 && (
						<span className="rounded-full bg-primary px-1.5 py-px text-[10px] text-primary-foreground">
							{dictionaryCount}
						</span>
					)}
				</Button>
			</div>

			<div className="space-y-2">
				<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Difficulty
				</p>
				<div className="flex gap-1">
					{(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
						<Button
							key={d}
							size="xs"
							variant={settings.difficulty === d ? "default" : "outline"}
							onClick={() => applyPreset(d)}
							className={cn(
								settings.difficulty === d &&
									d === "easy" &&
									"bg-green-600 hover:bg-green-700",
								settings.difficulty === d &&
									d === "medium" &&
									"bg-yellow-600 hover:bg-yellow-700",
								settings.difficulty === d &&
									d === "hard" &&
									"bg-red-600 hover:bg-red-700",
							)}
						>
							{DIFFICULTY_META[d].name}
						</Button>
					))}
				</div>
			</div>

			<Separator />

			<div className="space-y-5">
				<LabeledSlider
					label="Error Tolerance"
					value={settings.errorTolerance}
					min={1}
					max={4}
					valueLabel={ERROR_LABELS[settings.errorTolerance - 1]}
					onChange={(v) => onUpdate({ errorTolerance: v })}
				/>
				<LabeledSlider
					label="AI Guidance"
					value={settings.guidance}
					min={1}
					max={3}
					valueLabel={GUIDANCE_LABELS[settings.guidance - 1]}
					onChange={(v) => onUpdate({ guidance: v })}
				/>
				<LabeledSlider
					label="Vocabulary"
					value={settings.vocabulary}
					min={1}
					max={3}
					valueLabel={VOCAB_LABELS[settings.vocabulary - 1]}
					onChange={(v) => onUpdate({ vocabulary: v })}
				/>
				<LabeledSlider
					label={`Max messages: ${settings.maxMessages}`}
					value={settings.maxMessages}
					min={5}
					max={50}
					valueLabel=""
					onChange={(v) => onUpdate({ maxMessages: v })}
				/>
				<LabeledSlider
					label="Required detail"
					value={settings.detailLevel}
					min={1}
					max={5}
					valueLabel={DETAIL_LABELS[settings.detailLevel - 1]}
					onChange={(v) => onUpdate({ detailLevel: v })}
				/>
			</div>

			<Separator />

			<div className="space-y-2">
				<p className="text-xs text-muted-foreground">Who starts</p>
				<div className="flex gap-1">
					<Button
						size="xs"
						variant={!settings.aiStarts ? "default" : "outline"}
						onClick={() => onUpdate({ aiStarts: false })}
						className="flex-1"
					>
						You
					</Button>
					<Button
						size="xs"
						variant={settings.aiStarts ? "default" : "outline"}
						onClick={() => onUpdate({ aiStarts: true })}
						className="flex-1"
					>
						AI
					</Button>
				</div>
			</div>

			{chatConfig && (
				<>
					<Separator />
					<div className="space-y-2">
						<p className="text-xs text-muted-foreground">Role</p>
						<Button
							size="sm"
							variant="outline"
							className="w-full justify-start text-xs"
							onClick={onRoleSwap}
						>
							<span className="truncate">
								You: {chatConfig.userRole} · AI: {chatConfig.aiRole}
							</span>
						</Button>
						<p className="text-[11px] text-muted-foreground">
							Click to swap roles
						</p>
					</div>
					<Separator />
					<Button
						size="sm"
						variant="outline"
						className="w-full gap-1.5 text-xs"
						onClick={onReset}
					>
						<RotateCcwIcon className="size-3" />
						Restart conversation
					</Button>
				</>
			)}
		</div>
	);
}
