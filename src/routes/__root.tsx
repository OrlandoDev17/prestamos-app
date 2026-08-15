import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { useAuthStore } from "#/stores/authStore";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "TanStack Start Starter",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	beforeLoad: async () => {
		const user = await useAuthStore.getState().getStoreSession();
		return { user };
	},
	component: RootLayout,
});

function RootLayout() {
	return (
		<html lang="es">
			<head>
				<HeadContent />
			</head>
			<body>
				<main>
					<Outlet />
				</main>
				<Scripts />
			</body>
		</html>
	);
}
