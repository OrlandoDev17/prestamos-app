import { MoreVertical, Pencil, UserCheck, UserX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useUpdateClient } from "#/queries/clients.queries";
import type { Client } from "#/stores/clientsStore";

interface ClientCardMenuProps {
	client: Client;
	onEdit: () => void;
}

export function ClientCardMenu({ client, onEdit }: ClientCardMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const updateClient = useUpdateClient();

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(e.target as Node) &&
				buttonRef.current &&
				!buttonRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	const handleToggleActive = async () => {
		try {
			await updateClient.mutateAsync({
				id: client.id,
				full_name: client.full_name,
				cedula: client.cedula,
				phone: client.phone,
				address: client.address,
				route: client.route,
				is_active: !client.is_active,
			});
			setIsOpen(false);
		} catch {
			// Error handled by mutation
		}
	};

	const handleEdit = () => {
		setIsOpen(false);
		onEdit();
	};

	const menuPosition = (() => {
		if (!buttonRef.current) return { top: 0, right: 8 };
		const rect = buttonRef.current.getBoundingClientRect();
		return { top: rect.bottom + 4, right: window.innerWidth - rect.right };
	})();

	return (
		<>
			<button
				ref={buttonRef}
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="p-1.5 rounded-lg hover:bg-text-muted/10 transition-colors cursor-pointer shrink-0"
			>
				<MoreVertical size={16} className="text-text-muted" />
			</button>

			{isOpen &&
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
							onClick={handleEdit}
							className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-main hover:bg-background transition-colors cursor-pointer"
						>
							<Pencil size={14} className="text-text-muted" />
							Editar
						</button>
						<button
							type="button"
							onClick={handleToggleActive}
							disabled={updateClient.isPending}
							className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-background transition-colors cursor-pointer disabled:opacity-50"
						>
							{client.is_active ? (
								<>
									<UserX size={14} className="text-danger" />
									<span className="text-danger">Desactivar</span>
								</>
							) : (
								<>
									<UserCheck size={14} className="text-success" />
									<span className="text-success">Activar</span>
								</>
							)}
						</button>
					</div>,
					document.body,
				)}
		</>
	);
}
