import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	backTo: string;
}

export function PageHeader({ title, subtitle, backTo }: PageHeaderProps) {
	return (
		<header className="flex items-center gap-3">
			<Link
				to={backTo}
				aria-label="Volver"
				className="p-2 rounded-lg hover:bg-background transition-colors"
			>
				<ArrowLeft size={20} className="text-text-muted" aria-hidden="true" />
			</Link>
			<div>
				<h1 className="text-xl font-bold">{title}</h1>
				{subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
			</div>
		</header>
	);
}
