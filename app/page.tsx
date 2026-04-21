"use client";

import { useState } from "react";
import { ChatContent } from "@/components/chat-content";
import { CustomScenarioDialog } from "@/components/custom-scenario-dialog";
import { ScenarioPicker } from "@/components/scenario-picker";
import { SettingsSidebar } from "@/components/settings-sidebar";
import {
	buildDifficultyConfig,
	type ChatConfig,
	DEFAULT_SETTINGS,
	type Scenario,
	type SettingsState,
} from "@/lib/spanish-chat";

export default function Page() {
	const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
	const [chatConfig, setChatConfig] = useState<ChatConfig | null>(null);
	const [customOpen, setCustomOpen] = useState(false);

	const updateSettings = (patch: Partial<SettingsState>) =>
		setSettings((prev) => ({ ...prev, ...patch }));

	const startScenario = (scenario: Scenario, swapped = false) => {
		const userRole = swapped ? scenario.altUserRole : scenario.defaultUserRole;
		const aiRole = swapped ? scenario.altAiRole : scenario.defaultAiRole;
		setChatConfig({
			scenario,
			userRole,
			aiRole,
			difficulty: settings.difficulty,
			difficultyConfig: buildDifficultyConfig(settings),
			aiStarts: settings.aiStarts,
		});
	};

	const handleRoleSwap = () => {
		setChatConfig((prev) =>
			prev ? { ...prev, userRole: prev.aiRole, aiRole: prev.userRole } : prev,
		);
	};

	return (
		<div className="flex h-svh overflow-hidden">
			<div className="flex min-w-0 flex-1 flex-col overflow-hidden">
				{chatConfig ? (
					<ChatContent
						key={`${chatConfig.scenario.id}-${chatConfig.userRole}`}
						config={chatConfig}
						onBack={() => setChatConfig(null)}
					/>
				) : (
					<ScenarioPicker
						onSelect={(s) => startScenario(s)}
						onCustom={() => setCustomOpen(true)}
					/>
				)}
			</div>

			<SettingsSidebar
				settings={settings}
				chatConfig={chatConfig}
				onUpdate={updateSettings}
				onRoleSwap={handleRoleSwap}
			/>

			<CustomScenarioDialog
				open={customOpen}
				onClose={() => setCustomOpen(false)}
				onStart={({ description, userRole, aiRole }) => {
					const custom: Scenario = {
						id: "custom",
						name: "Custom Scenario",
						icon: "✍️",
						description,
						defaultUserRole: userRole,
						defaultAiRole: aiRole,
						altUserRole: aiRole,
						altAiRole: userRole,
					};
					startScenario(custom, false);
					setCustomOpen(false);
				}}
			/>
		</div>
	);
}
