class Area {
	/**
	 * Constructor
	 * @param {string} shape the type of area
	 * @param {XY[]} coords the list of coordinates
	 * @param {string} href the link this area is going to point to
	 */
	constructor(shape, coords = [], href = "http://") {
		this.shape = shape;
		this.coords = coords;
		this.href = href;
	}

	addCoord(x, y) {
		this.coords.push(new XY(x, y));
	}

	updateLastCoord(x, y) {
		this.coords[this.coords.length - 1] = new XY(x, y);
	}

	isValidShape() {
		return this.coords.length >= 2;
	}

	sethref(url) {
		this.href = url;
	}

	setshape(type) {
		this.shape = type;
	}

	firstCoord() {
		return this.coords[0];
	}
}

class AreaRect extends Area {
	constructor(coords = [], href = "http://") {
		super("rect");
		this.coords = coords.slice(0, 2);
		if (this.coords.length < 2)
			this.addCoord(0, 0);
	}

	updateLastCoord(x, y) {
		if (this.coords.length == 2) {
			var fCoord = this.firstCoord();
			this.coords[1] = new XY(x - fCoord.x, y - fCoord.y);
		}
	}

	isValidShape() {
		return this.coords.length == 2 && !this.coords[1].oneIsEmpty();
	}

	isHover(x, y) {
		var fCoord = this.firstCoord();
		var lCoord = this.coords[1].add(fCoord);
		return between(x, fCoord.x, lCoord.x) && between(y, fCoord.y, lCoord.y);
	}
}

class AreaCircle extends Area {
	constructor(coords = [], href = "http://") {
		super("circle", coords, href);
	}
}
class AreaPoly extends Area {
	constructor(coords = [], href = "http://") {
		super("poly", coords, href);
	}
}