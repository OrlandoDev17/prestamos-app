import { useCallback } from "react";

interface Tab {
	key: string;
	label: string;
	count?: number;
}

interface TabBarProps {
	tabs: Tab[];
	value: string;
	onChange: (key: string) => void;
}

export function TabBar({ tabs, value, onChange }: TabBarProps) {
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent, tabKey: string) => {
			const currentIndex = tabs.findIndex((t) => t.key === tabKey);
			if (e.key === "ArrowRight") {
				e.preventDefault();
				const next = tabs[(currentIndex + 1) % tabs.length];
				onChange(next.key);
			} else if (e.key === "ArrowLeft") {
				e.preventDefault();
				const prev = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
				onChange(prev.key);
			}
		},
		[tabs, onChange],
	);

	return (
		<div role="tablist" className="flex gap-1 bg-background rounded-xl p-1">
			{tabs.map((tab) => {
				const isSelected = value === tab.key;
				return (
					<button
						key={tab.key}
						type="button"
						role="tab"
						aria-selected={isSelected}
						tabIndex={isSelected ? 0 : -1}
						onClick={() => onChange(tab.key)}
						onKeyDown={(e) => handleKeyDown(e, tab.key)}
						className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
							isSelected
								? "bg-surface shadow-sm text-text-main"
								: "text-text-muted"
						}`}
					>
						{tab.label}
						{tab.count !== undefined && ` (${tab.count})`}
					</button>
				);
			})}
		</div>
	);
}
