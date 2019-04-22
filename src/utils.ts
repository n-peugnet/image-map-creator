export function between(val: number, refA: number, refB: number, included = true): boolean {
	if (refA > refB) {
		let refT = refA;
		refA = refB;
		refB = refT;
	}
	return included ? val >= refA && val <= refB : val > refA && val < refB
}

export function round(x: number, digits: number): number {
	return parseFloat(x.toFixed(digits))
}

export function openWindow(url: string, width = 400, height = 300): void {
	window.open(url, "_blank", `width=${width},height=${height}`);
}