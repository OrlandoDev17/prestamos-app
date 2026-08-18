import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuthStore } from "#/stores/authStore";
import { useFabStore } from "#/stores/fabStore";
import { FAB } from "#/components/ui/fab";
import { BottomNav } from "./bottom-nav";
import { Header } from "./header";

interface AppLayoutProps {
	children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
	const navigate = useNavigate();
	const logout = useAuthStore((state) => state.logout);
	const user = useAuthStore((state) => state.user);
	const fab = useFabStore();

	const handleLogout = async () => {
		await logout();
		navigate({ to: "/auth" });
	};

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<Header logout={handleLogout} userName={user?.full_name} />

			<div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
			<BottomNav />

			{fab.show && fab.onClick && (
				<FAB onClick={fab.onClick} icon={fab.icon} />
			)}
		</div>
	);
}
