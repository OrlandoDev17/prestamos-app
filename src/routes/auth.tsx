import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useAuthActions } from "#/hooks/useAuthActions";
import { LoginForm, type LoginFormValues } from "@/components/auth/login-form";

export const Route = createFileRoute("/auth")({
	// Si en la carga inicial ya detectamos un usuario autenticado, redirigimos a "/"
	beforeLoad: ({ context }) => {
		if (context.user) {
			throw redirect({ to: "/" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { login, isSubmitting, errorMsg } = useAuthActions();

	const handleFormSubmit = async (values: LoginFormValues) => {
		const result = await login(values);
		if (result.success) {
			navigate({ to: "/" });
		}
	};

	return (
		<LoginForm
			isSubmitting={isSubmitting}
			errorMsg={errorMsg}
			onSubmit={handleFormSubmit}
		/>
	);
}
