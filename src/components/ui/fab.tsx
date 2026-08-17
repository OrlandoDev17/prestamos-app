import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";

interface FABProps {
	onClick: () => void;
	icon?: LucideIcon;
}

export function FAB({ onClick, icon: Icon = Plus }: FABProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label="Crear nuevo"
			className="fixed bottom-20 right-6 size-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer z-40"
		>
			<Icon size={24} strokeWidth={2.5} aria-hidden="true" />
		</button>
	);
}
