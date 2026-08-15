interface ToggleProps {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	disabled?: boolean;
}

export function Toggle({ checked, onCheckedChange, disabled }: ToggleProps) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			disabled={disabled}
			onClick={() => onCheckedChange(!checked)}
			className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${
				checked ? "bg-primary" : "bg-text-muted/40"
			}`}
		>
			<span
				className={`pointer-events-none inline-block size-4 translate-x-0.5 rounded-full bg-surface shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
					checked ? "translate-x-5" : "translate-x-0.5"
				}`}
			/>
		</button>
	);
}
