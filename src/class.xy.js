class XY {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	isEmpty() {
		return !this.x && !this.y;
	}

	oneIsEmpty() {
		return !this.x || !this.y
	}

}