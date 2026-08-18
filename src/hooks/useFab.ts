import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { useFabStore } from "#/stores/fabStore";

export function useFab(onClick: (() => void) | null, icon?: LucideIcon) {
	const setFab = useFabStore((s) => s.setFab);
	const clearFab = useFabStore((s) => s.clearFab);

	useEffect(() => {
		if (onClick) {
			setFab({ onClick, icon });
		} else {
			clearFab();
		}
		return () => clearFab();
	}, [onClick, icon, setFab, clearFab]);
}
