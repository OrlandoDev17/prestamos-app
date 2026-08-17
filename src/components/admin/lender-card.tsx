import { useEffect, useRef, useState } from "react";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { Toggle } from "#/components/ui/toggle";

interface Lender {
	id: string;
	name: string;
	email: string;
	isActive: boolean;
}

interface LenderCardProps {
	lender: Lender;
	onToggle?: (id: string, checked: boolean) => void;
	onEdit?: (lender: Lender) => void;
	onDelete?: (lender: Lender) => void;
}

export function LenderCard({
	lender,
	onToggle,
	onEdit,
	onDelete,
}: LenderCardProps) {
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	const initials = `${lender.name.split(" ")[0][0].toUpperCase()} ${lender.name.split(" ")[1]?.[0]?.toUpperCase() ?? ""}`;

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setMenuOpen(false);
			}
		};
		if (menuOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [menuOpen]);

	return (
		<article
			className={`relative flex flex-col gap-3 bg-surface p-4 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md ${
				!lender.isActive ? "opacity-60" : ""
			}`}
		>
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-3">
					<div className="relative">
						<span
							className={`size-12 rounded-full flex items-center justify-center text-sm font-bold text-white ring-2 ring-offset-2 ring-offset-surface ${
								lender.isActive
									? "bg-linear-to-br from-primary to-primary-dark ring-primary/30"
									: "bg-text-muted/40 ring-text-muted/20"
							}`}
						>
							{initials}
						</span>
						<span
							className={`absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-surface ${
								lender.isActive ? "bg-success" : "bg-text-muted/40"
							}`}
						/>
					</div>
					<div className="flex flex-col">
						<h3 className="font-semibold text-text-main leading-tight">
							{lender.name}
						</h3>
						<p className="text-xs text-text-muted mt-0.5">{lender.email}</p>
					</div>
				</div>

				<div ref={menuRef} className="relative">
					<button
						type="button"
						onClick={() => setMenuOpen(!menuOpen)}
						className="p-2 text-text-muted hover:text-text-main hover:bg-background rounded-lg transition-colors cursor-pointer"
					>
						<EllipsisVertical size={18} />
					</button>

					{menuOpen && (
						<div className="absolute right-0 top-full mt-1 w-40 bg-surface border border-text-muted/20 rounded-xl shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
							<button
								type="button"
								onClick={() => {
									setMenuOpen(false);
									onEdit?.(lender);
								}}
								className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-main hover:bg-info-bg hover:text-info transition-colors cursor-pointer"
							>
								<Pencil size={15} />
								Editar
							</button>
							<button
								type="button"
								onClick={() => {
									setMenuOpen(false);
									onDelete?.(lender);
								}}
								className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-main hover:bg-danger-bg hover:text-danger transition-colors cursor-pointer"
							>
								<Trash2 size={15} />
								Eliminar
							</button>
						</div>
					)}
				</div>
			</div>

			<footer className="flex items-center justify-between pt-2 border-t border-text-muted/10">
				<span
					className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
						lender.isActive
							? "text-success bg-success-bg"
							: "text-text-muted bg-background"
					}`}
				>
					<span
						className={`size-1.5 rounded-full ${
							lender.isActive ? "bg-success" : "bg-text-muted/50"
						}`}
					/>
					{lender.isActive ? "Activo" : "Inactivo"}
				</span>
				<Toggle
					checked={lender.isActive}
					onCheckedChange={(checked) => onToggle?.(lender.id, checked)}
				/>
			</footer>
		</article>
	);
}
