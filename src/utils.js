export function between(val, refA, refB, included = true) {
	if (refA > refB) {
		let refT = refA;
		refA = refB;
		refB = refT;
	}
	return included ? val >= refA && val <= refB : val > refA && val < refB
}

export function round(x, digits) {
	return parseFloat(x.toFixed(digits))
}

export function openWindow(url, width = 400, height = 300) {

	window.open(url, "_blank", `width=${width},height=${height}`);
}