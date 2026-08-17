const currencyFormatter = new Intl.NumberFormat("es-VE", {
	style: "currency",
	currency: "USD",
});

export function currency(val?: number | null): string {
	return currencyFormatter.format(val ?? 0);
}

export function getLocalDate(d?: Date): string {
	const now = d ?? new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

const SHORT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
	day: "numeric",
	month: "short",
};

const FULL_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
	day: "numeric",
	month: "long",
	year: "numeric",
};

const WEEKDAY_SHORT_OPTIONS: Intl.DateTimeFormatOptions = {
	day: "numeric",
	weekday: "short",
};

export function formatDate(
	dateStr: string,
	opts?: Intl.DateTimeFormatOptions,
): string {
	return new Date(dateStr).toLocaleDateString(
		"es-VE",
		opts ?? FULL_DATE_OPTIONS,
	);
}

export function formatDateShort(dateStr: string): string {
	return formatDate(dateStr, SHORT_DATE_OPTIONS);
}

export function formatDateFull(dateStr: string): string {
	return formatDate(dateStr, FULL_DATE_OPTIONS);
}

export function formatDateWeekday(dateStr: string): string {
	return formatDate(dateStr, WEEKDAY_SHORT_OPTIONS);
}
