"use client";

import { BookmarkPlusIcon, CheckIcon } from "lucide-react";
import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { addEntry } from "@/lib/dictionary";

type ToolbarState = {
	x: number;
	y: number;
	height: number;
	text: string;
	context?: string;
	saved?: boolean;
	duplicate?: boolean;
};

export function SelectionToolbar({
	containerRef,
	onSaved,
}: {
	containerRef: RefObject<HTMLElement | null>;
	onSaved?: () => void;
}) {
	const [toolbar, setToolbar] = useState<ToolbarState | null>(null);
	const toolbarRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const onMouseUp = () => {
			setTimeout(() => {
				const sel = window.getSelection();
				const text = sel?.toString().trim().replace(/\s+/g, " ");
				if (!text || !sel?.rangeCount) {
					setToolbar(null);
					return;
				}

				const range = sel.getRangeAt(0);
				const container = containerRef.current;
				if (!container?.contains(range.commonAncestorContainer)) {
					setToolbar(null);
					return;
				}

				let node: Node | null = range.commonAncestorContainer;
				let context: string | undefined;
				while (node && node !== container) {
					if (node.nodeType === Node.ELEMENT_NODE) {
						const t = (node as Element).textContent?.trim() ?? "";
						if (t.length > text.length + 10) {
							context = t.slice(0, 200);
							break;
						}
					}
					node = node.parentNode;
				}

				const rect = range.getBoundingClientRect();
				setToolbar({
					x: rect.left + rect.width / 2,
					y: rect.top,
					height: rect.height,
					text,
					context,
				});
			}, 10);
		};

		const onMouseDown = (e: MouseEvent) => {
			if (toolbarRef.current?.contains(e.target as Node)) return;
			setToolbar(null);
		};

		document.addEventListener("mouseup", onMouseUp);
		document.addEventListener("mousedown", onMouseDown);
		return () => {
			document.removeEventListener("mouseup", onMouseUp);
			document.removeEventListener("mousedown", onMouseDown);
		};
	}, [containerRef]);

	if (!toolbar) return null;

	const showAbove = toolbar.y > 70;
	const top = showAbove ? toolbar.y - 8 : toolbar.y + toolbar.height + 8;

	const handleSave = () => {
		const added = addEntry(toolbar.text, toolbar.context);
		setToolbar((prev) =>
			prev ? { ...prev, saved: true, duplicate: !added } : null,
		);
		if (added) onSaved?.();
		window.getSelection()?.removeAllRanges();
		setTimeout(() => setToolbar(null), 1200);
	};

	return (
		<div
			ref={toolbarRef}
			className={
				showAbove
					? "fixed z-50 -translate-x-1/2 -translate-y-full"
					: "fixed z-50 -translate-x-1/2"
			}
			style={{ left: toolbar.x, top }}
		>
			<div className="flex items-center gap-1.5 rounded-lg border bg-popover px-2.5 py-1.5 shadow-lg">
				{toolbar.saved ? (
					<span className="flex items-center gap-1 text-xs text-green-500">
						<CheckIcon className="size-3" />
						{toolbar.duplicate ? "Already saved" : "Saved!"}
					</span>
				) : (
					<>
						<span className="max-w-[140px] truncate text-xs font-medium">
							&ldquo;{toolbar.text}&rdquo;
						</span>
						<Button
							size="xs"
							variant="ghost"
							className="h-5 gap-1 px-1.5 text-xs"
							onClick={handleSave}
						>
							<BookmarkPlusIcon className="size-3" />
							Save word
						</Button>
					</>
				)}
			</div>
		</div>
	);
}
