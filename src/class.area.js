class Area {
	/**
	 * 
	 * @param {string} shape the type of area
	 * @param {XY[]} coords the list of coordinates
	 * @param {string} href the link this area is going to point to
	 */
	constructor(shape = "rect", coords = [], href = "") {
		this.shape = shape;
		this.coords = coords;
		this.href = href;
	}

	addCoord(x, y) {
		this.coords.push(new XY(x, y));
	}

	updateLastCoord(x, y) {
		if (this.shape == "rect") {
			if (this.coords.length == 2) {
				var fCoord = this.firstCoord();
				this.coords[1] = new XY(x - fCoord.x, y - fCoord.y);
			}
		}
	}

	isValidShape() {
		switch (this.shape) {
			case "rect":
				return this.coords.length == 2 && !this.coords[1].oneIsEmpty();
				break;
		
			default:
				return false
		}
	}

	sethref(url) {
		this.href = url;
	}

	setshape(type) {
		this.shape = type;
	}

	initAs(shape, x, y) {
		switch (shape) {
			case "rect":
				this.shape = shape;
				this.addCoord(x, y);
				this.addCoord(0, 0);
				break;
		}
	}

	firstCoord() {
		return this.coords[0];
	}
}