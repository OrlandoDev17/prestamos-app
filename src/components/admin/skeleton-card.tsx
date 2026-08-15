export function SkeletonCard() {
	return (
		<article className="flex flex-col gap-3 bg-surface p-3 rounded-lg border border-text-muted/30 animate-pulse">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="size-10 rounded-full bg-text-muted/20" />
					<div className="flex flex-col gap-1.5">
						<span className="h-4 w-28 rounded bg-text-muted/20" />
						<span className="h-3 w-40 rounded bg-text-muted/20" />
					</div>
				</div>
				<span className="size-8 rounded-full bg-text-muted/20" />
			</div>
			<footer className="flex items-center justify-between">
				<span className="h-3 w-12 rounded bg-text-muted/20" />
				<span className="h-6 w-11 rounded-full bg-text-muted/20" />
			</footer>
		</article>
	);
}
