import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from "lucide-react";
import { BottomSheet } from "#/components/ui/BottomSheet";
import { useUsersStore } from "#/stores/usersStore";

interface CreateLenderSheetProps {
	isOpen: boolean;
	onClose: () => void;
}

export function CreateLenderSheet({ isOpen, onClose }: CreateLenderSheetProps) {
	const createLender = useUsersStore((s) => s.createLender);
	const [showPassword, setShowPassword] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const resetForm = () => {
		setName("");
		setEmail("");
		setPassword("");
		setErrorMsg(null);
		setShowPassword(false);
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMsg(null);
		setIsSubmitting(true);

		const result = await createLender({
			full_name: name,
			email,
			password,
		});

		setIsSubmitting(false);

		if (result.success) {
			handleClose();
		} else {
			setErrorMsg(result.error ?? "Error al crear prestamista");
		}
	};

	return (
		<BottomSheet isOpen={isOpen} onClose={handleClose}>
			<h2 className="text-lg font-bold mb-1">Crear Prestamista</h2>
			<p className="text-text-muted text-sm mb-6">
				Ingrese los detalles para crear un nuevo prestamista en el sistema.
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
							placeholder="Ej. Kevin Garcia"
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

				<label className="flex flex-col gap-1.5">
					<span className="text-sm font-medium">Contraseña</span>
					<div className="relative">
						<input
							type={showPassword ? "text" : "password"}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							required
							minLength={6}
							className="w-full bg-background pl-10 pr-11 py-3 rounded-lg text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
						/>
						<Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors cursor-pointer"
						>
							{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
						</button>
					</div>
				</label>

				<button
					type="submit"
					disabled={isSubmitting}
					className="mt-2 w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isSubmitting ? (
						<span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
					) : (
						<UserPlus size={16} />
					)}
					{isSubmitting ? "Creando..." : "Crear Prestamista"}
				</button>
			</form>
		</BottomSheet>
	);
}
