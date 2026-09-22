import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Avatar } from "#/components/ui/avatar";
import type { Collector } from "#/stores/collectorsStore";

interface CollectorCardProps {
	collector: Collector;
	onEdit: (collector: Collector) => void;
	onDelete: (collector: Collector) => void;
	onToggle: (id: string, checked: boolean) => void;
}

export function CollectorCard({
	collector,
	onEdit,
	onDelete,
	onToggle,
}: CollectorCardProps) {
	const [menuOpen, setMenuOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(e.target as Node) &&
				buttonRef.current &&
				!buttonRef.current.contains(e.target as Node)
			) {
				setMenuOpen(false);
			}
		};
		if (menuOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [menuOpen]);

	const menuPosition = (() => {
		if (!buttonRef.current) return { top: 0, right: 8 };
		const rect = buttonRef.current.getBoundingClientRect();
		return { top: rect.bottom + 4, right: window.innerWidth - rect.right };
	})();

	return (
		<article className="flex items-center gap-3 bg-surface p-3.5 rounded-xl shadow-sm">
			<Avatar name={collector.name} />
			<div className="flex-1 min-w-0">
				<h3 className="font-semibold text-sm text-text-main truncate">
					{collector.name}
				</h3>
				<p className="text-xs text-text-muted truncate">{collector.email}</p>
			</div>
			<div className="flex items-center gap-2">
				<label className="relative inline-flex items-center cursor-pointer">
					<input
						type="checkbox"
						checked={collector.isActive}
						onChange={(e) => onToggle(collector.id, e.target.checked)}
						className="sr-only peer"
					/>
					<div className="w-9 h-5 bg-text-muted/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
				</label>
				<div className="relative" ref={menuRef}>
					<button
						ref={buttonRef}
						type="button"
						onClick={() => setMenuOpen(!menuOpen)}
						className="p-1.5 rounded-lg hover:bg-text-muted/10 transition-colors cursor-pointer"
					>
						<MoreVertical size={16} className="text-text-muted" />
					</button>
					{menuOpen &&
						createPortal(
							<div
								ref={menuRef}
								className="bg-surface border border-text-muted/15 rounded-xl shadow-lg min-w-[160px] py-1"
								style={{
									position: "fixed",
									top: menuPosition.top,
									right: menuPosition.right,
									zIndex: 9999,
								}}
							>
								<button
									type="button"
									onClick={() => {
										setMenuOpen(false);
										onEdit(collector);
									}}
									className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-main hover:bg-background transition-colors cursor-pointer"
								>
									<Pencil size={14} className="text-text-muted" />
									Editar
								</button>
								<button
									type="button"
									onClick={() => {
										setMenuOpen(false);
										onDelete(collector);
									}}
									className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-danger hover:bg-background transition-colors cursor-pointer"
								>
									<Trash2 size={14} />
									Eliminar
								</button>
							</div>,
							document.body,
						)}
				</div>
			</div>
		</article>
	);
}
