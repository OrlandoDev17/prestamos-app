import {
	CreditCard,
	MapPin,
	Phone,
	Route,
	User,
	UserPlus,
	X,
} from "lucide-react";
import { useState } from "react";
import { BottomSheet } from "#/components/ui/bottom-sheet";
import { useCreateClient } from "#/queries/clients.queries";
import { useCreateRoute, useUserRoutesQuery } from "#/queries/routes.queries";

interface CreateClientSheetProps {
	isOpen: boolean;
	onClose: () => void;
}

export function CreateClientSheet({ isOpen, onClose }: CreateClientSheetProps) {
	const createClient = useCreateClient();
	const { data: routes = [] } = useUserRoutesQuery();
	const createRoute = useCreateRoute();

	const [name, setName] = useState("");
	const [cedula, setCedula] = useState("");
	const [phone, setPhone] = useState("");
	const [address, setAddress] = useState("");
	const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
	const [newRouteInput, setNewRouteInput] = useState("");
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const resetForm = () => {
		setName("");
		setCedula("");
		setPhone("");
		setAddress("");
		setSelectedRoute(null);
		setNewRouteInput("");
		setErrorMsg(null);
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMsg(null);

		try {
			let routeToSave = selectedRoute;

			if (newRouteInput.trim() && !selectedRoute) {
				const routeId = await createRoute.mutateAsync(newRouteInput);
				if (routeId) {
					routeToSave = newRouteInput.trim();
				}
			}

			await createClient.mutateAsync({
				full_name: name,
				cedula,
				phone,
				address,
				route: routeToSave,
			});
			handleClose();
		} catch (err) {
			setErrorMsg(
				err instanceof Error ? err.message : "Error al crear cliente",
			);
		}
	};

	const handleSelectRoute = (routeName: string) => {
		setSelectedRoute(selectedRoute === routeName ? null : routeName);
		setNewRouteInput("");
	};

	const handleNewRouteInputChange = (value: string) => {
		setNewRouteInput(value);
		if (value.trim()) {
			setSelectedRoute(null);
		}
	};

	const filteredRoutes = newRouteInput.trim()
		? routes.filter((r) =>
				r.name.toLowerCase().includes(newRouteInput.toLowerCase()),
			)
		: routes;

	return (
		<BottomSheet isOpen={isOpen} onClose={handleClose}>
			<h2 className="text-lg font-bold mb-1">Crear Cliente</h2>
			<p className="text-text-muted text-sm mb-6">
				Ingrese los datos del nuevo cliente.
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
							placeholder="Ej. Maria Garcia"
							required
							className="w-full bg-background pl-10 pr-4 py-3 rounded-lg text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
						/>
						<User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
					</div>
				</label>

				<label className="flex flex-col gap-1.5">
					<span className="text-sm font-medium">Cedula de Identidad</span>
					<div className="relative">
						<input
							type="text"
							value={cedula}
							onChange={(e) => setCedula(e.target.value)}
							placeholder="Ej. 12345678"
							required
							className="w-full bg-background pl-10 pr-4 py-3 rounded-lg text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
						/>
						<CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
					</div>
				</label>

				<label className="flex flex-col gap-1.5">
					<span className="text-sm font-medium">Telefono</span>
					<div className="relative">
						<input
							type="tel"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							placeholder="Ej. 0412-1234567"
							required
							className="w-full bg-background pl-10 pr-4 py-3 rounded-lg text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
						/>
						<Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
					</div>
				</label>

				<label className="flex flex-col gap-1.5">
					<span className="text-sm font-medium">Direccion</span>
					<div className="relative">
						<input
							type="text"
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							placeholder="Ej. Av. Principal, Edif. 5, Piso 2"
							required
							className="w-full bg-background pl-10 pr-4 py-3 rounded-lg text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
						/>
						<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
					</div>
				</label>

				<label className="flex flex-col gap-1.5">
					<span className="text-sm font-medium">
						Ruta <span className="text-text-muted font-normal">(opcional)</span>
					</span>
					<div className="relative">
						<input
							type="text"
							value={selectedRoute ?? newRouteInput}
							onChange={(e) => handleNewRouteInputChange(e.target.value)}
							placeholder="Ej. Charallave"
							className="w-full bg-background pl-10 pr-4 py-3 rounded-lg text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
						/>
						<Route className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
						{selectedRoute && (
							<button
								type="button"
								onClick={() => {
									setSelectedRoute(null);
									setNewRouteInput("");
								}}
								className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-text-muted hover:text-text-main transition-colors cursor-pointer"
							>
								<X size={16} />
							</button>
						)}
					</div>
				</label>

				{filteredRoutes.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{filteredRoutes.map((r) => (
							<button
								key={r.id}
								type="button"
								onClick={() => handleSelectRoute(r.name)}
								className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
									selectedRoute === r.name
										? "bg-primary text-white"
										: "bg-primary/10 text-primary-dark hover:bg-primary/20"
								}`}
							>
								{r.name}
							</button>
						))}
					</div>
				)}

				{routes.length === 0 && !newRouteInput.trim() && (
					<p className="text-xs text-text-muted">
						Escribe una ruta para guardarla y reutilizarla despues.
					</p>
				)}

				<button
					type="submit"
					disabled={createClient.isPending || createRoute.isPending}
					className="mt-2 w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{createClient.isPending || createRoute.isPending ? (
						<span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
					) : (
						<UserPlus size={16} />
					)}
					{createClient.isPending || createRoute.isPending
						? "Creando..."
						: "Crear Cliente"}
				</button>
			</form>
		</BottomSheet>
	);
}
