class Area {
	/**
	 * Constructor
	 * @param {string} shape the type of area
	 * @param {XY[]} coords the list of coordinates
	 * @param {string} href the link this area is going to point to
	 */
	constructor(shape, coords = [], href) {
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
		return this.coords.length >= 1;
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
	/**
	 * Constructor
	 * @param {XY[]} coords the list of coordinates
	 * @param {string} href the link this area is going to point to
	 */
	constructor(coords = [], href) {
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
		var lCoord = this.coords[1].sum(fCoord);
		return between(x, fCoord.x, lCoord.x) && between(y, fCoord.y, lCoord.y);
	}
}

class AreaCircle extends Area {
	/**
	 * Constructor
	 * @param {XY[]} coords the list of coordinates
	 * @param {number} radius radius of the circle
	 * @param {string} href the link this area is going to point to
	 */
	constructor(coords = [], radius = 0, href) {
		super("circle", coords, href);
		this.radius = radius;
		this.getCenter = this.firstCoord;
	}

	updateLastCoord(x, y) {
		var center = this.getCenter();
		this.radius = XY.dist(center, new XY(x , y));
	}
}
class AreaPoly extends Area {
	/**
	 * Constructor
	 * @param {XY[]} coords the list of coordinates
	 * @param {string} href the link this area is going to point to
	 */
	constructor(coords = [], href) {
		super("poly", coords, href);
	}
}