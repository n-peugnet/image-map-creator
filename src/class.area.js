class Area {
	/**
	 * @param {string} shape the type of area
	 * @param {XY[]} coords the list of coordinates
	 * @param {string} href the link this area is going to point to
	 */
	constructor(shape, coords = [], href) {
		this.shape = shape;
		this.coords = coords;
		this.href = href;
		this.id = 0;
	}

	/**
	 * Adds a coordinate to the coords array, and returns it's new length
	 * @param {number} x the x val of the coordinate
	 * @param {number} y the y val of the coordinate
	 */
	addCoord(x, y) {
		return this.coords.push(new XY(x, y));
	}

	updateLastCoord(x, y) {
		this.coords[this.coords.length - 1] = new XY(x, y);
	}

	move(xy) {
		let coord = this.firstCoord();
		if (coord != undefined) {
			this.coords[0] = coord.sum(xy);
		}
	}

	isValidShape() {
		return this.coords.length >= 1;
	}

	sethref(url) {
		this.href = url;
	}

	firstCoord() {
		return this.coords[0];
	}

	strCoords(scale, dec) {
		return this.coords.map(c => {
			return c.toString(scale, dec);
		}).join(',');
	}

	toHtml(scale) {
		let strCoords = this.strCoords(scale, 0);
		if (strCoords != "")
			strCoords = 'coords="' + strCoords + '" ';
		return '<area shape="' + this.shape + '" ' + strCoords + 'href="' + this.href + '"/>';
	}
}

class AreaRect extends Area {
	/**
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

	display(p5) {
		p5.rect(this.coords[0].x, this.coords[0].y, this.coords[1].x, this.coords[1].y);
	}
}

class AreaCircle extends Area {
	/**
	 * @param {XY[]} coords the list of coordinates
	 * @param {number} radius radius of the circle
	 * @param {string} href the link this area is going to point to
	 */
	constructor(coords = [], radius = 0, href) {
		super("circle", coords, href);
		this.radius = radius;
		this.getCenter = this.firstCoord;
	}

	isValidShape() {
		return super.isValidShape() && this.radius > 0;
	}

	isHover(x, y) {
		var center = this.getCenter();
		return XY.dist(new XY(x, y), center) < this.radius;
	}

	updateLastCoord(x, y) {
		var center = this.getCenter();
		this.radius = XY.dist(center, new XY(x, y));
	}

	display(p5) {
		p5.ellipse(this.getCenter().x, this.getCenter().y, this.radius * 2);
	}

	strCoords(scale, dec) {
		return this.getCenter().toString(scale, dec) + "," + round(this.radius / scale, dec);
	}
}
class AreaPoly extends Area {
	/**
	 * @param {XY[]} coords the list of coordinates
	 * @param {string} href the link this area is going to point to
	 */
	constructor(coords = [], href) {
		super("poly", coords, href);
	}
}

class AreaDefault extends Area {
	/**
	 * Constructor
	 * @param {string} href the link this area is going to point to
	 */
	constructor(href) {
		super("default", [], href);
		this.isDefault = true;
	}

	isValidShape() {
		return true;
	}

	isHover() {
		return true;
	}

	display(p5) {
		p5.rect(0, 0, p5.width - 1, p5.height - 1);
	}
}