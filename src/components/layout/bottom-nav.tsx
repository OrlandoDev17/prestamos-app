import { Link, useLocation } from "@tanstack/react-router";
import {
	Banknote,
	BarChart3,
	LayoutDashboard,
	type LucideIcon,
	Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuthStore } from "#/stores/authStore";

interface NavItem {
	icon: LucideIcon;
	href: string;
	label: string;
}

const lenderLinks: NavItem[] = [
	{
		icon: LayoutDashboard,
		href: "/lender/dashboard",
		label: "Dashboard",
	},
	{
		icon: Users,
		href: "/lender/clients",
		label: "Clientes",
	},
	{
		icon: Banknote,
		href: "/lender/loans",
		label: "Prestamos",
	},
	{
		icon: BarChart3,
		href: "/lender/reports",
		label: "Reportes",
	},
];

const adminLinks: NavItem[] = [
	{
		icon: Users,
		href: "/admin/lenders",
		label: "Prestamistas",
	},
];

export function BottomNav() {
	const role = useAuthStore((s) => s.user?.role);
	const links = role === "superadmin" ? adminLinks : lenderLinks;

	return (
		<nav
			aria-label="Navegación principal"
			className="flex items-center justify-around fixed bottom-0 w-full z-50 h-16 pb-[env(safe-area-inset-bottom)] shadow-sm bg-surface border-t border-text-muted/10"
		>
			{links.map((link) => (
				<NavLink key={link.href} {...link} />
			))}
		</nav>
	);
}

function NavLink({ icon: Icon, href, label }: NavItem) {
	const location = useLocation();
	const isActive = location.pathname === href;

	return (
		<Link
			to={href}
			preload="intent"
			className="relative flex flex-col items-center justify-center gap-0.5 w-20 py-2 rounded-xl select-none active:scale-90 transition-transform duration-150"
		>
			{isActive && (
				<motion.div
					layoutId="nav-active-bg"
					className="absolute inset-0 bg-primary/15 rounded-xl"
					transition={{ type: "spring", stiffness: 350, damping: 30 }}
				/>
			)}
			<Icon
				size={20}
				className={`relative z-10 transition-colors duration-200 ${
					isActive ? "text-primary-dark" : "text-text-muted"
				}`}
				strokeWidth={isActive ? 2.2 : 1.8}
			/>
			<span
				className={`relative z-10 text-xs leading-tight transition-colors duration-200 ${
					isActive ? "font-semibold text-primary-dark" : "text-text-muted"
				}`}
			>
				{label}
			</span>
		</Link>
	);
}
