import type { LucideIcon } from "lucide-react";
import { Lock, Mail } from "lucide-react";

export type FieldValidator = (ctx: { value: string }) => string | undefined;

export interface FormFieldConfig {
	label: string;
	placeholder: string;
	name: "email" | "password";
	type: "text" | "password" | "email" | "number";
	icon: LucideIcon;
	validators?: {
		onChange?: FieldValidator;
		onSubmit?: FieldValidator;
	};
}

export const FORM: FormFieldConfig[] = [
	{
		label: "Correo Electrónico",
		placeholder: "correo@ejemplo.com",
		name: "email",
		type: "email",
		icon: Mail,
		validators: {
			onChange: ({ value }: { value: string }) =>
				!value ? "El correo es obligatorio" : undefined,
			onSubmit: ({ value }: { value: string }) =>
				!value ? "El correo es obligatorio" : undefined,
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
