import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { currency } from "#/lib/format";

interface ReportPDFData {
	totalLent: number;
	totalCollected: number;
	totalPending: number;
	periodLabel: string;
	periodStats: { label: string; lent: number; collected: number }[];
}

export function generateReportPDF(data: ReportPDFData) {
	const doc = new jsPDF();
	const pageWidth = doc.internal.pageSize.getWidth();

	doc.setFont("helvetica", "bold");
	doc.setFontSize(20);
	doc.text("Reporte de cobranzas", 14, 22);

	doc.setFont("helvetica", "normal");
	doc.setFontSize(12);
	doc.setTextColor(100, 116, 139);
	doc.text(
		`${data.periodLabel} - ${new Date().toLocaleDateString("es-VE")}`,
		14,
		30,
	);

	doc.setTextColor(0, 0, 0);

	const statsY = 42;
	const colWidth = (pageWidth - 28) / 3;

	const drawStat = (
		x: number,
		label: string,
		value: string,
		color: [number, number, number],
	) => {
		doc.setDrawColor(226, 232, 240);
		doc.roundedRect(x, statsY, colWidth - 4, 24, 3, 3, "S");
		doc.setFont("helvetica", "normal");
		doc.setFontSize(8);
		doc.setTextColor(100, 116, 139);
		doc.text(label.toUpperCase(), x + (colWidth - 4) / 2, statsY + 8, {
			align: "center",
		});
		doc.setFont("helvetica", "bold");
		doc.setFontSize(14);
		doc.setTextColor(...color);
		doc.text(value, x + (colWidth - 4) / 2, statsY + 18, { align: "center" });
	};

	drawStat(14, "Total prestado", currency(data.totalLent), [30, 41, 59]);
	drawStat(
		14 + colWidth,
		"Total cobrado",
		currency(data.totalCollected),
		[71, 215, 164],
	);
	drawStat(
		14 + colWidth * 2,
		"Pendiente",
		currency(data.totalPending),
		[245, 158, 11],
	);

	doc.setTextColor(0, 0, 0);

	autoTable(doc, {
		startY: statsY + 34,
		head: [["Periodo", "Prestado", "Cobrado"]],
		body: data.periodStats.map((s) => [
			s.label,
			currency(s.lent),
			currency(s.collected),
		]),
		theme: "grid",
		headStyles: {
			fontSize: 10,
			fontStyle: "bold",
			fillColor: [248, 250, 252],
			textColor: [30, 41, 59],
		},
		bodyStyles: { fontSize: 10, textColor: [30, 41, 59] },
		alternateRowStyles: { fillColor: [248, 250, 252] },
	});

	const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } })
		.lastAutoTable.finalY;

	doc.setFont("helvetica", "normal");
	doc.setFontSize(9);
	doc.setTextColor(148, 163, 184);
	doc.text(
		`Generado el ${new Date().toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric" })}`,
		pageWidth / 2,
		finalY + 16,
		{ align: "center" },
	);

	doc.save(
		`reporte-${data.periodLabel.toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`,
	);
}
