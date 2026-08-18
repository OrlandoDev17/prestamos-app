import { LogOut } from "lucide-react";
import { useState } from "react";
import { Avatar } from "#/components/ui/avatar";

interface HeaderProps {
	logout: () => Promise<void>;
	userName?: string;
}

export function Header({ logout, userName }: HeaderProps) {
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		await logout();
		setIsLoggingOut(false);
	};

	return (
		<header className="flex items-center justify-between w-full h-14 px-4 pt-[env(safe-area-inset-top)] bg-surface shadow-xs">
			<h3 className="text-xl text-sky-800 font-bold">
				Tu<span className="text-primary-dark">Prestamo</span>
			</h3>
			<div className="flex items-center gap-3">
				{userName && (
					<div className="flex items-center gap-2">
						<Avatar name={userName} size="sm" />
						<span className="text-xs font-medium text-text-muted hidden sm:block">
							{userName}
						</span>
					</div>
				)}
				<button
					type="button"
					onClick={handleLogout}
					disabled={isLoggingOut}
					className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-muted rounded-lg hover:text-danger hover:bg-danger-bg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoggingOut ? (
						<span className="size-3.5 border-2 border-danger/30 border-t-danger rounded-full animate-spin" />
					) : (
						<LogOut size={15} />
					)}
					<span className="hidden sm:block">
						{isLoggingOut ? "Cerrando..." : "Salir"}
					</span>
				</button>
			</div>
		</header>
	);
}
