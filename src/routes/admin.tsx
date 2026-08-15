import {
	createFileRoute,
	Link,
	Outlet,
	useNavigate,
} from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useAuthStore } from "#/stores/authStore";

export const Route = createFileRoute("/admin")({
	beforeLoad: async ({ context }) => {
		if (!context.user) {
			throw new Error("Unauthorized");
		}
		if (context.user.role !== "superadmin") {
			throw new Error("Forbidden");
		}
	},
	component: AdminLayout,
});

function AdminLayout() {
	const navigate = useNavigate();
	const logout = useAuthStore((state) => state.logout);

	const handleLogout = async () => {
		await logout();
		navigate({ to: "/auth" });
	};

	return (
		<div className="min-h-screen bg-background flex">
			<aside className="w-64 bg-white border-r border-border hidden md:block">
				<div className="p-4 border-b border-border">
					<Link to="/admin" className="text-lg font-bold text-text">
						Prestamos
					</Link>
				</div>
				<nav className="p-4 space-y-1">
					<Link
						to="/admin"
						className="block px-3 py-2 rounded-lg text-sm text-text hover:bg-primary/10 hover:text-primary transition-colors"
					>
						Dashboard
					</Link>
				</nav>
			</aside>

			<div className="flex-1 flex flex-col">
				<header className="bg-white border-b border-border px-4 py-3 flex items-center justify-between md:hidden sticky top-0 z-10">
					<Link to="/admin" className="text-lg font-bold text-text">
						Prestamos
					</Link>
					<button
						type="button"
						onClick={handleLogout}
						className="p-2 text-textMuted hover:text-error transition-colors"
						aria-label="Cerrar sesión"
					>
						<LogOut size={20} />
					</button>
				</header>

				<main className="flex-1 overflow-y-auto p-4 md:p-6">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
