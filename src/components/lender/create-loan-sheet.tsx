import { useState } from "react";
import {
	ArrowLeft,
	ArrowRight,
	Banknote,
	Calendar,
	Check,
	Percent,
	Users,
} from "lucide-react";
import { BottomSheet } from "#/components/ui/bottom-sheet";
import { useClientsStore } from "#/stores/clientsStore";
import { useLoansStore } from "#/stores/loansStore";

interface CreateLoanSheetProps {
	isOpen: boolean;
	onClose: () => void;
	preselectedClientId?: string;
}

const quickInstallments = [4, 8, 12, 24];
const quickFrequencies = [
	{ value: "semanal", label: "Semanal", days: "7 dias" },
	{ value: "quincenal", label: "Quincenal", days: "15 dias" },
	{ value: "mensual", label: "Mensual", days: "30 dias" },
];

export function CreateLoanSheet({
	isOpen,
	onClose,
	preselectedClientId,
}: CreateLoanSheetProps) {
	const clients = useClientsStore((s) => s.clients);
	const createLoan = useLoansStore((s) => s.createLoan);

	const [step, setStep] = useState(0);
	const [clientId, setClientId] = useState(preselectedClientId ?? "");
	const [amount, setAmount] = useState("");
	const [rate, setRate] = useState("0");
	const [installments, setInstallments] = useState("");
	const [frequency, setFrequency] = useState("");
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const resetForm = () => {
		setStep(0);
		setClientId(preselectedClientId ?? "");
		setAmount("");
		setRate("0");
		setInstallments("");
		setFrequency("");
		setErrorMsg(null);
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	const currency = (val: number) =>
		new Intl.NumberFormat("es-VE", {
			style: "currency",
			currency: "USD",
		}).format(val);

	const numAmount = Number.parseFloat(amount) || 0;
	const numRate = Number.parseFloat(rate) || 0;
	const numInstallments = Number.parseInt(installments, 10) || 0;
	const totalToPay = numAmount + numAmount * (numRate / 100);
	const installmentAmount = numInstallments > 0 ? totalToPay / numInstallments : 0;

	const canNext = () => {
		switch (step) {
			case 0:
				return !!clientId;
			case 1:
				return numAmount > 0;
			case 2:
				return numInstallments > 0;
			case 3:
				return !!frequency;
			default:
				return true;
		}
	};

	const handleSubmit = async () => {
		setErrorMsg(null);
		setIsSubmitting(true);

		const result = await createLoan({
			client_id: clientId,
			amount_borrowed: numAmount,
			interest_rate: numRate,
			installment_count: numInstallments,
			payment_frequency: frequency,
		});

		setIsSubmitting(false);

		if (result.success) {
			handleClose();
		} else {
			setErrorMsg(result.error ?? "Error al crear prestamo");
			setStep(4);
		}
	};

	const labels = ["Cliente", "Monto", "Cuotas", "Frecuencia", "Resumen"];

	return (
		<BottomSheet isOpen={isOpen} onClose={handleClose}>
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					{step > 0 && (
						<button
							type="button"
							onClick={() => setStep(step - 1)}
							className="p-1.5 rounded-lg hover:bg-background transition-colors cursor-pointer"
						>
							<ArrowLeft size={18} className="text-text-muted" />
						</button>
					)}
					<h2 className="text-lg font-bold">
						{step < 4 ? `Nuevo Prestamo (${labels[step]})` : "Resumen"}
					</h2>
				</div>
				<span className="text-xs text-text-muted font-medium">
					{step + 1}/5
				</span>
			</div>

			{/* Progress bar */}
			<div className="flex gap-1 mb-6">
				{labels.map((label, i) => (
					<div
						key={label}
						className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
							i <= step ? "bg-primary" : "bg-text-muted/20"
						}`}
					/>
				))}
			</div>

			{errorMsg && (
				<div className="p-3 bg-danger-bg text-danger text-sm rounded-lg mb-4">
					{errorMsg}
				</div>
			)}

			{/* Step 0: Client */}
			{step === 0 && (
				<div className="flex flex-col gap-3">
					<label className="flex flex-col gap-1.5">
						<span className="text-sm font-medium">Seleccionar cliente</span>
						<div className="relative">
							<select
								value={clientId}
								onChange={(e) => setClientId(e.target.value)}
								required
								className="w-full bg-background pl-10 pr-4 py-3 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
							>
								<option value="">Selecciona un cliente</option>
								{clients.map((c) => (
									<option key={c.id} value={c.id}>
										{c.full_name} — {c.cedula}
									</option>
								))}
							</select>
							<Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
						</div>
					</label>
				</div>
			)}

			{/* Step 1: Amount */}
			{step === 1 && (
				<div className="flex flex-col gap-4">
					<label className="flex flex-col gap-1.5">
						<span className="text-sm font-medium">Monto a prestar</span>
						<div className="relative">
							<input
								type="number"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								placeholder="0.00"
								min="0"
								step="0.01"
								required
								className="w-full bg-background pl-10 pr-4 py-3 rounded-lg text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
							/>
							<Banknote className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
						</div>
					</label>

					<label className="flex flex-col gap-1.5">
						<span className="text-sm font-medium">Tasa de interes (%)</span>
						<div className="relative">
							<input
								type="number"
								value={rate}
								onChange={(e) => setRate(e.target.value)}
								placeholder="0"
								min="0"
								max="100"
								step="0.5"
								className="w-full bg-background pl-10 pr-4 py-3 rounded-lg text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
							/>
							<Percent className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
						</div>
					</label>
				</div>
			)}

			{/* Step 2: Installments */}
			{step === 2 && (
				<div className="flex flex-col gap-4">
					<span className="text-sm font-medium">Cantidad de cuotas</span>
					<div className="grid grid-cols-4 gap-2">
						{quickInstallments.map((n) => (
							<button
								key={n}
								type="button"
								onClick={() => setInstallments(String(n))}
								className={`py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${
									installments === String(n)
										? "bg-primary text-white shadow-sm"
										: "bg-background text-text-main hover:bg-primary/10"
								}`}
							>
								{n}
							</button>
						))}
					</div>
					<label className="flex flex-col gap-1.5">
						<span className="text-xs text-text-muted">Otra cantidad</span>
						<input
							type="number"
							value={installments}
							onChange={(e) => setInstallments(e.target.value)}
							placeholder="Cantidad personalizada"
							min="1"
							className="w-full bg-background px-4 py-3 rounded-lg text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
						/>
					</label>
				</div>
			)}

			{/* Step 3: Frequency */}
			{step === 3 && (
				<div className="flex flex-col gap-3">
					<span className="text-sm font-medium">Frecuencia de pago</span>
					{quickFrequencies.map((f) => (
						<button
							key={f.value}
							type="button"
							onClick={() => setFrequency(f.value)}
							className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer active:scale-[0.98] ${
								frequency === f.value
									? "border-primary bg-primary/5 ring-2 ring-primary/20"
									: "border-text-muted/20 bg-surface hover:border-text-muted/40"
							}`}
						>
							<div className="flex items-center gap-3">
								<Calendar
									size={18}
									className={
										frequency === f.value
											? "text-primary-dark"
											: "text-text-muted"
									}
								/>
								<div className="flex flex-col items-start">
									<span className="text-sm font-semibold text-text-main">
										{f.label}
									</span>
									<span className="text-xs text-text-muted">Cada {f.days}</span>
								</div>
							</div>
							{frequency === f.value && (
								<div className="size-6 rounded-full bg-primary flex items-center justify-center">
									<Check size={14} className="text-white" strokeWidth={3} />
								</div>
							)}
						</button>
					))}
				</div>
			)}

			{/* Step 4: Summary */}
			{step === 4 && (
				<div className="flex flex-col gap-4">
					<div className="bg-background rounded-xl p-4 flex flex-col gap-3">
						<div className="flex justify-between text-sm">
							<span className="text-text-muted">Cliente</span>
							<span className="font-semibold text-text-main">
								{clients.find((c) => c.id === clientId)?.full_name ?? ""}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-text-muted">Monto prestado</span>
							<span className="font-semibold text-text-main">
								{currency(numAmount)}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-text-muted">Tasa de interes</span>
							<span className="font-semibold text-text-main">{numRate}%</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-text-muted">Cuotas</span>
							<span className="font-semibold text-text-main">
								{numInstallments}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-text-muted">Frecuencia</span>
							<span className="font-semibold text-text-main capitalize">
								{frequency}
							</span>
						</div>
						<div className="border-t border-text-muted/20 pt-3 flex justify-between text-sm">
							<span className="text-text-muted">Por cuota</span>
							<span className="font-semibold text-primary-dark">
								{currency(installmentAmount)}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-sm font-semibold text-text-main">
								Total a pagar
							</span>
							<span className="text-lg font-bold text-primary-dark">
								{currency(totalToPay)}
							</span>
						</div>
					</div>
				</div>
			)}

			{/* Navigation buttons */}
			<div className="flex gap-3 mt-6">
				{step < 4 ? (
					<button
						type="button"
						onClick={() => setStep(step + 1)}
						disabled={!canNext()}
						className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Siguiente
						<ArrowRight size={16} />
					</button>
				) : (
					<button
						type="button"
						onClick={handleSubmit}
						disabled={isSubmitting}
						className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isSubmitting && (
							<span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						)}
						{isSubmitting ? "Creando..." : "Crear Prestamo"}
					</button>
				)}
			</div>
		</BottomSheet>
	);
}
