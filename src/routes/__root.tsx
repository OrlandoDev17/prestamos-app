import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	redirect,
	Scripts,
	useLocation,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { AppLayout } from "#/components/layout/app-layout";
import { useAuthStore } from "#/stores/authStore";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

const PUBLIC_ROUTES = ["/auth"];

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover",
			},
			{ title: "PrestamosApp" },
			{
				name: "description",
				content: "Gestiona prestamos, clientes y cobranzas de forma sencilla",
			},
			{ name: "theme-color", content: "#47d7a4" },
			{ name: "apple-mobile-web-app-capable", content: "yes" },
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "black-translucent",
			},
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
			{ rel: "manifest", href: "/manifest.json" },
		],
	}),
	beforeLoad: async ({ location }) => {
		// En el servidor (prerender/SSR), no verificar sesión
		if (typeof window === "undefined") {
			return { user: null };
		}

		// En el cliente, verificar sesión real
		const user = await useAuthStore.getState().getStoreSession();
		const isPublic = PUBLIC_ROUTES.includes(location.pathname);

		// Sin sesión y ruta privada → /auth
		if (!user && !isPublic) {
			throw redirect({ to: "/auth" });
		}

		// Con sesión y en /auth → redirigir al dashboard
		if (user && isPublic) {
			throw redirect({
				to: user.role === "superadmin" ? "/admin/lenders" : "/lender/dashboard",
			});
		}

		return { user };
	},
	component: RootLayout,
});

function RootLayout() {
	const location = useLocation();
	const getStoreSession = useAuthStore((state) => state.getStoreSession);
	const isAuth = location.pathname === "/auth";

	useEffect(() => {
		getStoreSession();
	}, [getStoreSession]);

	return (
		<html lang="es">
			<head>
				<HeadContent />
			</head>
			<body>
				<QueryClientProvider client={Route.useRouteContext().queryClient}>
					{isAuth ? (
						<Outlet />
					) : (
						<AppLayout>
							<Outlet />
						</AppLayout>
					)}
				</QueryClientProvider>
				<Scripts />
			</body>
		</html>
	);
}
