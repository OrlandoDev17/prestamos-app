import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	beforeLoad: async () => {
		// Fallback: si el root no redirigió (no debería pasar)
		throw redirect({ to: "/auth" });
	},
	component: () => null,
});
