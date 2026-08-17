import type { LucideIcon } from "lucide-react";
import { CheckCircle as CheckCircleIcon } from "lucide-react";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
	action?: {
		label: string;
		onClick: () => void;
		icon?: LucideIcon;
	};
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center gap-4 bg-surface rounded-xl shadow-sm py-12 px-6">
			<span className="size-16 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center">
				<Icon size={32} />
			</span>
			<div className="flex flex-col items-center gap-1 text-center">
				<p className="font-semibold text-lg">{title}</p>
				<p className="text-sm text-text-muted max-w-xs">{description}</p>
			</div>
			{action && (
				<button
					type="button"
					onClick={action.onClick}
					className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 cursor-pointer"
				>
					{action.icon && <action.icon size={16} />}
					{action.label}
				</button>
			)}
		</div>
	);
}

interface SuccessEmptyStateProps {
	title: string;
	description: string;
}

export function SuccessEmptyState({
	title,
	description,
}: SuccessEmptyStateProps) {
	return (
		<div className="flex flex-col items-center gap-4 bg-surface rounded-xl shadow-sm py-12 px-6">
			<span className="size-16 rounded-full bg-success/10 text-success flex items-center justify-center">
				<CheckCircleIcon size={32} />
			</span>
			<div className="flex flex-col items-center gap-1 text-center">
				<p className="font-semibold text-lg">{title}</p>
				<p className="text-sm text-text-muted max-w-xs">{description}</p>
			</div>
		</div>
	);
}
