import { create } from "zustand";
import type { LucideIcon } from "lucide-react";

interface FabState {
	onClick: (() => void) | null;
	icon?: LucideIcon;
	show: boolean;
	setFab: (config: { onClick: () => void; icon?: LucideIcon }) => void;
	clearFab: () => void;
}

export const useFabStore = create<FabState>((set) => ({
	onClick: null,
	icon: undefined,
	show: false,
	setFab: (config) => set({ onClick: config.onClick, icon: config.icon, show: true }),
	clearFab: () => set({ onClick: null, icon: undefined, show: false }),
}));
