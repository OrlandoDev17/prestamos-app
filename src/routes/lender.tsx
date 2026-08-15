import {
	createFileRoute,
	Link,
	Outlet,
	useNavigate,
} from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useAuthStore } from "#/stores/authStore";

export const Route = createFileRoute("/lender")({
	beforeLoad: async ({ context }) => {
		if (!context.user) {
			throw new Error("Unauthorized");
		}
	},
	component: LenderLayout,
});

function LenderLayout() {
	const navigate = useNavigate();
	const logout = useAuthStore((state) => state.logout);

	const handleLogout = async () => {
		await logout();
		navigate({ to: "/auth" });
	};

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<header className="bg-white border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-10">
				<Link to="/lender" className="text-lg font-bold text-text">
					Prestamos
				</Link>
				<div className="flex items-center gap-3">
					<span className="text-sm text-textMuted">Lender</span>
					<button
						type="button"
						onClick={handleLogout}
						className="p-2 text-textMuted hover:text-error transition-colors"
						aria-label="Cerrar sesión"
					>
						<LogOut size={20} />
					</button>
				</div>
			</header>

			<main className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full">
				<Outlet />
			</main>
		</div>
	);
}
