import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export function SearchInput({
	value,
	onChange,
	placeholder = "Buscar por nombre...",
}: SearchInputProps) {
	const [localValue, setLocalValue] = useState(value);

	useEffect(() => {
		setLocalValue(value);
	}, [value]);

	useEffect(() => {
		const timer = setTimeout(() => {
			onChange(localValue);
		}, 300);
		return () => clearTimeout(timer);
	}, [localValue, onChange]);

	return (
		<div className="relative">
			<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
			<input
				type="text"
				value={localValue}
				onChange={(e) => setLocalValue(e.target.value)}
				placeholder={placeholder}
				className="w-full bg-background pl-10 pr-10 py-3 rounded-xl text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
			/>
			{localValue && (
				<button
					type="button"
					onClick={() => {
						setLocalValue("");
						onChange("");
					}}
					className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-text-muted hover:text-text-main transition-colors cursor-pointer"
				>
					<X className="size-4" />
				</button>
			)}
		</div>
	);
}
