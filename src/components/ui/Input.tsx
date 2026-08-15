import type { LucideIcon } from "lucide-react";

export interface FieldLikeApi {
	name: string;
	state: {
		value: string;
		meta: { errors: Array<string | undefined>; isTouched: boolean };
	};
	handleChange: (value: string) => void;
	handleBlur: () => void;
}

export interface InputProps {
	label: string;
	placeholder: string;
	type: "text" | "password" | "email" | "number";
	icon: LucideIcon;
	field: FieldLikeApi;
}

export function Input({
	label,
	placeholder,
	type,
	icon: Icon,
	field,
}: InputProps) {
	return (
		<label className="flex flex-col gap-1">
			<h4>{label}</h4>
			<div className="relative">
				<input
					name={field.name}
					value={field.state.value}
					onBlur={field.handleBlur}
					onChange={(e) => field.handleChange(e.target.value)}
					className="pl-10 pr-5 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 placeholder:text-lg w-full"
					type={type}
					placeholder={placeholder}
				/>
				<Icon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-text-muted" />
			</div>
			{field.state.meta.errors.length > 0 && (
				<span className="text-red-500 text-sm mt-1">
					{field.state.meta.errors[0]}
				</span>
			)}
		</label>
	);
}
