export function round(x: number, digits: number): number {
	return parseFloat(x.toFixed(digits))
}

export function openWindow(url: string, width = 400, height = 300): void {
	window.open(url, "_blank", `width=${width},height=${height}`);
}