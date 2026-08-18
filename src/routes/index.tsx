import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "#/stores/authStore";

export const Route = createFileRoute("/")({
	beforeLoad: async () => {
		if (typeof window === "undefined") {
			throw redirect({ to: "/auth" });
		}

		const user = await useAuthStore.getState().getStoreSession();

		if (!user) {
			throw redirect({ to: "/auth" });
		}

		throw redirect({
			to: user.role === "superadmin" ? "/admin/lenders" : "/lender/dashboard",
		});
	},
	component: () => null,
});
