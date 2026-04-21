import { SlidersHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { SCENARIOS, type Scenario } from "@/lib/spanish-chat";

export function ScenarioPicker({
	onSelect,
	onCustom,
	onOpenSettings,
}: {
	onSelect: (s: Scenario) => void;
	onCustom: () => void;
	onOpenSettings?: () => void;
}) {
	return (
		<div className="flex flex-1 flex-col">
			<div className="flex items-center justify-end border-b px-4 py-2 md:hidden">
				<Button size="icon-sm" variant="ghost" onClick={onOpenSettings}>
					<SlidersHorizontalIcon className="size-4" />
				</Button>
			</div>

			<div className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
				<div className="w-full max-w-2xl space-y-6">
					<h2 className="text-3xl font-light text-muted-foreground">
						Pick a scenario
					</h2>
					<div className="grid grid-cols-3 gap-3">
						{SCENARIOS.map((s) => (
							<Card
								key={s.id}
								className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
								onClick={() => onSelect(s)}
							>
								<CardHeader className="p-5">
									<div className="mb-2 flex size-8 items-center justify-center rounded-md bg-muted text-base">
										{s.icon}
									</div>
									<CardTitle className="text-sm">{s.name}</CardTitle>
									<CardDescription className="text-xs">
										{s.description}
									</CardDescription>
								</CardHeader>
							</Card>
						))}
					</div>
					<button
						className="text-sm text-muted-foreground transition-colors hover:text-foreground"
						onClick={onCustom}
					>
						Write custom scenario →
					</button>
				</div>
			</div>

			<div className="border-t p-4">
				<div className="mx-auto w-full max-w-2xl rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
					Select a scenario above to start practicing...
				</div>
			</div>
		</div>
	);
}
