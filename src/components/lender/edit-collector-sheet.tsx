import { Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { BottomSheet } from "#/components/ui/bottom-sheet";
import { type Collector, useCollectorsStore } from "#/stores/collectorsStore";

interface EditCollectorSheetProps {
	isOpen: boolean;
	onClose: () => void;
	collector: Collector | null;
}

export function EditCollectorSheet({
	isOpen,
	onClose,
	collector,
}: EditCollectorSheetProps) {
	const updateCollector = useCollectorsStore((s) => s.updateCollector);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (collector) {
			setName(collector.name);
			setEmail(collector.email);
			setErrorMsg(null);
		}
	}, [collector]);

	const handleClose = () => {
		setErrorMsg(null);
		onClose();
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!collector) return;
		setErrorMsg(null);
		setIsSubmitting(true);

		const result = await updateCollector({
			id: collector.id,
			full_name: name,
			email,
		});

		setIsSubmitting(false);

		if (result.success) {
			handleClose();
		} else {
			setErrorMsg(result.error ?? "Error al actualizar cobrador");
		}
	};

	return (
		<BottomSheet isOpen={isOpen} onClose={handleClose}>
			<h2 className="text-lg font-bold mb-1">Editar Cobrador</h2>
			<p className="text-text-muted text-sm mb-6">
				Modifique los datos del cobrador.
			</p>

			<form onSubmit={handleSubmit} className="flex flex-col gap-5">
				{errorMsg && (
					<div className="p-3 bg-danger-bg text-danger text-sm rounded-lg">
						{errorMsg}
					</div>
				)}

				<label className="flex flex-col gap-1.5">
					<span className="text-sm font-medium">Nombre Completo</span>
					<div className="relative">
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Ej. Juan Perez"
							required
							className="w-full bg-background pl-10 pr-4 py-3 rounded-lg text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
						/>
						<User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
					</div>
				</label>

				<label className="flex flex-col gap-1.5">
					<span className="text-sm font-medium">Correo Electronico</span>
					<div className="relative">
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="contacto@gmail.com"
							required
							className="w-full bg-background pl-10 pr-4 py-3 rounded-lg text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
						/>
						<Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
					</div>
				</label>

				<div className="flex gap-3 mt-2">
					<button
						type="button"
						onClick={handleClose}
						className="flex-1 py-3 border border-text-muted/30 text-text-main font-semibold rounded-lg hover:bg-background transition-colors cursor-pointer"
					>
						Cancelar
					</button>
					<button
						type="submit"
						disabled={isSubmitting}
						className="flex-1 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{isSubmitting && (
							<span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						)}
						{isSubmitting ? "Guardando..." : "Guardar"}
					</button>
				</div>
			</form>
		</BottomSheet>
	);
}
