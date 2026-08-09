import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Lock, User } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/Input";

export const Route = createFileRoute("/auth")({
	component: RouteComponent,
});

const FORM: InputProps[] = [
	{
		label: "Nombre de Usuario",
		placeholder: "orlando.admin",
		name: "username",
		type: "text",
		icon: User,
	},
	{
		label: "Contraseña",
		placeholder: "••••••",
		name: "password",
		type: "password",
		icon: Lock,
	},
];

function RouteComponent() {
	return (
		<div className="flex flex-col gap-8 items-center justify-center h-dvh w-full px-8 max-w-md mx-auto">
			<header className="text-center flex flex-col">
				<h1>¡Bienvenido de nuevo!</h1>
				<p>Ingresa tus credenciales para continuar</p>
			</header>
			<form className="flex flex-col gap-4 w-full">
				<div className="flex flex-col gap-4">
					{FORM.map(({ label, placeholder, name, type, icon }) => (
						<Input key={name} {...{ label, placeholder, name, type, icon }} />
					))}
				</div>
				<button
					type="submit"
					className="flex items-center justify-center gap-2 w-full py-3 bg-primary rounded-lg text-white font-semibold text-lg hover:bg-primary-hover hover:tracking-wide active:bg-primary-hover active:scale-95 active:tracking-wider transition-all duration-200 cursor-pointer"
				>
					Entrar <ArrowRight />
				</button>
				<p className="text-center">¿Olvidaste tu contraseña?</p>
			</form>
		</div>
	);
}
