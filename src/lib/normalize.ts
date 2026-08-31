const accentMap: Record<string, string> = {
	a: "áàâãäå",
	e: "éèêë",
	i: "íìîï",
	o: "óòôõö",
	u: "úùûü",
	n: "ñ",
	c: "ç",
};

const reverseAccentMap = new Map<string, string>();
for (const [base, accents] of Object.entries(accentMap)) {
	for (const accented of accents) {
		reverseAccentMap.set(accented, base);
	}
}

const commonAccent: Record<string, string> = {
	a: "á",
	e: "é",
	i: "í",
	o: "ó",
	u: "ú",
};

export function normalizeText(text: string): string {
	return text
		.toLowerCase()
		.split("")
		.map((char) => reverseAccentMap.get(char) ?? char)
		.join("");
}

export function buildSearchPatterns(search: string): string[] {
	const lower = search.toLowerCase();
	const base = normalizeText(lower);
	const chars = base.split("");
	const vowelPositions: number[] = [];

	for (let i = 0; i < chars.length; i++) {
		if (commonAccent[chars[i]]) {
			vowelPositions.push(i);
		}
	}

	if (vowelPositions.length === 0) return [base];

	const patterns = new Set<string>([base]);

	for (const pos of vowelPositions) {
		const accented = commonAccent[chars[pos]];
		const variant = [...chars];
		variant[pos] = accented;
		patterns.add(variant.join(""));
	}

	return [...patterns];
}
