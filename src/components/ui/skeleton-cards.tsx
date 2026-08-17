interface SkeletonCardsProps {
	count?: number;
	variant?: "kpi" | "list" | "grid";
}

const keys = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];

export function SkeletonCards({
	count = 3,
	variant = "list",
}: SkeletonCardsProps) {
	if (variant === "kpi") {
		return (
			<div
				className="grid grid-cols-2 gap-3"
				aria-live="polite"
				aria-busy="true"
			>
				<span className="sr-only">Cargando...</span>
				{keys.slice(0, count).map((k) => (
					<article
						key={`sk-kpi-${k}`}
						className="flex flex-col gap-2 bg-surface p-3.5 rounded-xl border border-text-muted/30 animate-pulse"
					>
						<div className="flex items-center justify-between">
							<span className="size-8 rounded-lg bg-text-muted/20" />
							<span className="size-5 rounded bg-text-muted/20" />
						</div>
						<div className="h-6 w-16 rounded bg-text-muted/20" />
						<div className="h-3.5 w-28 rounded bg-text-muted/20" />
					</article>
				))}
			</div>
		);
	}

	if (variant === "grid") {
		return (
			<div
				className="grid grid-cols-3 gap-3"
				aria-live="polite"
				aria-busy="true"
			>
				<span className="sr-only">Cargando...</span>
				{keys.slice(0, count).map((k) => (
					<article
						key={`sk-grid-${k}`}
						className="flex flex-col gap-2 bg-surface p-3.5 rounded-xl border border-text-muted/30 animate-pulse"
					>
						<div className="h-8 w-12 rounded bg-text-muted/20" />
						<div className="h-3 w-16 rounded bg-text-muted/20" />
					</article>
				))}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3" aria-live="polite" aria-busy="true">
			<span className="sr-only">Cargando...</span>
			{keys.slice(0, count).map((k) => (
				<article
					key={`sk-list-${k}`}
					className="flex flex-col gap-3 bg-surface p-3.5 rounded-xl border border-text-muted/30 animate-pulse"
				>
					<div className="flex items-center gap-2.5">
						<span className="size-9 rounded-full bg-text-muted/20" />
						<div className="flex flex-col gap-1.5">
							<span className="h-4 w-28 rounded bg-text-muted/20" />
							<span className="h-3 w-40 rounded bg-text-muted/20" />
						</div>
					</div>
				</article>
			))}
		</div>
	);
}
