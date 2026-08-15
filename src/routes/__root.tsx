import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  redirect,
} from "@tanstack/react-router";
import { useEffect } from "react";
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
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Prestamos" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  beforeLoad: async ({ location }) => {
    // En el servidor, skip (no hay localStorage)
    if (typeof window === "undefined") {
      return { user: null };
    }

    const user = await useAuthStore.getState().getStoreSession();
    const isPublic = PUBLIC_ROUTES.includes(location.pathname);

    // Sin sesión y ruta privada → /auth
    if (!user && !isPublic) {
      throw redirect({ to: "/auth" });
    }

    // Con sesión y en /auth → redirigir al dashboard
    if (user && isPublic) {
      throw redirect({
        to: user.role === "superadmin" ? "/admin" : "/lender",
      });
    }

    // Con sesión en "/" → redirigir al dashboard
    if (user && location.pathname === "/") {
      throw redirect({
        to: user.role === "superadmin" ? "/admin" : "/lender",
      });
    }

    return { user };
  },
  component: RootLayout,
});

function RootLayout() {
  const getStoreSession = useAuthStore((state) => state.getStoreSession);

  useEffect(() => {
    getStoreSession();
  }, [getStoreSession]);

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
