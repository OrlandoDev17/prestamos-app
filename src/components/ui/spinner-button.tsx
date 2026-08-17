import type { ReactNode } from "react";

interface SpinnerButtonProps {
	type?: "button" | "submit";
	isLoading: boolean;
	disabled?: boolean;
	className?: string;
	children: ReactNode;
	onClick?: () => void;
}

export function SpinnerButton({
	type = "button",
	isLoading,
	disabled,
	className = "",
	children,
	onClick,
}: SpinnerButtonProps) {
	return (
		<button
			type={type}
			disabled={isLoading || disabled}
			onClick={onClick}
			aria-busy={isLoading}
			className={`flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
		>
			{isLoading && (
				<span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
			)}
			{children}
		</button>
	);
}
