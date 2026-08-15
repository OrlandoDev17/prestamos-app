import type { LucideIcon } from "lucide-react";
import { Lock, User } from "lucide-react";

export type FieldValidator = (ctx: { value: string }) => string | undefined;

export interface FormFieldConfig {
	label: string;
	placeholder: string;
	name: "username" | "password";
	type: "text" | "password" | "email" | "number";
	icon: LucideIcon;
	validators?: {
		onChange?: FieldValidator;
		onSubmit?: FieldValidator;
	};
}

export const FORM: FormFieldConfig[] = [
	{
		label: "Nombre de Usuario",
		placeholder: "orlando.admin",
		name: "username",
		type: "text",
		icon: User,
		validators: {
			onChange: ({ value }: { value: string }) =>
				!value ? "El nombre de usuario es obligatorio" : undefined,
			onSubmit: ({ value }: { value: string }) =>
				!value ? "El nombre de usuario es obligatorio" : undefined,
		},
	},
	{
		label: "Contraseña",
		placeholder: "••••••",
		name: "password",
		type: "password",
		icon: Lock,
		validators: {
			onChange: ({ value }: { value: string }) =>
				!value
					? "La contraseña es obligatoria"
					: value.length < 6
						? "Mínimo 6 caracteres"
						: undefined,
			onSubmit: ({ value }: { value: string }) =>
				!value
					? "La contraseña es obligatoria"
					: value.length < 6
						? "Mínimo 6 caracteres"
						: undefined,
		},
	},
];
