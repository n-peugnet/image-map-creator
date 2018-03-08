function between(val, refA, refB, included = true) {
	if (refA > refB) {
		var refT = refA;
		refA = refB;
		refB = refT;
	}
	return included ? val >= refA && val <= refB : val > refA && val < refB
}

function round(x, digits) {
	return parseFloat(x.toFixed(digits))
}