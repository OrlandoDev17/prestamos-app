import { Check, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "#/components/ui/avatar";
import { useClientsSearchQuery } from "#/queries/clients.queries";
import type { Client } from "#/stores/clientsStore";

interface ClientSelectorProps {
	clients: Client[];
	value: string;
	onChange: (clientId: string) => void;
}

export function ClientSelector({
	clients,
	value,
	onChange,
}: ClientSelectorProps) {
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(timer);
	}, [search]);

	const { data: searchResults = [], isLoading: searching } =
		useClientsSearchQuery(debouncedSearch);

	const displayClients = debouncedSearch.length >= 2 ? searchResults : clients;

	const filtered = displayClients.filter(
		(c) =>
			c.full_name.toLowerCase().includes(search.toLowerCase()) ||
			c.cedula.includes(search),
	);

	const selected = clients.find((c) => c.id === value);

	return (
		<div className="flex flex-col gap-3">
			<span className="text-sm font-medium">Seleccionar cliente</span>

			{selected ? (
				<button
					type="button"
					onClick={() => onChange("")}
					className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/30 rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98]"
				>
					<Avatar name={selected.full_name} size="lg" />
					<div className="flex flex-col items-start flex-1 min-w-0">
						<span className="text-sm font-semibold text-text-main truncate w-full text-left">
							{selected.full_name}
						</span>
						<span className="text-xs text-text-muted">{selected.cedula}</span>
					</div>
					<Check size={16} className="text-primary-dark shrink-0" />
				</button>
			) : (
				<>
					<div className="relative">
						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Buscar por nombre o cedula..."
							className="w-full bg-background pl-10 pr-4 py-3 rounded-xl text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
						/>
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
					</div>

					<div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
						{searching && debouncedSearch.length >= 2 && (
							<p className="text-xs text-text-muted text-center py-2">
								Buscando...
							</p>
						)}
						{!searching && filtered.length === 0 && (
							<p className="text-sm text-text-muted text-center py-4">
								No se encontraron clientes
							</p>
						)}
						{filtered.map((client) => (
							<button
								key={client.id}
								type="button"
								onClick={() => onChange(client.id)}
								className="flex items-center gap-3 p-3 bg-surface border border-text-muted/15 rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98] hover:border-text-muted/30"
							>
								<Avatar
									name={client.full_name}
									size="lg"
									className="bg-primary/70 text-primary-dark/70"
								/>
								<div className="flex flex-col items-start flex-1 min-w-0">
									<span className="text-sm font-semibold text-text-main truncate w-full text-left">
										{client.full_name}
									</span>
									<span className="text-xs text-text-muted">
										{client.cedula}
									</span>
								</div>
							</button>
						))}
					</div>
				</>
			)}
		</div>
	);
}
