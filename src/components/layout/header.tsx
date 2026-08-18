import { LogOut } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
	logout: () => Promise<void>;
}

export function Header({ logout }: HeaderProps) {
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		await logout();
		setIsLoggingOut(false);
	};

	return (
		<header className="flex items-center justify-between w-full h-14 px-4 bg-surface shadow-xs">
			<h3 className="text-xl text-sky-800 font-bold">
				Tu<span className="text-primary-dark">Prestamo</span>
			</h3>
			<button
				type="button"
				onClick={handleLogout}
				disabled={isLoggingOut}
				className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-text-muted rounded-lg hover:text-danger hover:bg-danger-bg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isLoggingOut ? (
					<span className="size-4 border-2 border-danger/30 border-t-danger rounded-full animate-spin" />
				) : (
					<LogOut size={18} />
				)}
				{isLoggingOut ? "Cerrando..." : "Salir"}
			</button>
		</header>
	);
}
