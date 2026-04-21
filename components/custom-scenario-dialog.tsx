"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CustomScenarioDialog({
	open,
	onClose,
	onStart,
}: {
	open: boolean;
	onClose: () => void;
	onStart: (s: {
		description: string;
		userRole: string;
		aiRole: string;
	}) => void;
}) {
	const [description, setDescription] = useState("");
	const [userRole, setUserRole] = useState("");
	const [aiRole, setAiRole] = useState("");

	const canSubmit = description.trim() && userRole.trim() && aiRole.trim();

	const handleStart = () => {
		if (!canSubmit) return;
		onStart({ description, userRole, aiRole });
		setDescription("");
		setUserRole("");
		setAiRole("");
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Write a custom scenario</DialogTitle>
				</DialogHeader>
				<div className="space-y-3 py-2">
					<Textarea
						placeholder="Describe the situation (e.g. You're buying a train ticket in Madrid...)"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="min-h-24 resize-none"
					/>
					<div className="flex gap-2">
						<Input
							placeholder="Your role (e.g. Tourist)"
							value={userRole}
							onChange={(e) => setUserRole(e.target.value)}
						/>
						<Input
							placeholder="AI role (e.g. Ticket agent)"
							value={aiRole}
							onChange={(e) => setAiRole(e.target.value)}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button disabled={!canSubmit} onClick={handleStart}>
						Start
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
