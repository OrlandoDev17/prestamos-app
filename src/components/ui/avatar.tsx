interface AvatarProps {
	name: string;
	size?: "sm" | "md" | "lg";
	className?: string;
}

const sizeClasses = {
	sm: "size-8 text-[10px]",
	md: "size-9 text-xs",
	lg: "size-12 text-sm",
} as const;

export function Avatar({ name, size = "md", className = "" }: AvatarProps) {
	const initials = name
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	return (
		<span
			className={`rounded-full flex items-center justify-center font-bold bg-primary/10 text-primary-dark ${sizeClasses[size]} ${className}`}
		>
			{initials}
		</span>
	);
}

interface AvatarGroupProps {
	clients: { name: string; count: number }[];
}

export function AvatarGroup({ clients }: AvatarGroupProps) {
	return (
		<div className="flex -space-x-2">
			{clients.slice(0, 3).map((c) => (
				<Avatar
					key={c.name}
					name={c.name}
					size="sm"
					className="ring-2 ring-surface"
				/>
			))}
			{clients.length > 3 && (
				<span className="size-8 rounded-full bg-background text-text-muted text-[10px] font-bold flex items-center justify-center ring-2 ring-surface">
					+{clients.length - 3}
				</span>
			)}
		</div>
	);
}
